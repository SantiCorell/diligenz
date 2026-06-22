/**
 * Prueba conexión Google Drive. Uso: npm run drive:test
 */
import { execSync } from "node:child_process";

execSync(
  `npx --yes tsx -e "
import { isGoogleDriveConfigured } from './lib/google-drive/client.ts';
import { createClientFolder, findOrCreateSubfolder } from './lib/google-drive/client.ts';
import { parseDriveFolderId } from './lib/google-drive/folder-name.ts';

(async () => {
  if (!isGoogleDriveConfigured()) {
    console.error('✗ Faltan GOOGLE_DRIVE_CLIENT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY o GOOGLE_DRIVE_CLIENTS_FOLDER_ID en .env.local');
    process.exit(1);
  }
  const parentId = process.env.GOOGLE_DRIVE_CLIENTS_FOLDER_ID.trim();
  console.log('✓ Variables Drive configuradas');
  console.log('  Carpeta CLIENTES:', parentId);
  const testId = await createClientFolder('TEST-DILIGENZ-' + Date.now());
  console.log('✓ Carpeta de prueba creada:', testId);
  const identidadId = await findOrCreateSubfolder(testId, 'Identidad');
  console.log('✓ Subcarpeta Identidad:', identidadId);
  console.log('  URL:', 'https://drive.google.com/drive/folders/' + testId);
  console.log('');
  console.log('Borra la carpeta TEST-DILIGENZ-* en Drive si quieres.');
})().catch((e) => { console.error('✗', e.message || e); process.exit(1); });
"`,
  { stdio: "inherit", cwd: process.cwd(), env: process.env }
);
