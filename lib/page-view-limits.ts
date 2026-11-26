/** Estancias por debajo de este umbral no se guardan: son ruido de navegación. */
export const MIN_PAGE_DURATION_MS = 2_000;

/** Una pestaña olvidada no cuenta como horas de lectura. */
export const MAX_PAGE_DURATION_MS = 30 * 60 * 1000;

export function clampPageDuration(ms: number): number | null {
  if (!Number.isFinite(ms) || ms < MIN_PAGE_DURATION_MS) return null;
  return Math.min(Math.round(ms), MAX_PAGE_DURATION_MS);
}
