import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const STORAGE_DIR = path.resolve(process.cwd(), "..", "storage");

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
const MAX_SIZE = 200 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[]; // récupère TOUS les fichiers du champ "files"

  if (!files.length) {
    return NextResponse.json(
      { success: false, error: "Aucun fichier reçu" },
      { status: 400 },
    );
  }

  await fs.mkdir(STORAGE_DIR, { recursive: true });

  const results: {
    filename: string;
    status: "ok" | "erreur";
    message?: string;
  }[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      results.push({
        filename: file.name,
        status: "erreur",
        message: "Type non autorisé",
      });
      continue;
    }
    if (file.size > MAX_SIZE) {
      results.push({
        filename: file.name,
        status: "erreur",
        message: "Fichier trop volumineux",
      });
      continue;
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = `${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await fs.writeFile(path.join(STORAGE_DIR, safeName), buffer);
      results.push({ filename: safeName, status: "ok" });
    } catch {
      results.push({
        filename: file.name,
        status: "erreur",
        message: "Échec écriture disque",
      });
    }
  }

  return NextResponse.json({ success: true, results });
}
