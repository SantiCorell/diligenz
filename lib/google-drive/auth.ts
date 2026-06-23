import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

export type DriveAuthMode = "oauth" | "service_account";

export function getDriveAuthMode(): DriveAuthMode | null {
  const folderId = process.env.GOOGLE_DRIVE_CLIENTS_FOLDER_ID?.trim();
  if (!folderId) return null;

  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (refreshToken && clientId && clientSecret) return "oauth";

  const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.trim();
  const key = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.trim();
  if (email && key) return "service_account";

  return null;
}

export function isGoogleDriveConfigured(): boolean {
  return getDriveAuthMode() !== null;
}

export function getDriveAuth(): OAuth2Client | InstanceType<typeof google.auth.JWT> {
  const mode = getDriveAuthMode();
  if (!mode) {
    throw new Error(
      "Google Drive no configurado: faltan GOOGLE_DRIVE_CLIENTS_FOLDER_ID y credenciales (cuenta de servicio u OAuth)."
    );
  }

  if (mode === "oauth") {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!.trim(),
      process.env.GOOGLE_CLIENT_SECRET!.trim()
    );
    oauth2.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN!.trim(),
    });
    return oauth2;
  }

  const subject = process.env.GOOGLE_DRIVE_IMPERSONATE_EMAIL?.trim();
  return new google.auth.JWT({
    email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL!.trim(),
    key: process.env.GOOGLE_DRIVE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
    ...(subject ? { subject } : {}),
  });
}
