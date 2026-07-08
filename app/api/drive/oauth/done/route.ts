import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { upsertEnvLocal } from "@/lib/google-drive/oauth-setup";

function readRefreshTokenFromEnvLocal() {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    const match = content.match(/^GOOGLE_DRIVE_REFRESH_TOKEN="([^"]+)"/m);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Solo disponible en desarrollo local" }, { status: 403 });
  }

  const session = await auth();
  const origin = new URL(req.url).origin;
  const email = session?.user?.email ?? "desconocida";

  const account = session?.user?.email
    ? await prisma.account.findFirst({
        where: {
          provider: "google",
          user: { email: session.user.email },
        },
        select: { refresh_token: true },
        orderBy: { id: "desc" },
      })
    : null;

  const refreshToken =
    account?.refresh_token ?? readRefreshTokenFromEnvLocal();

  if (!refreshToken) {
    return new NextResponse(
      `<h1>Sin refresh token</h1>
       <p>Cuenta actual: <strong>${email}</strong></p>
       <p>Google no devolvió un refresh token porque la app ya tenía acceso.</p>
       <ol>
         <li>En <a href="https://myaccount.google.com/permissions">Permisos de Google</a>, pulsa <strong>Eliminar todo el acceso</strong> para Diligenz/Potato App.</li>
         <li>Usa la cuenta dueña de la carpeta CLIENTES (<code>santiago.corellvidal@gmail.com</code>).</li>
         <li><a href="${origin}/api/drive/oauth/start">Repite el flujo OAuth</a>.</li>
       </ol>`,
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (account?.refresh_token) {
    upsertEnvLocal("GOOGLE_DRIVE_REFRESH_TOKEN", account.refresh_token);
  }

  return new NextResponse(
    `<h1>OK</h1>
     <p>Cuenta: <strong>${email}</strong></p>
     <p>GOOGLE_DRIVE_REFRESH_TOKEN guardado en .env.local.</p>
     <p>Drive OAuth configurado correctamente. Ejecuta <code>npm run drive:test</code>.</p>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
