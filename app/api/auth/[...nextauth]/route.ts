import { handlers } from "@/auth";

/**
 * Auth.js v5: la ruta solo re-exporta los handlers.
 * Toda la configuración está en auth.ts en la raíz del proyecto.
 */
export const { GET, POST } = handlers;
