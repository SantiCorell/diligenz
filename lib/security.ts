/**
 * Utilidades de seguridad y validación
 */

/**
 * Sanitiza strings para prevenir XSS
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }
  // Eliminar caracteres peligrosos básicos
  return input
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 1000); // Limitar longitud
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Valida formato de teléfono (básico)
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== "string" || !phone.trim()) {
    return false;
  }
  // Permitir números, espacios, +, -, ()
  const phoneRegex = /^[\d\s\+\-\(\)]{6,20}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Valida que un string tenga longitud razonable
 */
export function isValidLength(
  input: unknown,
  min: number = 1,
  max: number = 1000
): boolean {
  if (typeof input !== "string") {
    return false;
  }
  const length = input.trim().length;
  return length >= min && length <= max;
}

/**
 * Valida que un valor sea un string válido
 */
export function isString(input: unknown): input is string {
  return typeof input === "string" && input.trim().length > 0;
}

/**
 * Obtiene IP del request
 */
export function getClientIP(headers: Headers): string | null {
  // Intentar obtener IP real (útil con proxies)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return null;
}
