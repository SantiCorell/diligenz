/**
 * Sincroniza carpeta Drive + DNI + mandato de un usuario existente.
 * Uso: npm run drive:sync-user -- santiago.corellvidal@gmail.com
 */
import { execSync } from "node:child_process";

const email = process.argv[2];
if (!email) {
  console.error("Uso: npm run drive:sync-user -- email@ejemplo.com");
  process.exit(1);
}

const escaped = email.replace(/'/g, "\\'");

execSync(
  `npx --yes tsx -e "
import { prisma } from './lib/prisma.ts';
import { syncAllUserDocumentsToDrive } from './lib/google-drive/sync-user-documents.ts';

(async () => {
  const user = await prisma.user.findUnique({ where: { email: '${escaped}' }, select: { id: true, email: true } });
  if (!user) { console.error('Usuario no encontrado'); process.exit(1); }
  console.log('Sincronizando', user.email, '...');
  const result = await syncAllUserDocumentsToDrive(user.id);
  console.log(JSON.stringify(result, null, 2));
  await prisma.\\$disconnect();
  process.exit(result.ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
"`,
  { stdio: "inherit", cwd: process.cwd(), env: process.env }
);
