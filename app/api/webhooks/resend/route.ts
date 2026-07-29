import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const webhookSecret = process.env.RESEND_WEBHOOK_SECRET!;
const NOTIFICATION_EMAIL = "contact@swisscarconsulting.ch";

interface ResendBouncedPayload {
  type: string;
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    to: string[];
    subject?: string;
    bounce?: {
      message?: string;
      type?: string;
      subType?: string;
      diagnosticCode?: string[];
    };
  };
}

export async function POST(req: NextRequest) {
  // 1. Récupérer le corps brut (obligatoire pour la vérification de signature)
  const rawBody = await req.text();

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  // 2. Vérifier la signature du webhook
  const wh = new Webhook(webhookSecret);
  let payload: ResendBouncedPayload;

  try {
    payload = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendBouncedPayload;
  } catch (err) {
    console.error("Signature webhook invalide:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 3. Traiter uniquement l'événement email.bounced
  if (payload.type !== "email.bounced") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const { data } = payload;
  const clientEmail = data.to?.[0] || "Inconnu";
  const emailId = data.email_id || "Non disponible";
  const bounceReason =
    data.bounce?.message ||
    data.bounce?.diagnosticCode?.join(", ") ||
    "Raison non spécifiée";
  const bounceType = data.bounce?.type
    ? ` (${data.bounce.type}${data.bounce.subType ? ` / ${data.bounce.subType}` : ""})`
    : "";

  const eventDate = new Date(payload.created_at);
  const formattedDate = eventDate.toLocaleString("fr-CH", {
    timeZone: "Europe/Zurich",
    dateStyle: "long",
    timeStyle: "medium",
  });

  // 4. Envoyer l'email de notification
  try {
    const { error } = await resend.emails.send({
      from: "SwissCarConsulting <contact@swisscarconsulting.ch>",
      to: [NOTIFICATION_EMAIL],
      subject: "⚠️ Échec d'envoi d'un email",
      text: [
        "Bonjour,",
        "",
        `L'email envoyé au client ${clientEmail} n'a pas pu être délivré.`,
        "",
        `Raison : ${bounceReason}${bounceType}`,
        `Date et heure : ${formattedDate}`,
        `Email ID : ${emailId}`,
        "",
        "Merci de vérifier l'adresse email du client.",
      ].join("\n"),
    });

    if (error) {
      console.error("Erreur envoi notification bounce:", error);
      return NextResponse.json(
        { error: "Notification email failed" },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("Erreur inattendue lors de l'envoi de la notification:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// Resend/Svix envoie uniquement du POST — désactiver les autres méthodes si besoin
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
