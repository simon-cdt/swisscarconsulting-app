"use server";

import { db } from "../db";
import { EstimatePDF } from "../pdf/EstimatePDF";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { readFileSync } from "fs";
import { join } from "path";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import InvoiceIndividualEmail from "@/emails/individual/invoice";
import { mkdir, writeFile } from "fs/promises";
import { PaymentTerm } from "@/generated/prisma/enums";
import InsuranceInvoiceEmail from "@/emails/insurance/invoice";
import { format } from "date-fns";
import { VAT_RATE } from "../utils";
import EstimateIndividualEmail from "@/emails/individual/estimate";
import EstimateInsuranceEmail from "@/emails/insurance/estimate";

const resend = new Resend(process.env.RESEND_API_KEY);
const STORAGE_DIR = join(process.cwd(), "..", "storage", "invoices");

export async function sendEmailEstimate({
  estimateId,
}: {
  estimateId: string;
}) {
  try {
    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: {
        id: true,
        type: true,
        status: true,
        claimNumber: true,
        discount: true,
        items: {
          select: {
            id: true,
            type: true,
            designation: true,
            description: true,
            unitPrice: true,
            quantity: true,
            position: true,
            calculateByTime: true,
          },
        },
        intervention: {
          select: {
            id: true,
            date: true,
            description: true,
            medias: true,
            vehicule: {
              select: {
                id: true,
                brand: true,
                model: true,
                licensePlate: true,
                year: true,
                insurance: {
                  select: {
                    name: true,
                  },
                },
                client: {
                  select: {
                    id: true,
                    firstName: true,
                    name: true,
                    email: true,
                    phonePrefix: true,
                    phoneNumber: true,
                    typeClient: true,
                    companyName: true,
                    contactFirstName: true,
                    contactName: true,
                    address: true,
                    postalCode: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!estimate) {
      return {
        success: false,
        error: "Devis introuvable.",
      };
    }

    const logoPath = join(process.cwd(), "public", "logo.png");
    const logoBuffer = readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    const pdfData = {
      id: estimate.id,
      type: estimate.type,
      status: estimate.status,
      claimNumber: estimate.claimNumber,
      discount: estimate.discount,
      logoBase64,
      items: estimate.items,
      intervention: estimate.intervention,
    };

    const pdfBuffer = await renderToBuffer(
      // @ts-expect-error le composant React PDF accepte bien cette structure
      React.createElement(EstimatePDF, { data: pdfData }),
    );

    const attachments = [
      {
        filename: `devis-${estimate.id}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: "application/pdf",
      },
    ];

    const calculateSubtotal = () => {
      return estimate.items.reduce((sum, item) => {
        let itemTotal: number;

        if (item.type === "LABOR") {
          // Si calculateByTime est true ET qu'il y a une quantity (temps en minutes)
          if (item.calculateByTime && item.quantity) {
            const hoursDecimal = item.quantity / 60;
            itemTotal = item.unitPrice * hoursDecimal;
          } else {
            // Sinon, utiliser simplement le unitPrice
            itemTotal = item.unitPrice;
          }
        } else {
          itemTotal = item.unitPrice * (item.quantity ?? 0);
        }

        return sum + itemTotal;
      }, 0);
    };

    // Sous-total HT après réduction (les prix saisis sont HT)
    const calculateHt = () => {
      const subtotalHt = calculateSubtotal(); // reste inchangé : somme des unitPrice * quantity
      const discount = estimate.discount ?? 0;
      return subtotalHt * (1 - discount / 100);
    };

    // Total TTC = HT (après réduction) + TVA
    const calculateTotal = () => {
      const ht = calculateHt();
      return ht * (1 + VAT_RATE);
    };

    const { error } = await resend.emails.send({
      from: "Swiss Car Consulting SA <contact@swisscarconsulting.ch>",
      to:
        estimate.type === "INDIVIDUAL"
          ? [estimate?.intervention.vehicule.client.email || ""]
          : ["contact@swisscarconsulting.ch"],
      subject: estimateId
        ? `Devis n°${estimateId} à valider`
        : "Devis à valider",
      react:
        estimate.type === "INDIVIDUAL"
          ? EstimateIndividualEmail()
          : EstimateInsuranceEmail({
              customerFirstName:
                estimate.intervention.vehicule.client.contactFirstName || "",
              customerLastName:
                estimate.intervention.vehicule.client.contactName || "",
              customerAddress:
                estimate.intervention.vehicule.client.address || "",
              customerPostalCode:
                estimate.intervention.vehicule.client.postalCode?.toString() ||
                "",
              customerCity: estimate.intervention.vehicule.client.city || "",
              quoteNumber: estimate.id,
              quoteAmount: calculateTotal().toFixed(2),
              claimNumber: estimate.claimNumber?.toString() || "",
              insuranceName:
                estimate.intervention.vehicule.insurance?.name || undefined,
              vehicle: `${estimate.intervention.vehicule.brand} ${estimate.intervention.vehicule.model}`,
              registration: estimate.intervention.vehicule.licensePlate,
              clientType: estimate.intervention.vehicule.client.typeClient,
              customerCompanyName:
                estimate.intervention.vehicule.client.companyName || undefined,
            }),
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: "L'envoi de l'email a échoué. Veuillez réessayer.",
      };
    }

    return {
      success: true,
      message: "Le devis a été envoyé à tous les destinataires.",
    };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "Quelque chose s'est mal passé. Veuillez réessayer.",
    };
  }
}

export async function sendEmailInvoice({
  estimateId,
  paymentTerm,
}: {
  estimateId: string;
  paymentTerm?: PaymentTerm;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, message: "Utilisateur non authentifié." };
    }

    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: {
        id: true,
        type: true,
        claimNumber: true,
        status: true,
        discount: true,
        items: {
          select: {
            id: true,
            type: true,
            designation: true,
            description: true,
            unitPrice: true,
            quantity: true,
            position: true,
            calculateByTime: true,
          },
        },
        intervention: {
          select: {
            id: true,
            date: true,
            description: true,
            medias: true,
            vehicule: {
              select: {
                id: true,
                brand: true,
                model: true,
                licensePlate: true,
                year: true,
                insurance: {
                  select: {
                    name: true,
                  },
                },
                client: {
                  select: {
                    id: true,
                    firstName: true,
                    name: true,
                    email: true,
                    phonePrefix: true,
                    phoneNumber: true,
                    typeClient: true,
                    companyName: true,
                    contactFirstName: true,
                    contactName: true,
                    address: true,
                    postalCode: true,
                    city: true,
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!estimate) {
      return { success: false, message: "Devis introuvable." };
    }

    if (estimate.status !== "SENT_TO_GARAGE") {
      return {
        success: false,
        message: "Seuls les devis envoyés au garage peuvent être facturés.",
      };
    }

    const logoPath = join(process.cwd(), "public", "logo.png");
    const logoBuffer = readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    const pdfData = {
      id: estimate.id,
      type: estimate.type,
      status: "FINISHED",
      claimNumber: estimate.claimNumber,
      discount: estimate.discount,
      logoBase64,
      items: estimate.items,
      intervention: estimate.intervention,
      paymentTerm: paymentTerm || "DAYS_15",
    };

    const pdfBuffer = await renderToBuffer(
      // @ts-expect-error le composant React PDF accepte bien cette structure
      React.createElement(EstimatePDF, { data: pdfData }),
    );

    const finalBuffer = Buffer.from(pdfBuffer);

    // --- Enregistrement local du PDF dans storage/invoices ---
    const pdfFilename = `facture-${estimate.id}-${Date.now()}.pdf`;
    await mkdir(STORAGE_DIR, { recursive: true });
    await writeFile(join(STORAGE_DIR, pdfFilename), finalBuffer);
    // -----------------------------------------------------------

    const attachments = [
      {
        filename: `facture-${estimate.id}.pdf`,
        content: finalBuffer,
        contentType: "application/pdf",
      },
    ];

    const calculateSubtotal = () => {
      return estimate.items.reduce((sum, item) => {
        let itemTotal: number;

        if (item.type === "LABOR") {
          // Si calculateByTime est true ET qu'il y a une quantity (temps en minutes)
          if (item.calculateByTime && item.quantity) {
            const hoursDecimal = item.quantity / 60;
            itemTotal = item.unitPrice * hoursDecimal;
          } else {
            // Sinon, utiliser simplement le unitPrice
            itemTotal = item.unitPrice;
          }
        } else {
          itemTotal = item.unitPrice * (item.quantity ?? 0);
        }

        return sum + itemTotal;
      }, 0);
    };

    // Sous-total HT après réduction (les prix saisis sont HT)
    const calculateHt = () => {
      const subtotalHt = calculateSubtotal(); // reste inchangé : somme des unitPrice * quantity
      const discount = estimate.discount ?? 0;
      return subtotalHt * (1 - discount / 100);
    };

    // Total TTC = HT (après réduction) + TVA
    const calculateTotal = () => {
      const ht = calculateHt();
      return ht * (1 + VAT_RATE);
    };

    const { error } = await resend.emails.send({
      from: "Swiss Car Consulting SA <contact@swisscarconsulting.ch>",
      to:
        estimate.type === "INDIVIDUAL"
          ? [estimate?.intervention.vehicule.client.email || ""]
          : ["contact@swisscarconsulting.ch"],
      subject: estimateId ? `Facture n°${estimateId}` : "Facture à régler",
      react:
        estimate.type === "INDIVIDUAL"
          ? InvoiceIndividualEmail({ paymentTerm: paymentTerm || "DAYS_15" })
          : InsuranceInvoiceEmail({
              customerFirstName:
                estimate.intervention.vehicule.client.contactFirstName || "",
              customerLastName:
                estimate.intervention.vehicule.client.contactName || "",
              customerAddress:
                estimate.intervention.vehicule.client.address || "",
              customerPostalCode:
                estimate.intervention.vehicule.client.postalCode?.toString() ||
                "",
              customerCity: estimate.intervention.vehicule.client.city || "",
              claimNumber: estimate.claimNumber?.toString() || "",
              invoiceNumber: estimate.id,
              invoiceDate: format(new Date(), "dd/MM/yyyy"),
              amount: calculateTotal().toFixed(2),
              insuranceName:
                estimate.intervention.vehicule.insurance?.name || undefined,
              vehicle: `${estimate.intervention.vehicule.brand} ${estimate.intervention.vehicule.model}`,
              registration: estimate.intervention.vehicule.licensePlate,
              clientType: estimate.intervention.vehicule.client.typeClient,
              customerCompanyName:
                estimate.intervention.vehicule.client.companyName || undefined,
            }),
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: "L'envoi de l'email a échoué. Veuillez réessayer.",
      };
    }

    await db.invoice.create({
      data: {
        estimateId: estimate.id,
        typeEstimate: estimate.type,
        claimNumber: estimate.claimNumber,

        estimateItems: JSON.stringify(estimate.items),

        interventionId: estimate.intervention.id,
        interventionDate: estimate.intervention.date,
        description: estimate.intervention.description,
        medias: estimate.intervention.medias,

        vehiculeId: estimate.intervention.vehicule.id,
        brand: estimate.intervention.vehicule.brand,
        model: estimate.intervention.vehicule.model,
        licensePlate: estimate.intervention.vehicule.licensePlate,
        year: estimate.intervention.vehicule.year,

        clientId: estimate.intervention.vehicule.client.id,
        typeClient: estimate.intervention.vehicule.client.typeClient,
        companyName: estimate.intervention.vehicule.client.companyName,
        name:
          estimate.intervention.vehicule.client.name ||
          estimate.intervention.vehicule.client.contactName ||
          "",
        firstName:
          estimate.intervention.vehicule.client.firstName ||
          estimate.intervention.vehicule.client.contactFirstName ||
          "",
        email: estimate.intervention.vehicule.client.email,
        phonePrefix: estimate.intervention.vehicule.client.phonePrefix,
        phoneNumber: estimate.intervention.vehicule.client.phoneNumber,
        address: estimate.intervention.vehicule.client.address,
        postalCode: estimate.intervention.vehicule.client.postalCode,
        city: estimate.intervention.vehicule.client.city,

        pdfUrl: pdfFilename,
        paymentTerm,
      },
    });

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        status: "FINISHED",
      },
    });

    return { success: true, message: "La facture a bien été créée." };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "Quelque chose s'est mal passé. Veuillez réessayer.",
    };
  }
}
