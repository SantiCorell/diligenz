import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getAccountDeletionNotifyEmail,
  sendAccountDeletedEmail,
  sendAccountDeletionRequestInternalEmail,
} from "@/lib/emails/account-deletion";

type RequestResult =
  | { ok: true; alreadyPending: boolean }
  | { ok: false; httpStatus: number; error: string };

type DeleteResult =
  | {
      httpStatus: 200;
      body: { ok: true; deleted: true; emailSent: true; notifiedEmail: string };
    }
  | {
      httpStatus: number;
      body: {
        ok: false;
        deleted: boolean;
        emailSent: false;
        error: string;
        notifiedEmail?: string;
      };
    };

function isPendingUniqueConflict(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  );
}

/**
 * El usuario autenticado pide la baja de su propia cuenta.
 * No elimina la cuenta. Si ya hay una solicitud pendiente, no crea otra ni reenvía el aviso interno.
 */
export async function requestOwnAccountDeletion(userId: string): Promise<RequestResult> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) {
    return { ok: false, httpStatus: 404, error: "Usuario no encontrado." };
  }

  const existing = await prisma.accountDeletionRequest.findFirst({
    where: { userId: user.id, status: "PENDING" },
    select: { id: true },
  });
  if (existing) {
    return { ok: true, alreadyPending: true };
  }

  try {
    await prisma.accountDeletionRequest.create({
      data: {
        userId: user.id,
        status: "PENDING",
        notifyEmail: user.email,
      },
    });
  } catch (err) {
    if (isPendingUniqueConflict(err)) {
      return { ok: true, alreadyPending: true };
    }
    throw err;
  }

  try {
    const sent = await sendAccountDeletionRequestInternalEmail({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    if (!sent) {
      console.error(
        "[account-deletion] aviso interno no enviado (SMTP no configurado) a",
        getAccountDeletionNotifyEmail()
      );
    }
  } catch (err) {
    console.error(
      "[account-deletion] aviso interno no enviado a",
      getAccountDeletionNotifyEmail(),
      err
    );
  }

  return { ok: true, alreadyPending: false };
}

/**
 * Baja real, solo invocada por un admin. Misma baja lógica que ya usa el panel:
 * cierra sesiones, marca deletedAt y libera el email. Después envía el correo al
 * email capturado antes de esa modificación.
 */
export async function deleteUserAccount(input: {
  userId: string;
  actorUserId: string;
}): Promise<DeleteResult> {
  const { userId, actorUserId } = input;
  if (!userId) {
    return {
      httpStatus: 400,
      body: { ok: false, deleted: false, emailSent: false, error: "Usuario no indicado." },
    };
  }
  if (userId === actorUserId) {
    return {
      httpStatus: 400,
      body: {
        ok: false,
        deleted: false,
        emailSent: false,
        error: "No puedes eliminar tu propia cuenta.",
      },
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, deletedAt: true, email: true, name: true },
  });
  if (!target || target.deletedAt) {
    return {
      httpStatus: 404,
      body: { ok: false, deleted: false, emailSent: false, error: "Usuario no encontrado." },
    };
  }

  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({
      where: { role: "ADMIN", deletedAt: null },
    });
    if (admins <= 1) {
      return {
        httpStatus: 400,
        body: {
          ok: false,
          deleted: false,
          emailSent: false,
          error: "No se puede eliminar el último administrador.",
        },
      };
    }
  }

  const notifyEmail = target.email;
  const notifyName = target.name;
  const freedEmail = `removed_${userId.replace(/[^a-z0-9]/gi, "")}_${Date.now()}@user-removed.invalid`;

  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: freedEmail,
      },
    }),
    prisma.accountDeletionRequest.updateMany({
      where: { userId, status: "PENDING" },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        completedById: actorUserId,
      },
    }),
  ]);

  if (!notifyEmail || notifyEmail.endsWith("@user-removed.invalid")) {
    return {
      httpStatus: 502,
      body: {
        ok: false,
        deleted: true,
        emailSent: false,
        error: "La cuenta se ha eliminado, pero no había un email válido al que avisar.",
      },
    };
  }

  let emailSent = false;
  try {
    emailSent = await sendAccountDeletedEmail({ to: notifyEmail, name: notifyName });
  } catch (err) {
    console.error("[account-deletion] correo al cliente no enviado a", notifyEmail, err);
    emailSent = false;
  }

  if (!emailSent) {
    return {
      httpStatus: 502,
      body: {
        ok: false,
        deleted: true,
        emailSent: false,
        notifiedEmail: notifyEmail,
        error: `La cuenta se ha eliminado, pero no se pudo enviar el correo a ${notifyEmail}.`,
      },
    };
  }

  return {
    httpStatus: 200,
    body: { ok: true, deleted: true, emailSent: true, notifiedEmail: notifyEmail },
  };
}
