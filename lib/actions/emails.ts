"use server";

import { db } from "../db";
import { EstimatePDF } from "../pdf/EstimatePDF";
import EstimateEmail from "@/emails/estimate";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { readFileSync } from "fs";
import { join } from "path";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailEstimate({
  estimateId,
}: {
  estimateId?: string;
} = {}) {
  try {
    const emails = ["simon.caudet.ge@gmail.com"];

    let attachments:
      | Array<{
          filename: string;
          content: Buffer;
          contentType: string;
        }>
      | undefined;

    if (estimateId) {
      const estimate = await db.estimate.findUnique({
        where: { id: estimateId },
        select: {
          id: true,
          type: true,
          status: true,
          claimNumber: true,
          discount: true,
          items: {
            select: {
              id: true,
              type: true,
              designation: true,
              description: true,
              unitPrice: true,
              quantity: true,
              position: true,
              calculateByTime: true,
            },
          },
          intervention: {
            select: {
              id: true,
              date: true,
              description: true,
              medias: true,
              vehicule: {
                select: {
                  id: true,
                  brand: true,
                  model: true,
                  licensePlate: true,
                  year: true,
                  client: {
                    select: {
                      id: true,
                      firstName: true,
                      name: true,
                      email: true,
                      phonePrefix: true,
                      phoneNumber: true,
                      typeClient: true,
                      companyName: true,
                      contactFirstName: true,
                      contactName: true,
                      address: true,
                      postalCode: true,
                      city: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!estimate) {
        return {
          success: false,
          error: "Devis introuvable.",
        };
      }

      const logoPath = join(process.cwd(), "public", "logo.png");
      const logoBuffer = readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

      const pdfData = {
        id: estimate.id,
        type: estimate.type,
        status: estimate.status,
        claimNumber: estimate.claimNumber,
        discount: estimate.discount,
        logoBase64,
        items: estimate.items,
        intervention: estimate.intervention,
      };

      const pdfBuffer = await renderToBuffer(
        // @ts-expect-error le composant React PDF accepte bien cette structure
        React.createElement(EstimatePDF, { data: pdfData }),
      );

      attachments = [
        {
          filename: `devis-${estimate.id}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ];
    }

    const results = await Promise.all(
      emails.map((email) =>
        resend.emails.send({
          from: "SwissCarConsulting <contact@swisscarconsulting.ch>",
          to: [email.trim()],
          subject: estimateId ? `Devis n°${estimateId}` : "Devis n°12345",
          react: EstimateEmail(),
          attachments,
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
