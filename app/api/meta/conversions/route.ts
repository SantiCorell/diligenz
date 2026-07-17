import { NextResponse } from "next/server";

/**
 * Stub Conversion API (Meta).
 *
 * Cuando actives CAPI:
 * 1. Añade META_CAPI_ACCESS_TOKEN y META_PIXEL_ID (server) en Vercel.
 * 2. Recibe { eventName, eventId, eventTime, eventSourceUrl, params, userData }.
 * 3. POST a https://graph.facebook.com/v21.0/{PIXEL_ID}/events con deduplicación
 *    usando el mismo event_id que el Pixel del navegador.
 *
 * Hoy responde 501 para no exponer un endpoint vacío en producción.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message:
        "Meta Conversion API aún no está activa. El Pixel del navegador ya encola eventos en window.__metaCapiQueue.",
    },
    { status: 501 }
  );
}
