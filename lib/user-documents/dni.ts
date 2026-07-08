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

export const CLOUD_ONLY_DNI_PREFIX = "cloud:";

/** En Vercel/Lambda el disco es efímero o de solo lectura; el archivo vive en Drive. */
export function useLocalDniDisk(): boolean {
  return process.env.VERCEL !== "1" && !process.env.AWS_LAMBDA_FUNCTION_NAME;
}

export function isCloudOnlyDniPath(storagePath: string): boolean {
  return storagePath.startsWith(CLOUD_ONLY_DNI_PREFIX);
}

export function isAllowedDniMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime);
}

export function dniSideFromInput(value: string): DniDocumentSide | null {
  const v = value.toLowerCase();
  if (v === "front" || v === "anverso") return "FRONT";
  if (v === "back" || v === "reverso") return "BACK";
  return null;
}

export function validateDniUpload(mimeType: string, bytes: Buffer): void {
  if (!isAllowedDniMime(mimeType)) {
    throw new Error("Formato no permitido. Usa JPG, PNG, WEBP o PDF.");
  }
  if (bytes.length > MAX_BYTES) {
    throw new Error("El archivo no puede superar 10 MB.");
  }
}

export function dniStorageDir(userId: string): string {
  return path.join(process.cwd(), "data", "user-dni", userId);
}

function dniRelativePath(storagePath: string): string {
  return isCloudOnlyDniPath(storagePath)
    ? storagePath.slice(CLOUD_ONLY_DNI_PREFIX.length)
    : storagePath;
}

export async function saveDniFile(opts: {
  userId: string;
  side: DniDocumentSide;
  originalName: string;
  mimeType: string;
  bytes: Buffer;
}): Promise<{ storagePath: string; size: number }> {
  validateDniUpload(opts.mimeType, opts.bytes);

  const safeName = opts.originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const ext = path.extname(safeName) || (opts.mimeType === "application/pdf" ? ".pdf" : ".jpg");
  const fileId = `${opts.side.toLowerCase()}-${Date.now()}`;
  const storageName = `${fileId}${ext}`;
  const relativePath = path.join(opts.userId, storageName);

  if (!useLocalDniDisk()) {
    return {
      storagePath: `${CLOUD_ONLY_DNI_PREFIX}${relativePath}`,
      size: opts.bytes.length,
    };
  }

  const dir = dniStorageDir(opts.userId);
  await mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, storageName);
  await writeFile(absolutePath, opts.bytes);

  return {
    storagePath: relativePath,
    size: opts.bytes.length,
  };
}

export function dniAbsolutePath(storagePath: string): string {
  return path.join(process.cwd(), "data", "user-dni", dniRelativePath(storagePath));
}

export async function removeDniFile(storagePath: string): Promise<void> {
  if (isCloudOnlyDniPath(storagePath)) return;
  try {
    await unlink(dniAbsolutePath(storagePath));
  } catch {
    /* ya eliminado */
  }
}
