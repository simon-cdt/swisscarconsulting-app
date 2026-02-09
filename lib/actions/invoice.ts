"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";

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
        intervention: {
          select: {
            id: true,
            date: true,
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

    await db.invoice.create({
      data: {
        estimateId: estimate.id,
        typeEstimate: estimate.type,
        claimNumber: estimate.claimNumber,

        estimateItems: "",

        interventionId: estimate.intervention.id,
        interventionDate: estimate.intervention.date,

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
