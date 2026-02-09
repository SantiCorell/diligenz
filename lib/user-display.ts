/**
 * Nombre para mostrar a partir del email (ej. santiago.corellvidal@gmail.com → Santiago).
 */
export function getDisplayName(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "Usuario";
  const part = email.split("@")[0].trim();
  if (!part) return "Usuario";
  const name = part.split(/[._]/)[0] || part;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
