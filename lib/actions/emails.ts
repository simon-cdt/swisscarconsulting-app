"use server";

import EstimateEmail from "@/emails/estimate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailEstimate() {
  try {
    const emails = ["nina.borcard@icloud.com", "simon.caudet.ge@gmail.com"];

    const results = await Promise.all(
      emails.map((email) =>
        resend.emails.send({
          from: "SwissCarConsulting <contact@swisscarconsulting.ch>",
          to: [email.trim()],
          subject: "Devis n°12345",
          react: EstimateEmail(),
        }),
      ),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = results.find((result: any) => result.error)?.error;

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: "L'envoi de l'email a échoué. Veuillez réessayer.",
      };
    }

    return {
      success: true,
      message: "Le devis a été envoyé à tous les destinataires.",
    };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "Quelque chose s'est mal passé. Veuillez réessayer.",
    };
  }
}
