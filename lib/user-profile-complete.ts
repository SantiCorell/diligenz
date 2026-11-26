/**
 * Perfil completo de un usuario que ya existe (está registrado).
 * Hace falta el mandato/NDA firmado y un enlace guardado de la carpeta Drive
 * y del DNI. "DNI verificado" no cuenta: un admin lo marca después de revisar
 * el documento.
 */
export function isUserProfileComplete(user: {
  ndaSigned: boolean;
  documentsDriveFolderUrl?: string | null;
  dniLinkUrl?: string | null;
}): boolean {
  return (
    Boolean(user.ndaSigned) &&
    Boolean(user.documentsDriveFolderUrl?.trim()) &&
    Boolean(user.dniLinkUrl?.trim())
  );
}
