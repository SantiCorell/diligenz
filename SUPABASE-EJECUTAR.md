# Qué ejecutar en Supabase para que funcione la app

Sigue **una** de estas dos opciones.

---

## Opción 1: Un solo script (recomendado)

1. Entra en [Supabase Dashboard](https://supabase.com/dashboard) y abre tu proyecto.
2. Ve a **SQL Editor** → **New query**.
3. Abre el archivo **`prisma/SUPABASE-EJECUTAR-TODO.sql`** del proyecto, copia todo su contenido y pégalo en el editor.
4. Pulsa **Run** (o Ctrl+Enter).
5. Si no hay errores, la base quedará lista para la app.

Puedes ejecutar este script en una base **vacía** o en una donde ya hayas creado tablas con Prisma; usa `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` para no fallar si algo ya existe.

---

## Opción 2: Dos scripts por separado

Si prefieres usar los scripts originales:

1. **Primero:** en SQL Editor, pega y ejecuta todo el contenido de **`prisma/supabase-init.sql`**.
2. **Después:** en una nueva query, pega y ejecuta todo el contenido de **`prisma/supabase-migrations-20260209.sql`**.

---

## Después de crear las tablas

### Conectar la app

En tu **`.env`** (y en Vercel si despliegas ahí) necesitas:

- **`DATABASE_URL`**: URI del **connection pooler** (Session mode, puerto **6543**, con `?pgbouncer=true`).
- **`DIRECT_URL`**: URI de **conexión directa** (puerto **5432**).

Dónde sacarlas en Supabase:

1. **Project Settings** → **Database**.
2. **Connection string** → elige **URI**.
3. **Session mode** (puerto 6543) → esa URI es tu `DATABASE_URL`; añade al final `?pgbouncer=true` si no viene.
4. **Direct connection** (puerto 5432) → esa URI es tu `DIRECT_URL`.

Ejemplo (sustituye contraseña y referencia de proyecto):

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:TU_PASSWORD@aws-0-XX.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:TU_PASSWORD@aws-0-XX.pooler.supabase.com:5432/postgres"
```

### Opcional: datos iniciales

Si tienes un export de datos (por ejemplo **`prisma/supabase-seed-data.sql`**):

1. En Supabase → **SQL Editor** → New query.
2. Pega el contenido del archivo de seed.
3. Run.

Solo hazlo **después** de haber creado las tablas (opción 1 o 2).

---

## Resumen

| Paso | Dónde | Qué hacer |
|------|--------|-----------|
| 1 | Supabase → SQL Editor | Ejecutar **`prisma/SUPABASE-EJECUTAR-TODO.sql`** (o los dos scripts de la opción 2) |
| 2 | `.env` y Vercel | Definir **`DATABASE_URL`** y **`DIRECT_URL`** con las URIs de Supabase |
| 3 | (Opcional) SQL Editor | Ejecutar **`prisma/supabase-seed-data.sql`** si quieres datos iniciales |

Con eso, la app puede usar Supabase como base de datos sin pasos extra en el dashboard.
