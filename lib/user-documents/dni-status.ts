import { prisma } from "@/lib/prisma";

export type DniVerificationStatus = "none" | "incomplete" | "pending" | "verified";

export function getDniVerificationStatus(opts: {
  dniVerified: boolean;
  hasFront: boolean;
  hasBack: boolean;
}): DniVerificationStatus {
  if (opts.dniVerified) return "verified";
  if (opts.hasFront && opts.hasBack) return "pending";
  if (opts.hasFront || opts.hasBack) return "incomplete";
  return "none";
}

export function isDniPendingReview(opts: {
  dniVerified: boolean;
  hasFront: boolean;
  hasBack: boolean;
}): boolean {
  return getDniVerificationStatus(opts) === "pending";
}

export function dniStatusLabel(status: DniVerificationStatus): string {
  switch (status) {
    case "verified":
      return "Verificado";
    case "pending":
      return "Pendiente de verificar";
    case "incomplete":
      return "Falta anverso o reverso";
    default:
      return "Sin documento";
  }
}

export async function getUserDniPendingReview(
  userId: string,
  dniVerified: boolean
): Promise<boolean> {
  const dniDocs = await prisma.userDniDocument.findMany({
    where: { userId },
    select: { side: true },
  });
  return isDniPendingReview({
    dniVerified,
    hasFront: dniDocs.some((d) => d.side === "FRONT"),
    hasBack: dniDocs.some((d) => d.side === "BACK"),
  });
}
