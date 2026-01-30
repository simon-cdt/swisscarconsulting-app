"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "../db";

export const addIntervention = async ({
  data,
  forceCreate,
}: {
  data: {
    vehiculeId: string;
    description?: string;
    medias?: string;
  };
  forceCreate?: boolean;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "L'intervention a bien été ajoutée." }
  | { success: false; needsConfirmation: true; message: string }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    // Vérifier s'il existe déjà une intervention pour ce véhicule aujourd'hui
    if (!forceCreate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingIntervention = await db.intervention.findFirst({
        where: {
          vehiculeId: data.vehiculeId,
          date: {
            gte: today,
            lt: tomorrow,
          },
          deleted: false,
        },
      });

      if (existingIntervention) {
        return {
          success: false,
          needsConfirmation: true,
          message:
            "Une intervention existe déjà pour ce véhicule aujourd'hui. Voulez-vous continuer ?",
        };
      }
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

export const addMediasIntervention = async ({
  data,
}: {
  data: {
    interventionId: string;
    medias: string;
  };
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: "Les médias ont bien été ajoutés à l'intervention.";
    }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const intervention = await db.intervention.findUnique({
      where: {
        id: data.interventionId,
      },
      select: {
        id: true,
        medias: true,
      },
    });

    if (!intervention) {
      return { success: false, message: "Intervention non trouvée." };
    }

    let allMedias = "";
    if (!intervention?.medias || intervention.medias === "") {
      allMedias = data.medias;
    } else {
      allMedias = intervention.medias + "," + data.medias;
    }

    await db.intervention.update({
      where: {
        id: data.interventionId,
      },
      data: {
        medias: allMedias,
      },
    });
    return {
      success: true,
      message: "Les médias ont bien été ajoutés à l'intervention.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const deleteMediasIntervention = async ({
  data,
}: {
  data: {
    interventionId: string;
    mediasToDelete: string;
  };
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: "Les médias ont bien été supprimés de l'intervention.";
    }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }
    const intervention = await db.intervention.findUnique({
      where: {
        id: data.interventionId,
      },
      select: {
        id: true,
        medias: true,
      },
    });
    if (!intervention) {
      return { success: false, message: "Intervention non trouvée." };
    }

    const mediasArray = intervention.medias?.split(",") || [];
    const mediasToDeleteArray = data.mediasToDelete.split(",");

    const updatedMediasArray = mediasArray.filter(
      (media) => !mediasToDeleteArray.includes(media),
    );

    const updatedMedias = updatedMediasArray.join(",");

    await db.intervention.update({
      where: {
        id: data.interventionId,
      },
      data: {
        medias: updatedMedias === "" ? null : updatedMedias,
      },
    });
    return {
      success: true,
      message: "Les médias ont bien été supprimés de l'intervention.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
