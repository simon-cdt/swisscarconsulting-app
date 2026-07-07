import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const STORAGE_DIR = path.resolve(process.cwd(), "..", "storage");

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json(
      { success: false, error: "Aucun fichier" },
      { status: 400 },
    );
  }

  await fs.mkdir(STORAGE_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(STORAGE_DIR, safeName);

  await fs.writeFile(filePath, buffer);

  return NextResponse.json({ success: true, filename: safeName });
}
