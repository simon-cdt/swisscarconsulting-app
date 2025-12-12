"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "../db";

export const addClientVehicule = async ({
  data,
}: {
  data: {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    clientId: string;
    insuranceId: string | undefined;
    chassisNumber: string | undefined;
    registrationNumber: string | undefined;
    lastExpertise: Date | undefined;
    certificateImage: string | null;
  };
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: "La voiture a bien été ajoutée.";
      vehiculeId: string;
    }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const lastVehicule = await db.vehicule.findFirst({
      where: {
        id: {
          startsWith: `${new Date().getFullYear()}-`,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const idLast = lastVehicule ? parseInt(lastVehicule.id.split("-")[1]) : 1;

    const vehicule = await db.vehicule.create({
      data: {
        id: `${new Date().getFullYear()}-${idLast + 1}`,
        brand: data.brand,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        chassisNumber: data.chassisNumber ? data.chassisNumber : null,
        registrationNumber: data.registrationNumber
          ? data.registrationNumber
          : null,
        lastExpertise: data.lastExpertise ? data.lastExpertise : null,
        certificateImage: data.certificateImage,
        client: {
          connect: {
            id: data.clientId,
          },
        },
        insurance: data.insuranceId
          ? {
              connect: {
                id: data.insuranceId,
              },
            }
          : undefined,
      },
      select: {
        id: true,
      },
    });

    return {
      success: true,
      message: "La voiture a bien été ajoutée.",
      vehiculeId: vehicule.id,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const updateVehicule = async ({
  vehiculeId,
  data,
}: {
  vehiculeId: string;
  data: {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    insuranceId: string | undefined;
    chassisNumber: string | undefined;
    registrationNumber: string | undefined;
    lastExpertise: Date | undefined;
    certificateImage: string | null;
  };
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le véhicule a bien été mis à jour." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    await db.vehicule.update({
      where: {
        id: vehiculeId,
      },
      data: {
        brand: data.brand,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        certificateImage: data.certificateImage,
        chassisNumber: data.chassisNumber ? data.chassisNumber : null,
        registrationNumber: data.registrationNumber
          ? data.registrationNumber
          : null,
        lastExpertise: data.lastExpertise ? data.lastExpertise : null,
        insurance: data.insuranceId
          ? {
              connect: {
                id: data.insuranceId,
              },
            }
          : {
              disconnect: true,
            },
      },
    });

    return {
      success: true,
      message: "Le véhicule a bien été mis à jour.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
