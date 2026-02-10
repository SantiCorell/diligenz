# Desarrollo local — Base de datos

Si al hacer login ves **"Authentication failed... database credentials for postgres are not valid"**, la app no puede conectar con PostgreSQL. El `.env` tiene `DATABASE_URL` y `DIRECT_URL` incorrectas o la base no está accesible. Dos opciones:

---

## Opción A: PostgreSQL con Docker (recomendado para local)

1. **Levanta la base de datos**
   ```bash
   cd diligenz
   docker compose up -d
   ```

2. **En tu `.env`** pon (o añade si no están):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/diligenz"
   DIRECT_URL="postgresql://postgres:postgres@localhost:5432/diligenz"
   ```

3. **Crea las tablas**
   ```bash
   npx prisma migrate dev
   ```
   Si pide nombre de migración, puedes poner `init` o dejar el que sugiera.

4. **Reinicia el servidor** de Next.js (`npm run dev`). El login debería funcionar.

**Si `docker compose up -d` da error de credenciales de Docker:** es un problema del credential helper de Docker en tu Mac. Puedes usar la Opción B (Supabase) para local, o arreglar Docker (Keychain/credenciales) y volver a intentar.

Para crear un usuario de prueba (email + contraseña) puedes usar el script:
`node scripts/update-santiago-password.mjs` (ajusta el email en el script) o registrarte desde `/register`.

---

## Opción B: Supabase (misma DB que producción)

1. Entra en [Supabase](https://supabase.com/dashboard) → tu proyecto → **Project Settings** → **Database**.
2. Copia:
   - **Connection string** → **URI** → **Session mode** (puerto 6543) → esa es tu `DATABASE_URL` (añade `?pgbouncer=true` al final si no está).
   - **Connection string** → **URI** → **Direct connection** (puerto 5432) → esa es tu `DIRECT_URL`.
3. Sustituye `[YOUR-PASSWORD]` por la contraseña de la base de datos del proyecto (la que definiste al crear el proyecto, o reseteala en Database → Reset database password).
4. Pega ambas en tu `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.XXXXX:TU_PASSWORD@...pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.XXXXX:TU_PASSWORD@...supabase.com:5432/postgres"
   ```
5. Asegúrate de haber ejecutado el SQL de tablas en Supabase (ver [SUPABASE-EJECUTAR.md](./SUPABASE-EJECUTAR.md)).
6. Reinicia `npm run dev`.

---

## Comprobar conexión

```bash
npx prisma db pull
```

Si no da error, la conexión es correcta. Luego `npx prisma migrate dev` para aplicar migraciones si usas Docker nuevo.
