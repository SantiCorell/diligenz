/**
 * OAuth Drive vía NextAuth (reutiliza /api/auth/callback/google, sin nueva URI en Google Cloud).
 * Uso: npm run dev  +  npm run drive:oauth
 */
import { exec } from "node:child_process";

const startUrl = "http://localhost:3000/api/drive/oauth/start";

console.log("Asegúrate de tener npm run dev en marcha.\n");
console.log("Abriendo navegador… Si no se abre, visita:\n", startUrl, "\n");
console.log(
  "Inicia sesión con la cuenta Google dueña de la carpeta CLIENTES en Drive.\n"
);

const openCmd =
  process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
exec(`${openCmd} "${startUrl}"`, () => {});
