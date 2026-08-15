"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";
import { InvoiceStatus } from "@/generated/prisma/enums";

export const updateInvoiceStatus = async ({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le statut de la facture a bien été mis à jour." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, message: "Utilisateur non authentifié." };
    }

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return { success: false, message: "Facture introuvable." };
    }

    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
      },
    });

    return {
      success: true,
      message: "Le statut de la facture a bien été mis à jour.",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut de la facture :",
      error,
    );
    return {
      success: false,
      message:
        "Une erreur est survenue lors de la mise à jour du statut de la facture.",
    };
  }
};
