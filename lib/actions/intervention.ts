"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "../db";

export const addIntervention = async ({
  data,
}: {
  data: {
    vehiculeId: string;
    description?: string;
    medias?: string;
  };
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: "L'intervention a bien été ajoutée.";
    }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    await db.intervention.create({
      data: {
        userId: session.user.id,
        vehiculeId: data.vehiculeId,
        description: data.description,
        medias: data.medias === "" ? null : data.medias,
      },
    });

    return {
      success: true,
      message: "L'intervention a bien été ajoutée.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const putInTrash = async ({
  interventionId,
}: {
  interventionId: string;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: "L'intervention a bien été déplacée à la corbeille.";
    }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }
    await db.intervention.update({
      where: {
        id: interventionId,
      },
      data: {
        deleted: true,
      },
    });
    return {
      success: true,
      message: "L'intervention a bien été déplacée à la corbeille.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const restoreIntervention = async ({
  interventionId,
}: {
  interventionId: string;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: "L'intervention a bien été restaurée.";
    }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }
    await db.intervention.update({
      where: {
        id: interventionId,
      },
      data: {
        deleted: false,
      },
    });
    return {
      success: true,
      message: "L'intervention a bien été restaurée.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
