# Supabase — actualizar esquema

Para aplicar **todos los cambios de base de datos** en un proyecto Supabase que ya tiene datos:

1. Abre **Supabase Dashboard → SQL Editor → New query**.
2. Copia y pega el contenido completo de [`prisma/SUPABASE-MIGRACION-IDEMPOTENTE.sql`](./prisma/SUPABASE-MIGRACION-IDEMPOTENTE.sql).
3. Pulsa **Run**.

El script es **idempotente**: solo añade lo que falta. No borra tablas ni filas. Puedes ejecutarlo varias veces.

## Después

- Comprueba que `DATABASE_URL` en Vercel apunta al pooler de Supabase (`?pgbouncer=true`).
- Redeploy de la app.

## Base de datos nueva (vacía)

Si el proyecto no tiene tablas base (`User`, `Company`, `Deal`…), primero aplica las migraciones de Prisma contra esa base:

```bash
npm run db:push:local   # local
# o en CI/producción: prisma migrate deploy con DATABASE_URL de Supabase
```

Luego ejecuta el script idempotente por si quedara alguna columna pendiente.

## Exportar datos locales (opcional)

```bash
node scripts/export-local-to-supabase.mjs
```

Genera un SQL de INSERT en `prisma/supabase-seed-data.sql` (solo si necesitas copiar datos de desarrollo).
