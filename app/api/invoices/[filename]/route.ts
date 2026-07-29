// application/app/api/invoices/[filename]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adapte le chemin à ton projet
import path from "path";
import fs from "fs/promises";

const STORAGE_DIR = path.resolve(process.cwd(), "..", "storage", "invoices");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  // Protection: seul un utilisateur connecté peut voir une facture
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { filename } = await params;
  const filePath = path.join(STORAGE_DIR, filename);

  // Sécurité: empêcher de sortir du dossier storage/invoices
  if (!filePath.startsWith(STORAGE_DIR)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // "inline" = affichage dans le navigateur au lieu du téléchargement forcé
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }
}
