# Login 500 / 429 en producción

## Por qué daba 500

- El **login** de esta app es propio (`/api/auth/login`), no usa Supabase Auth.
- Las **Redirect URLs** de Supabase son para Supabase Auth; no afectan a este login.
- El 500 se debía a que el schema de Prisma estaba en **SQLite** y en Vercel usas **Supabase (PostgreSQL)**. Con `provider = "sqlite"` y `DATABASE_URL` de Postgres, Prisma falla.

## Cambios hechos

1. **Schema** en `prisma/schema.prisma`: `provider = "postgresql"`.
2. **Rate limit** de login: 10 intentos cada 15 min (antes 5).
3. **Mensaje de error** en desarrollo: pista si el fallo es de base de datos.

## Qué tienes que hacer en producción

1. **Aplicar el esquema en Supabase** (solo hace falta una vez):
   ```bash
   # Con DATABASE_URL apuntando a tu Supabase (en .env o export)
   npx prisma db push
   ```
   Si ya habías aplicado migraciones antes en esa base, puede que tengas que usar:
   ```bash
   npx prisma migrate deploy
   ```
   Si `migrate deploy` falla porque las migraciones antiguas son de SQLite, usa solo `prisma db push` para crear/actualizar tablas.

2. **Variables en Vercel**: que `DATABASE_URL` sea la connection string de Supabase (PostgreSQL).

3. **429**: si sigues viendo 429, espera 15 minutos o prueba desde otra red/incógnito (límite por IP).

## Local

Para desarrollo local con la misma base:
- Pon en `.env` la misma `DATABASE_URL` de Supabase (o un Postgres local).
- Ya no se usa `file:./dev.db` (SQLite); el proyecto queda solo con PostgreSQL.
