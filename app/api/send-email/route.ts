import { sendEmailEstimate } from "@/lib/actions/emails";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await sendEmailEstimate();

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible d'envoyer l'email" },
      { status: 500 },
    );
  }
}
