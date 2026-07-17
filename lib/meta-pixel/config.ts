/**
 * Meta Pixel — configuración pública.
 * El ID se inyecta en build vía NEXT_PUBLIC_META_PIXEL_ID (Vercel / .env.local).
 */

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1646043127222375";

/** Endpoint futuro para Conversion API (server-side). Hoy no se usa. */
export const META_CAPI_ENDPOINT = "/api/meta/conversions";

export function isMetaPixelConfigured(): boolean {
  return Boolean(META_PIXEL_ID);
}
