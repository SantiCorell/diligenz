/**
 * Prueba conexión Google Drive. Uso: npm run drive:test
 */
import { execSync } from "node:child_process";

execSync(
  `npx --yes tsx -e "
import { isGoogleDriveConfigured, createClientFolder, findOrCreateSubfolder, shareFolderWithUser, uploadFileToFolder, getFolderMetadata, getDriveAuthMode } from './lib/google-drive/client.ts';

(async () => {
  if (!isGoogleDriveConfigured()) {
    console.error('✗ Faltan GOOGLE_DRIVE_CLIENT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY o GOOGLE_DRIVE_CLIENTS_FOLDER_ID en .env.local');
    process.exit(1);
  }
  const parentId = process.env.GOOGLE_DRIVE_CLIENTS_FOLDER_ID.trim();
  const clientRole = process.env.GOOGLE_DRIVE_CLIENT_SHARE_ROLE?.trim().toLowerCase() === 'writer' ? 'writer' : 'reader';
  console.log('✓ Variables Drive configuradas');
  console.log('  Modo auth:', getDriveAuthMode());
  console.log('  Carpeta CLIENTES:', parentId);

  const parentMeta = await getFolderMetadata(parentId);
  const onSharedDrive = Boolean(parentMeta.driveId);
  console.log('  CLIENTES en unidad compartida:', onSharedDrive ? 'sí' : 'no');
  if (!onSharedDrive && getDriveAuthMode() === 'service_account' && !process.env.GOOGLE_DRIVE_IMPERSONATE_EMAIL?.trim()) {
    console.warn('  ⚠ Sin unidad compartida ni OAuth: la subida de archivos puede fallar. Ejecuta npm run drive:oauth');
  }

  const testId = await createClientFolder('TEST-DILIGENZ-' + Date.now());
  console.log('✓ Carpeta de prueba creada:', testId);

  const identidadId = await findOrCreateSubfolder(testId, 'Identidad');
  console.log('✓ Subcarpeta Identidad:', identidadId);

  const adminEmail = process.env.GOOGLE_DRIVE_ADMIN_EMAIL?.trim();
  if (adminEmail) {
    try {
      await shareFolderWithUser(testId, adminEmail, 'writer');
      console.log('✓ Carpeta compartida con admin', adminEmail, 'como writer');
    } catch (e) {
      console.warn('  ⚠ No se pudo compartir con admin:', e instanceof Error ? e.message : e);
    }
  }

  const testEmail = process.env.GOOGLE_DRIVE_TEST_EMAIL?.trim();
  if (testEmail) {
    await shareFolderWithUser(testId, testEmail, clientRole);
    console.log('✓ Carpeta compartida con', testEmail, 'como', clientRole);
  }

  const pdfBytes = Buffer.from('%PDF-1.4\\n1 0 obj<<>>endobj\\ntrailer<<>>\\n%%EOF\\n');
  try {
    const fileUrl = await uploadFileToFolder({
      folderId: identidadId,
      fileName: 'test-mandato-firmado.pdf',
      mimeType: 'application/pdf',
      content: pdfBytes,
    });
    console.log('✓ PDF de prueba subido:', fileUrl);
  } catch (uploadErr) {
    console.error('✗ Subida de archivo:', uploadErr instanceof Error ? uploadErr.message : uploadErr);
    console.log('');
    console.log('  Las carpetas y permisos funcionan; falta OAuth o unidad compartida para subir archivos.');
    process.exit(1);
  }

  if (!testEmail) {
    console.log('  (Opcional: GOOGLE_DRIVE_TEST_EMAIL para probar permisos de compartir con un cliente)');
  }

  console.log('');
  console.log('  URL carpeta:', 'https://drive.google.com/drive/folders/' + testId);
  console.log('Borra la carpeta TEST-DILIGENZ-* en Drive si quieres.');
})().catch((e) => { console.error('✗', e.message || e); process.exit(1); });
"`,
  { stdio: "inherit", cwd: process.cwd(), env: process.env }
);
