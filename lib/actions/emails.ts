"use server";

import { db } from "../db";
import { EstimatePDF } from "../pdf/EstimatePDF";
import EstimateEmail from "@/emails/estimate";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { readFileSync } from "fs";
import { join } from "path";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import InvoiceEmail from "@/emails/invoice";
import { mkdir, writeFile } from "fs/promises";

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

    const { error } = await resend.emails.send({
      from: "Swiss Car Consulting SA <contact@swisscarconsulting.ch>",
      to: [estimate?.intervention.vehicule.client.email || ""],
      subject: estimateId
        ? `Devis n°${estimateId} à valider`
        : "Devis à valider",
      react: EstimateEmail(),
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

export async function sendEmailInvoice({ estimateId }: { estimateId: string }) {
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

    const { error } = await resend.emails.send({
      from: "Swiss Car Consulting SA <contact@swisscarconsulting.ch>",
      to: [estimate?.intervention.vehicule.client.email || ""],
      subject: estimateId ? `Facture n°${estimateId}` : "Facture à régler",
      react: InvoiceEmail(),
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

        pdfUrl: pdfFilename, // nom du fichier stocké localement
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
