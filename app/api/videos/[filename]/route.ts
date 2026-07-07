import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";

export const runtime = "nodejs"; // obligatoire pour utiliser fs en streaming

const STORAGE_DIR = path.resolve(process.cwd(), "..", "storage");

const MIME_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const filePath = path.join(STORAGE_DIR, filename);

  if (!filePath.startsWith(STORAGE_DIR)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  let stat;
  try {
    stat = await fsPromises.stat(filePath);
  } catch {
    return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });
  }

  const fileSize = stat.size;
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const range = req.headers.get("range");

  // Pas de header Range → on renvoie le fichier entier (rare, ex: téléchargement direct)
  if (!range) {
    const fileBuffer = await fsPromises.readFile(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
      },
    });
  }

  // Parsing du header "Range: bytes=start-end"
  const CHUNK_SIZE = 10 ** 6; // 1 Mo par morceau
  const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
  const start = Number(startStr);
  const end = endStr
    ? Number(endStr)
    : Math.min(start + CHUNK_SIZE, fileSize - 1);
  const contentLength = end - start + 1;

  const stream = fs.createReadStream(filePath, { start, end });

  // Conversion du stream Node en ReadableStream (attendu par NextResponse)
  const webStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 206,
    headers: {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength.toString(),
      "Content-Type": contentType,
    },
  });
}
