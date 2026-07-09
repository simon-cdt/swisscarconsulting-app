import { sendEmailEstimate } from "@/lib/actions/emails";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const estimateId = url.searchParams.get("estimateId") ?? "0";

    const result = await sendEmailEstimate({ estimateId });

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
