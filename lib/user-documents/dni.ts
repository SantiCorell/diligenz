import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import type { DniDocumentSide } from "@prisma/client";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_BYTES = 10 * 1024 * 1024;

export function isAllowedDniMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime);
}

export function dniSideFromInput(value: string): DniDocumentSide | null {
  const v = value.toLowerCase();
  if (v === "front" || v === "anverso") return "FRONT";
  if (v === "back" || v === "reverso") return "BACK";
  return null;
}

export function dniStorageDir(userId: string): string {
  return path.join(process.cwd(), "data", "user-dni", userId);
}

export async function saveDniFile(opts: {
  userId: string;
  side: DniDocumentSide;
  originalName: string;
  mimeType: string;
  bytes: Buffer;
}): Promise<{ storagePath: string; size: number }> {
  if (!isAllowedDniMime(opts.mimeType)) {
    throw new Error("Formato no permitido. Usa JPG, PNG, WEBP o PDF.");
  }
  if (opts.bytes.length > MAX_BYTES) {
    throw new Error("El archivo no puede superar 10 MB.");
  }

  const safeName = opts.originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const ext = path.extname(safeName) || (opts.mimeType === "application/pdf" ? ".pdf" : ".jpg");
  const fileId = `${opts.side.toLowerCase()}-${Date.now()}`;
  const storageName = `${fileId}${ext}`;
  const dir = dniStorageDir(opts.userId);
  await mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, storageName);
  await writeFile(absolutePath, opts.bytes);

  return {
    storagePath: path.join(opts.userId, storageName),
    size: opts.bytes.length,
  };
}

export function dniAbsolutePath(storagePath: string): string {
  return path.join(process.cwd(), "data", "user-dni", storagePath);
}

export async function removeDniFile(storagePath: string): Promise<void> {
  try {
    await unlink(dniAbsolutePath(storagePath));
  } catch {
    /* ya eliminado */
  }
}
