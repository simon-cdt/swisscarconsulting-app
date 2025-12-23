"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";
import { ItemType } from "@/generated/prisma/enums";

export const addEstimate = async ({
  data,
}: {
  data: {
    interventionId: string;
  };
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: "Le devis a bien été créé.";
      estimateId: string;
    }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const estimate = await db.estimate.create({
      data: {
        interventionId: data.interventionId,
      },
      select: {
        id: true,
      },
    });

    return {
      success: true,
      message: "Le devis a bien été créé.",
      estimateId: estimate.id,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const updateEstimateItems = async ({
  estimateId,
  items,
}: {
  estimateId: string;
  items: Array<{
    id: string;
    type: ItemType;
    designation: string;
    description: string | null;
    unitPrice: number | null;
    quantity: number | null;
    discount: number | null;
    position: number;
  }>;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Les mises à jour ont été enregistrées." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    // Supprimer les items existants
    await db.estimateItem.deleteMany({
      where: { estimateId },
    });
    // Ajouter les nouveaux items
    for (const item of items) {
      await db.estimateItem.create({
        data: {
          estimateId,
          type: item.type,
          designation: item.designation,
          description: item.description,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          discount: item.discount,
          position: item.position,
        },
      });
    }

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        status: "DRAFT",
      },
    });

    return { success: true, message: "Les mises à jour ont été enregistrées." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
