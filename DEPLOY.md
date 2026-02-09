# Despliegue en Vercel

## 1. Subir el proyecto a Git

```bash
cd diligenz
git add .
git commit -m "Proyecto listo para producción"
git push origin main
```

Si es la primera vez: crea un repositorio en GitHub/GitLab y configura el `remote`:

```bash
git remote add origin https://github.com/TU_USUARIO/diligenz.git
git push -u origin main
```

## 2. Conectar con Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión.
2. **Add New Project** → importa el repositorio del proyecto.
3. Framework: **Next.js** (detectado automáticamente).
4. No cambies Build/Output salvo que lo necesites.

## 3. Base de datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En **SQL Editor** ejecuta todo el contenido de **`prisma/SUPABASE-EJECUTAR-TODO.sql`** (ver [SUPABASE-EJECUTAR.md](./SUPABASE-EJECUTAR.md)).
3. En Supabase → **Project Settings** → **Database** copia:
   - **Session mode** (puerto 6543) → `DATABASE_URL` (añade `?pgbouncer=true` si no viene).
   - **Direct connection** (puerto 5432) → `DIRECT_URL`.

## 4. Variables de entorno en Vercel

En el proyecto de Vercel → **Settings** → **Environment Variables** añade:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URI del pooler (Session, puerto 6543) |
| `DIRECT_URL` | URI conexión directa (puerto 5432) |
| `AUTH_SECRET` o `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL de producción, ej. `https://tu-dominio.vercel.app` (sin barra final) |
| `GOOGLE_CLIENT_ID` | Para "Continuar con Google" (ver [GOOGLE-LOGIN.md](./GOOGLE-LOGIN.md)) |
| `GOOGLE_CLIENT_SECRET` | Secret de Google OAuth |

## 5. Deploy

Haz **Redeploy** o un nuevo commit y push; Vercel desplegará automáticamente.

## 6. Checklist rápido

- [ ] Repo en Git y conectado a Vercel
- [ ] SQL de Supabase ejecutado (`prisma/SUPABASE-EJECUTAR-TODO.sql`)
- [ ] `DATABASE_URL` y `DIRECT_URL` en Vercel
- [ ] `AUTH_SECRET` y `NEXTAUTH_URL` en Vercel
- [ ] (Opcional) Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y URI de redirección en Google Console
