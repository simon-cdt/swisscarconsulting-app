"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "../db";
import { AppointmentType } from "@/generated/prisma/enums";

export const createAppointment = async ({
  data,
}: {
  data: {
    type: AppointmentType;
    clientId: string;
    vehiculeId: string;
    estimateId?: string;
    date: Date;
    time: string;
    notes?: string;
  };
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le rendez-vous a bien été créé" }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    await db.appointment.create({
      data: {
        type: data.type,
        clientId: Number(data.clientId),
        vehiculeId: data.vehiculeId,
        estimateId: data.estimateId || null,
        date: data.date,
        time: data.time,
        notes: data.notes || null,
      },
    });

    return {
      success: true,
      message: "Le rendez-vous a bien été créé",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue." };
  }
};
