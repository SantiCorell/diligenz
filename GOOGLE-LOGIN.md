# Iniciar sesión con Google – checklist

Para que **“Continuar con Google”** funcione en local y en producción.

## 1. Variables de entorno

En **`.env`** (local) y en **Vercel → Environment Variables** (producción):

| Variable | Obligatorio | Ejemplo local | Ejemplo producción |
|----------|-------------|---------------|--------------------|
| `AUTH_SECRET` o `NEXTAUTH_SECRET` | Sí | `openssl rand -base64 32` | Mismo valor |
| `NEXTAUTH_URL` | Sí (para OAuth) | `http://localhost:3000` | `https://www.diligenz.es` (sin barra final) |
| `GOOGLE_CLIENT_ID` | Sí | ID de Google Console | Mismo |
| `GOOGLE_CLIENT_SECRET` | Sí | Secret de Google Console | Mismo |

En producción, **NEXTAUTH_URL** debe ser exactamente la URL con la que se abre la web (incluyendo `www` si usas `www.diligenz.es`).

## 2. Google Cloud Console

1. Entra en [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Elige tu proyecto (o crea uno).
3. **APIs y servicios** → **Credenciales** → **Crear credenciales** → **ID de cliente OAuth 2.0**.
4. Tipo de aplicación: **Aplicación web**.
5. En **URIs de redirección autorizados** añade **exactamente** (sin espacios, sin barra final en la ruta):
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://www.diligenz.es/api/auth/callback/google`  
     (o la URL que uses: `https://tu-dominio.vercel.app/api/auth/callback/google`).
6. Guarda y copia **ID de cliente** y **Secreto del cliente** a `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

Si la URI de redirección no coincide exactamente (dominio, http/https, path), Google devolverá error y no funcionará ni en local ni en producción.

## 3. Comprobar

- **Local:** `npm run dev` → Ir a `/login` → “Continuar con Google”. Debe abrir Google y luego volver a tu app.
- **Producción:** Misma prueba en `https://tu-dominio.com/login`. Si falla, revisa que `NEXTAUTH_URL` sea esa URL y que en Google Console esté esa misma URI de redirección.

## 4. Errores típicos

- **redirect_uri_mismatch:** La URI en Google Console no coincide con la que usa la app. Debe ser exactamente `{NEXTAUTH_URL}/api/auth/callback/google`.
- **Error 500 o “Configuration” en /login:** Falta `AUTH_SECRET`/`NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET`, o la base de datos no está accesible (revisa `DATABASE_URL`).
