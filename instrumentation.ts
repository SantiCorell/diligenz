/**
 * Se ejecuta al arrancar el servidor Next.js.
 * Rellena DATABASE_URL y DIRECT_URL desde las variables de Supabase si no están definidas,
 * para que Prisma funcione sin tener que duplicar variables en .env.
 */
export async function register() {
  if (typeof process === "undefined") return;
  if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  }
  if (!process.env.DIRECT_URL && process.env.POSTGRES_URL_NON_POOLING) {
    process.env.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING;
  }
}
