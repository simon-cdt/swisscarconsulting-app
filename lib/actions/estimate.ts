"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";
import { EstimateStatus, ItemType } from "@/generated/prisma/enums";

export const addEstimateIndividual = async ({
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

    // Générer l'ID du devis au format annee-mois-incrementation
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const yearPrefix = `${year}-`;

    // Trouver le dernier devis de l'année pour obtenir l'incrément
    const lastEstimate = await db.estimate.findFirst({
      where: {
        id: {
          startsWith: yearPrefix,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
      },
    });

    let increment = 1;
    if (lastEstimate) {
      const parts = lastEstimate.id.split("-");
      const lastIncrement = parseInt(parts[parts.length - 1]);
      increment = lastIncrement + 1;
    }

    const estimateId = `${year}-${month}-${increment}`;

    const estimate = await db.estimate.create({
      data: {
        id: estimateId,
        type: "INDIVIDUAL",
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

export const addEstimateInsurance = async ({
  data,
}: {
  data: {
    interventionId: string;
    claimNumber?: string;
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

    // Générer l'ID du devis au format annee-mois-incrementation
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const yearPrefix = `${year}-`;

    // Trouver le dernier devis de l'année pour obtenir l'incrément
    const lastEstimate = await db.estimate.findFirst({
      where: {
        id: {
          startsWith: yearPrefix,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
      },
    });

    let increment = 1;
    if (lastEstimate) {
      const parts = lastEstimate.id.split("-");
      const lastIncrement = parseInt(parts[parts.length - 1]);
      increment = lastIncrement + 1;
    }

    const estimateId = `${year}-${month}-${increment}`;

    const estimate = await db.estimate.create({
      data: {
        id: estimateId,
        type: "INSURANCE",
        interventionId: data.interventionId,
        claimNumber: data.claimNumber || null,
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

export const convertInsuranceToIndividual = async ({
  estimateId,
}: {
  estimateId: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le devis a bien été converti en individuel." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: { id: true, type: true },
    });

    if (!estimate) {
      return { success: false, message: "Devis introuvable" };
    }

    if (estimate.type !== "INSURANCE") {
      return {
        success: false,
        message: "Ce devis n'est pas un devis assurance.",
      };
    }

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        type: "INDIVIDUAL",
        claimNumber: null,
      },
    });

    return {
      success: true,
      message: "Le devis a bien été converti en individuel.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const convertIndividualToInsurance = async ({
  estimateId,
}: {
  estimateId: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le devis a bien été converti en assurance." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: { id: true, type: true },
    });

    if (!estimate) {
      return { success: false, message: "Devis introuvable" };
    }

    if (estimate.type !== "INDIVIDUAL") {
      return {
        success: false,
        message: "Ce devis n'est pas un devis individuel.",
      };
    }

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        type: "INSURANCE",
      },
    });

    return {
      success: true,
      message: "Le devis a bien été converti en assurance.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const updateClaimNumber = async ({
  estimateId,
  claimNumber,
}: {
  estimateId: string;
  claimNumber: string | null;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le numéro de sinistre a bien été modifié." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: { id: true, type: true },
    });

    if (!estimate) {
      return { success: false, message: "Devis introuvable" };
    }

    if (estimate.type !== "INSURANCE") {
      return {
        success: false,
        message:
          "Le numéro de sinistre ne peut être modifié que pour un devis assurance.",
      };
    }

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        claimNumber: claimNumber,
      },
    });

    return {
      success: true,
      message: "Le numéro de sinistre a bien été modifié.",
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
    unitPrice: number;
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

export const putInTrash = async ({
  estimateId,
}: {
  estimateId: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le devis a bien été déplacé à la corbeille." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: { id: true, status: true },
    });

    if (!estimate) {
      return { success: false, message: "Devis introuvable" };
    }

    if (estimate.status !== "DRAFT" && estimate.status !== "TODO") {
      return {
        success: false,
        message: "Ce devis ne peut pas être supprimé.",
      };
    }

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        deleted: true,
      },
    });

    return {
      success: true,
      message: "Le devis a bien été déplacé à la corbeille.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const restoreEstimate = async ({
  estimateId,
}: {
  estimateId: string;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: "Le devis a bien été restauré.";
      estimateStatus: EstimateStatus;
    }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: { id: true },
    });

    if (!estimate) {
      return { success: false, message: "Devis introuvable" };
    }

    const updatedEstimate = await db.estimate.update({
      where: { id: estimateId },
      data: {
        deleted: false,
      },
      select: { status: true },
    });

    return {
      success: true,
      message: "Le devis a bien été restauré.",
      estimateStatus: updatedEstimate.status,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const validateEstimate = async ({
  estimateId,
}: {
  estimateId: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le devis a bien été validé." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }
    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: { id: true, type: true },
    });
    if (!estimate) {
      return { success: false, message: "Devis introuvable" };
    }

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        status: estimate.type === "INDIVIDUAL" ? "PENDING" : "SENT_TO_GARAGE",
      },
    });

    return { success: true, message: "Le devis a bien été validé." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const refuseEstimate = async ({
  estimateId,
}: {
  estimateId: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le devis a bien été refusé." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: { id: true },
    });
    if (!estimate) {
      return { success: false, message: "Devis introuvable" };
    }

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        status: "DRAFT",
      },
    });
    return { success: true, message: "Le devis a bien été refusé." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const acceptEstimate = async ({
  estimateId,
}: {
  estimateId: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le devis a bien été accepté." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: { id: true },
    });

    if (!estimate) {
      return { success: false, message: "Devis introuvable" };
    }

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        status: "ACCEPTED",
      },
    });
    return { success: true, message: "Le devis a bien été accepté." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const sendEstimateToGarage = async ({
  estimateId,
}: {
  estimateId: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le devis a bien été envoyé au garage." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const estimate = await db.estimate.findUnique({
      where: { id: estimateId },
      select: { id: true },
    });

    if (!estimate) {
      return { success: false, message: "Devis introuvable" };
    }

    await db.estimate.update({
      where: { id: estimateId },
      data: {
        status: "SENT_TO_GARAGE",
      },
    });

    return { success: true, message: "Le devis a bien été envoyé au garage." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
