import { prisma } from "@/lib/prisma";

/** Asocia solicitudes de contacto ya enviadas con ese email a la cuenta recién creada. */
export async function linkServiceRequestsToUser(userId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  await prisma.contactRequest.updateMany({
    where: { email: normalized, userId: null },
    data: { userId },
  });
}
