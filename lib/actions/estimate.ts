"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";

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
    type: "PART" | "LABOR";
    description: string;
    unitPrice: number;
    quantity: number;
    discount: number | null;
    position: number;
  }>;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Les items ont bien été mis à jour." }
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

    return { success: true, message: "Les items ont bien été mis à jour." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
