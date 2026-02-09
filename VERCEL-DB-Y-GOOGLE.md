# Error "Authentication failed" con Prisma en Vercel y login con Google

## Síntomas

- En los logs de Vercel: `Authentication failed against database server, the provided database credentials for postgres are not valid`
- El login con Google no funciona (redirige o falla en silencio)

La causa suele ser la **contraseña de la base de datos** en las variables de Vercel.

## Solución 1: Contraseña sin caracteres especiales (recomendada)

1. En **Supabase** → **Project Settings** → **Database** → **Database password**: cambia la contraseña por una **sin caracteres especiales** (solo letras y números). Anótala.
2. En **Vercel** → tu proyecto → **Settings** → **Integrations** → **Supabase**: si la integración está conectada, **desconéctala y vuelve a conectar** para que Vercel vuelva a leer la nueva contraseña y actualice `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING`.
3. Si no usas la integración y has puesto las URLs a mano, en **Environment Variables** edita `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING` y sustituye la contraseña por la nueva (sin `!`, `@`, `#`, etc.).
4. Redespliega el proyecto en Vercel (Deployments → … → Redeploy).

## Solución 2: Codificar la contraseña en la URL

Si quieres mantener una contraseña con caracteres especiales, en la connection string la contraseña debe ir **codificada**:

| Carácter | Codificación |
|----------|--------------|
| `!`      | `%21`        |
| `@`      | `%40`        |
| `#`      | `%23`        |
| `$`      | `%24`        |
| `%`      | `%25`        |

Ejemplo: si la contraseña es `lolipop123.dili!.`, en la URL debe quedar algo como:
`...postgres.wxynbejleoiyroaqnova:lolipop123.dili%21.@...`

En **Vercel** → **Environment Variables** → edita `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING` y pega las URLs completas con la contraseña ya codificada (las puedes copiar desde Supabase → Database → Connection string y luego sustituir la parte de la contraseña por la versión codificada).

## Login con Google

Para que Google funcione en producción:

1. **NEXTAUTH_URL** en Vercel debe ser tu dominio: `https://www.diligenz.es` (sin barra final).
2. **NEXTAUTH_SECRET** debe estar definido (igual que en local).
3. En **Google Cloud Console** → APIs & Services → Credentials → tu cliente OAuth 2.0:
   - **Authorized redirect URIs**: debe incluir  
     `https://www.diligenz.es/api/auth/callback/google`
   - **Authorized JavaScript origins**: debe incluir  
     `https://www.diligenz.es`

Si la base de datos falla (credenciales inválidas), NextAuth no puede crear la sesión ni guardar el usuario, por eso **arreglar primero la BD suele hacer que Google vuelva a funcionar**.

## Comprobar variables en Vercel

Asegúrate de tener en **Production** (y si usas Preview, también ahí):

- `POSTGRES_PRISMA_URL` (Session pooler, puerto 6543, con `?pgbouncer=true`)
- `POSTGRES_URL_NON_POOLING` (conexión directa, puerto 5432)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` = `https://www.diligenz.es`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
