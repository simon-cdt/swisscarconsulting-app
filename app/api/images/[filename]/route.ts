// application/app/api/images/[filename]/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const STORAGE_DIR = path.resolve(process.cwd(), "..", "storage");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  const filePath = path.join(STORAGE_DIR, filename);

  if (!filePath.startsWith(STORAGE_DIR)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1);
    return new NextResponse(fileBuffer, {
      headers: { "Content-Type": `image/${ext === "jpg" ? "jpeg" : ext}` },
    });
  } catch {
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  const filePath = path.join(STORAGE_DIR, filename);

  if (!filePath.startsWith(STORAGE_DIR)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  try {
    await fs.unlink(filePath);
    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
