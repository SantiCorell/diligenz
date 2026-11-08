/**
 * Meta Pixel — configuración pública.
 * El ID se inyecta en build vía NEXT_PUBLIC_META_PIXEL_ID (Vercel / .env.local).
 */

const configuredPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
/** Sigue definido en Vercel. Si no se ignora, el build de producción no cambia de píxel. */
const STALE_PIXEL_ID = "1646043127222375";
const AGENCY_PIXEL_ID = "1999880684037107";

export const META_PIXEL_ID =
  configuredPixelId && configuredPixelId !== STALE_PIXEL_ID
    ? configuredPixelId
    : AGENCY_PIXEL_ID;

/** Endpoint futuro para Conversion API (server-side). Hoy no se usa. */
export const META_CAPI_ENDPOINT = "/api/meta/conversions";

export function isMetaPixelConfigured(): boolean {
  return Boolean(META_PIXEL_ID);
}
