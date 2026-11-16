/**
 * Prueba conexión Google Drive. Uso: npm run drive:test
 */
import { execSync } from "node:child_process";

execSync(
  `npx --yes tsx -e "
import { isGoogleDriveConfigured, getFolderMetadata, getDriveAuthMode } from './lib/google-drive/client.ts';

(async () => {
  if (!isGoogleDriveConfigured()) {
    console.error('✗ Faltan GOOGLE_DRIVE_CLIENT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY o GOOGLE_DRIVE_CLIENTS_FOLDER_ID en .env.local');
    process.exit(1);
  }
  const parentId = process.env.GOOGLE_DRIVE_CLIENTS_FOLDER_ID.trim();
  console.log('✓ Variables Drive configuradas');
  console.log('  Modo auth:', getDriveAuthMode());
  console.log('  Carpeta CLIENTES:', parentId);

  const parentMeta = await getFolderMetadata(parentId);
  const onSharedDrive = Boolean(parentMeta.driveId);
  console.log('  CLIENTES en unidad compartida:', onSharedDrive ? 'sí' : 'no');
  console.log('  Nombre:', parentMeta.name ?? '—');
  console.log('');
  console.log('La app ya no crea carpetas de Drive. Esta prueba solo comprueba que la carpeta CLIENTES se puede leer.');
  console.log('Crea las carpetas en Google Drive y enlázalas desde el admin.');
})().catch((e) => { console.error('✗', e.message || e); process.exit(1); });
"`,
  { stdio: "inherit", cwd: process.cwd(), env: process.env }
);
