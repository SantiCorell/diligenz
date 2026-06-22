import { google } from "googleapis";
import { driveFolderUrl } from "./folder-name";

export function isGoogleDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.trim() &&
      process.env.GOOGLE_DRIVE_PRIVATE_KEY?.trim() &&
      process.env.GOOGLE_DRIVE_CLIENTS_FOLDER_ID?.trim()
  );
}

function getDriveClient() {
  const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!.trim();
  const key = process.env.GOOGLE_DRIVE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

async function createFolderInParent(parentId: string, folderName: string): Promise<string> {
  const drive = getDriveClient();
  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });
  const id = created.data.id;
  if (!id) throw new Error("Drive no devolvió id de carpeta");
  return id;
}

export async function createClientFolder(folderName: string): Promise<string> {
  const parentId = process.env.GOOGLE_DRIVE_CLIENTS_FOLDER_ID!.trim();
  return createFolderInParent(parentId, folderName);
}

export async function findOrCreateSubfolder(parentId: string, folderName: string): Promise<string> {
  const drive = getDriveClient();
  const escaped = folderName.replace(/'/g, "\\'");
  const list = await drive.files.list({
    q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${escaped}' and trashed=false`,
    fields: "files(id)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 1,
  });
  const existing = list.data.files?.[0]?.id;
  if (existing) return existing;
  return createFolderInParent(parentId, folderName);
}

export async function shareFolderWithUser(
  folderId: string,
  email: string,
  role: "reader" | "writer" = "writer"
): Promise<void> {
  const drive = getDriveClient();
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      type: "user",
      role,
      emailAddress: email,
    },
    sendNotificationEmail: false,
    supportsAllDrives: true,
  });
}

export async function renameDriveFolder(folderId: string, newName: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.update({
    fileId: folderId,
    requestBody: { name: newName },
    supportsAllDrives: true,
  });
}

export async function uploadFileToFolder(opts: {
  folderId: string;
  fileName: string;
  mimeType: string;
  content: Buffer | Uint8Array;
}): Promise<string> {
  const drive = getDriveClient();
  const { Readable } = await import("node:stream");
  const body = Readable.from(Buffer.from(opts.content));

  const uploaded = await drive.files.create({
    requestBody: {
      name: opts.fileName,
      parents: [opts.folderId],
    },
    media: {
      mimeType: opts.mimeType,
      body,
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  const id = uploaded.data.id;
  if (!id) throw new Error("Drive no devolvió id de archivo");
  return uploaded.data.webViewLink ?? `https://drive.google.com/file/d/${id}/view`;
}

export { driveFolderUrl };
