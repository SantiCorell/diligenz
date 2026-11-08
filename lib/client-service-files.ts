import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ROOT = path.join(process.cwd(), "data", "client-services");
const ALLOWED_EXT = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx"]);

function absolutePath(storagePath: string) {
  const absolute = path.resolve(ROOT, storagePath);
  if (!absolute.startsWith(path.resolve(ROOT) + path.sep)) {
    throw new Error("Ruta de archivo no válida.");
  }
  return absolute;
}

export async function saveClientServiceFile(serviceId: string, file: File) {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error("Formato no admitido. Usa PDF, Word o una imagen.");
  }
  if (file.size <= 0 || file.size > 12 * 1024 * 1024) {
    throw new Error("El archivo tiene que pesar entre 1 byte y 12 MB.");
  }
  const storagePath = path.join(serviceId, `${randomUUID()}${ext}`);
  const absolute = absolutePath(storagePath);
  await mkdir(path.dirname(absolute), { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(absolute, bytes);
  const name = path.basename(file.name).slice(0, 180) || `documento${ext}`;
  return { storagePath, size: bytes.length, mimeType: file.type || null, name };
}

export async function readClientServiceFile(storagePath: string) {
  return readFile(absolutePath(storagePath));
}
