import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const PREFIX = "password-reset:";
const TOKEN_TTL_MS = 60 * 60 * 1000;

export function passwordResetIdentifier(email: string): string {
  return `${PREFIX}${email.toLowerCase().trim()}`;
}

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function appBaseUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://www.diligenz.es";
  return url.replace(/\/$/, "");
}

export function buildPasswordResetUrl(email: string, token: string): string {
  const params = new URLSearchParams({
    token,
    email: email.toLowerCase().trim(),
  });
  return `${appBaseUrl()}/restablecer-contrasena?${params.toString()}`;
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const identifier = passwordResetIdentifier(email);
  const plainToken = generatePasswordResetToken();
  const hashed = hashPasswordResetToken(plainToken);
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: hashed, expires },
  });

  return plainToken;
}

export async function consumePasswordResetToken(
  email: string,
  plainToken: string
): Promise<boolean> {
  const identifier = passwordResetIdentifier(email);
  const hashed = hashPasswordResetToken(plainToken);

  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: hashed },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.deleteMany({ where: { identifier } });
    }
    return false;
  }

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  return true;
}
