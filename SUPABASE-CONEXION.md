# Generar la base de datos en Supabase y conectar la app

## 1. Crear las tablas en Supabase

### Opción A: Crear tablas desde el SQL (en Supabase)

1. Entra en tu proyecto en [Supabase](https://supabase.com/dashboard) → **SQL Editor**.
2. Crea una nueva query y pega todo el contenido del archivo **`prisma/supabase-init.sql`**.
3. Ejecuta el script (Run). Se crearán todas las tablas y tipos.
4. Configura la conexión en la app (ver más abajo).

## Opción B: Crear tablas con Prisma desde tu máquina

1. En tu **`.env`** local, pon las variables de Supabase (sustituye `TU_PASSWORD` por tu contraseña de base de datos):

```env
DATABASE_URL="postgresql://postgres.wxynbejleoiyroaqnova:TU_PASSWORD@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.wxynbejleoiyroaqnova:TU_PASSWORD@aws-1-eu-west-2.pooler.supabase.com:5432/postgres"
```

2. Desde la raíz del proyecto ejecuta:

```bash
npm run db:push
```

Eso crea o actualiza las tablas en Supabase según tu `schema.prisma`.

---

## 2. Pasar los datos de local a Supabase

Si tienes datos en la base SQLite local (`prisma/dev.db`) y quieres llevarlos a Supabase:

1. **Exportar a SQL** (desde la raíz del proyecto):
   ```bash
   npm run db:export-local
   ```
   Se genera el archivo **`prisma/supabase-seed-data.sql`** con los INSERT de User, Company, Deal, Valuation, etc.

2. **Importar en Supabase:**  
   En Supabase → **SQL Editor** → New query → pega el contenido de **`prisma/supabase-seed-data.sql`** → Run.  
   (Las tablas deben estar ya creadas con el paso 1.)

---

## 3. Conectar la app (Vercel y local)

### En Vercel

1. **Settings** → **Environment Variables**.
2. Añade (con tu contraseña real de Supabase):
   - **`DATABASE_URL`**: misma URL del pooler (puerto 6543, `?pgbouncer=true`).
   - **`DIRECT_URL`**: misma URL directa/pooler (puerto 5432).

### En local

Usa el mismo **`.env`** con `DATABASE_URL` y `DIRECT_URL` que en la opción B.

---

## Comprobar la conexión

- **Local:** `npm run dev` y prueba login/registro.
- **Producción:** despliega en Vercel; el build ya usa `DATABASE_URL` y `DIRECT_URL` del proyecto.

Si algo falla, revisa en Supabase **Settings → Database** que la contraseña y la connection string sean las que usas en `.env` y en Vercel.
