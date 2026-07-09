"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "../db";

export const checkLicensePlateExists = async ({
  licensePlate,
}: {
  licensePlate: string;
}): Promise<boolean> => {
  try {
    const vehicule = await db.vehicule.findFirst({
      where: {
        licensePlate: licensePlate.toUpperCase(),
      },
    });
    return !!vehicule;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const addClientVehicule = async ({
  data,
}: {
  data: {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    clientId: number;
    insuranceId: string | undefined;
    insuranceName?: string;
    insuranceEmail?: string;
    insurancePhone?: string;
    chassisNumber: string | undefined;
    registrationNumber: string | undefined;
    lastExpertise: Date | undefined;
    receptionType: string | undefined;
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

    if (
      data.registrationNumber &&
      (await db.vehicule.findFirst({
        where: {
          registrationNumber: data.registrationNumber.toUpperCase(),
        },
      }))
    ) {
      return {
        success: false,
        message: "Ce numéro de matricule existe déjà.",
      };
    }

    if (
      data.chassisNumber &&
      (await db.vehicule.findFirst({
        where: {
          chassisNumber: data.chassisNumber.toUpperCase(),
        },
      }))
    ) {
      return {
        success: false,
        message: "Ce numéro de chassis existe déjà.",
      };
    }

    if (
      data.receptionType &&
      (await db.vehicule.findFirst({
        where: {
          receptionType: data.receptionType,
        },
      }))
    ) {
      return {
        success: false,
        message: "Ce type de réception existe déjà.",
      };
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
        licensePlate: data.licensePlate.toUpperCase(),
        chassisNumber: data.chassisNumber
          ? data.chassisNumber.toUpperCase()
          : null,
        registrationNumber: data.registrationNumber
          ? data.registrationNumber.toUpperCase()
          : null,
        lastExpertise: data.lastExpertise ? data.lastExpertise : null,
        receptionType: data.receptionType ? data.receptionType : null,
        certificateImage: data.certificateImage,
        client: {
          connect: {
            id: data.clientId,
          },
        },
        insurance:
          data.insuranceName && data.insuranceEmail && data.insurancePhone
            ? data.insuranceName && data.insuranceEmail && data.insurancePhone
              ? {
                  create: {
                    name: data.insuranceName,
                    email: data.insuranceEmail,
                    phone: data.insurancePhone,
                  },
                }
              : {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
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
    insuranceName?: string;
    insuranceEmail?: string;
    insurancePhone?: string;
    chassisNumber: string | undefined;
    registrationNumber: string | undefined;
    lastExpertise: Date | undefined;
    receptionType: string | undefined;
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
        receptionType: data.receptionType ? data.receptionType : null,
        insurance: data.insuranceId
          ? {
              connect: {
                id: data.insuranceId,
              },
            }
          : data.insuranceName && data.insuranceEmail && data.insurancePhone
            ? {
                create: {
                  name: data.insuranceName,
                  email: data.insuranceEmail,
                  phone: data.insurancePhone,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);

    // Gestion des contraintes uniques
    if (error.code === "P2002") {
      const target = error.meta?.target?.[0];
      if (target === "chassisNumber") {
        return {
          success: false,
          message: "Ce numéro de chassis existe déjà.",
        };
      }
      if (target === "registrationNumber") {
        return {
          success: false,
          message: "Ce numéro d'immatriculation existe déjà.",
        };
      }
      if (target === "receptionType") {
        return {
          success: false,
          message: "Ce type de réception existe déjà.",
        };
      }
    }

    return { success: false, message: "Une erreur est survenue" };
  }
};
