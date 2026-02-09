# Variables de Supabase para este proyecto

Este proyecto **no usa Supabase Auth** (ni las claves `NEXT_PUBLIC_SUPABASE_*` ni `EXPO_*`). Solo usa la **base de datos PostgreSQL** de Supabase con Prisma.

## Qué necesitas en `.env` y en Vercel

Solo estas dos variables de base de datos (sustituye `TU_PASSWORD` por tu contraseña de Supabase):

```env
# Conexión con pooler (para la app) – recomendado en Vercel
DATABASE_URL="postgresql://postgres.wxynbejleoiyroaqnova:TU_PASSWORD@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexión directa (para migraciones)
DIRECT_URL="postgresql://postgres.wxynbejleoiyroaqnova:TU_PASSWORD@aws-1-eu-west-2.pooler.supabase.com:5432/postgres"
```

El resto de variables del proyecto (NextAuth, Google OAuth, etc.) siguen siendo las que ya tienes; no hace falta añadir `NEXT_PUBLIC_SUPABASE_*` ni `EXPO_*` para este repo.

## Aviso de Supabase "Not IPv4 compatible"

Si usas **Connection pooling** (puerto 6543 con `pgbouncer=true`), suele funcionar bien en Vercel aunque la conexión directa marque “Not IPv4 compatible”. Si tuvieras problemas, en Supabase puedes revisar **Pooler settings** o el add-on IPv4.

## Después de configurar

1. En local, en la raíz del proyecto: pon las dos URLs en `.env` (con tu contraseña real).
2. En Vercel: en **Settings → Environment Variables** añade `DATABASE_URL` y `DIRECT_URL` con las mismas URLs (y la misma contraseña).
3. Aplicar el esquema en Supabase (una vez):  
   `npx prisma db push`  
   o, si ya usas migraciones:  
   `npx prisma migrate deploy`
