"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { EstimatePDF } from "../pdf/EstimatePDF";
import { readFileSync } from "fs";
import { join } from "path";
import { FILE_SERVER_URL } from "../config";

export const createInvoice = async ({
  estimateId,
}: {
  estimateId: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "La facture a bien été créée." }
> => {
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
        items: {
          select: {
            id: true,
            type: true,
            designation: true,
            description: true,
            unitPrice: true,
            quantity: true,
            discount: true,
            position: true,
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
                    phone: true,
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
      return { success: false, message: "Devis introuvable." };
    }

    if (estimate.status !== "SENT_TO_GARAGE") {
      return {
        success: false,
        message: "Seuls les devis envoyés au garage peuvent être facturés.",
      };
    }

    // Générer le PDF
    let pdfUrl: string | null = null;
    try {
      // Lire le logo et le convertir en base64
      const logoPath = join(process.cwd(), "public", "logo.png");
      const logoBuffer = readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

      // Préparer les données pour le PDF
      const pdfData = {
        id: estimate.id,
        type: estimate.type,
        claimNumber: estimate.claimNumber,
        logoBase64,
        items: estimate.items,
        intervention: estimate.intervention,
      };

      // Générer le PDF
      const buffer = await renderToBuffer(
        // @ts-expect-error ça fonctionne quand meme
        React.createElement(EstimatePDF, { data: pdfData }),
      );

      // Uploader le PDF sur le serveur de fichiers
      const formData = new FormData();
      // @ts-expect-error pour éviter une erreur de type, car buffer est bien un Blob
      const pdfBlob = new Blob([buffer], { type: "application/pdf" });
      const pdfFile = new File(
        [pdfBlob],
        `facture-${estimate.id}-${Date.now()}.pdf`,
        { type: "application/pdf" },
      );
      formData.append("files", pdfFile);
      formData.append(
        "fileName",
        `facture-${estimate.id}-${estimate.intervention.vehicule.client.name || estimate.intervention.vehicule.client.companyName || ""}.pdf`,
      );

      const uploadRes = await fetch(`${FILE_SERVER_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadJson = await uploadRes.json();
        pdfUrl = uploadJson.files[0] || null;
      } else {
        console.error("Erreur lors de l'upload du PDF");
      }
    } catch (pdfError) {
      console.error("Erreur lors de la génération ou upload du PDF:", pdfError);
      // On continue même si le PDF n'a pas pu être généré
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
        phone: estimate.intervention.vehicule.client.phone,
        address: estimate.intervention.vehicule.client.address,
        postalCode: estimate.intervention.vehicule.client.postalCode,
        city: estimate.intervention.vehicule.client.city,

        pdfUrl: pdfUrl,
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
    console.error("Erreur lors de la création de la facture :", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la création de la facture.",
    };
  }
};
