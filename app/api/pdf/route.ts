import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { EstimatePDF } from "@/lib/pdf/EstimatePDF";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    // Lire le logo et le convertir en base64
    const logoPath = join(process.cwd(), "public", "logo.png");
    const logoBuffer = readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    // Ajouter le logo en base64 aux données
    const dataWithLogo = {
      ...data,
      logoBase64,
    };

    // Générer le PDF avec React PDF
    const buffer = await renderToBuffer(
      // @ts-expect-error ça fonctionne quand meme
      React.createElement(EstimatePDF, { data: dataWithLogo }),
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="devis-${data.intervention.vehicule.licensePlate}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 },
    );
  }
}
