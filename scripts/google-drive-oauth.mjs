/**
 * Obtiene GOOGLE_DRIVE_REFRESH_TOKEN para subir archivos al Drive del dueño de CLIENTES.
 * Uso: npm run drive:oauth
 *
 * Añade en Google Cloud → OAuth → URIs de redirección:
 *   http://localhost:8888/oauth2callback
 */
import { createServer } from "node:http";
import { google } from "googleapis";

const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const redirectUri = "http://localhost:8888/oauth2callback";

if (!clientId || !clientSecret) {
  console.error("✗ Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env.local");
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
const url = oauth2.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/drive"],
  prompt: "consent",
});

console.log("Abriendo navegador… Si no se abre, visita:\n", url, "\n");

const server = createServer(async (req, res) => {
  const reqUrl = new URL(req.url ?? "/", "http://localhost:8888");
  if (reqUrl.pathname !== "/oauth2callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = reqUrl.searchParams.get("code");
  const error = reqUrl.searchParams.get("error");
  if (error || !code) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h1>Error</h1><p>${error ?? "Sin código"}</p>`);
    server.close();
    process.exit(1);
    return;
  }

  try {
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<h1>Sin refresh token</h1><p>Revoca el acceso en myaccount.google.com/permissions y repite.</p>"
      );
      server.close();
      process.exit(1);
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>OK</h1><p>Vuelve a la terminal para copiar el token.</p>");

    console.log("\n✓ Añade esto a .env.local:\n");
    console.log(`GOOGLE_DRIVE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log("\nLuego ejecuta: npm run drive:test\n");

    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h1>Error</h1><pre>${e instanceof Error ? e.message : e}</pre>`);
    server.close();
    process.exit(1);
  }
});

server.listen(8888, () => {
  import("node:child_process").then(({ exec }) => {
    const openCmd =
      process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    exec(`${openCmd} "${url}"`, () => {});
  });
});
