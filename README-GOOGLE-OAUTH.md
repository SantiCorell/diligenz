# Configuración de Google OAuth

## Pasos para configurar Google OAuth

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **API de Google+** o **Google Identity API**

### 2. Crear credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Si es la primera vez, configura la pantalla de consentimiento OAuth:
   - Tipo de aplicación: **Externo**
   - Nombre de la aplicación: **Diligenz**
   - Email de soporte: tu email
   - Dominios autorizados: tu dominio (ej: `diligenz.com`)
   - Guarda y continúa

4. Crea las credenciales OAuth:
   - Tipo de aplicación: **Web application**
   - Nombre: **Diligenz Web**
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (desarrollo)
     - `https://tu-dominio.com` (producción)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (desarrollo)
     - `https://tu-dominio.com/api/auth/callback/google` (producción)

5. Copia el **Client ID** y **Client Secret**

### 3. Configurar variables de entorno

Agrega estas variables a tu archivo `.env` (desarrollo) y en Vercel (producción):

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
NEXTAUTH_SECRET=genera-una-clave-secreta-aleatoria
NEXTAUTH_URL=http://localhost:3000  # En producción: https://tu-dominio.com
```

**Para generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Ejecutar migraciones

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Instalar dependencias

```bash
npm install
```

## Funcionamiento

### Registro con Google

1. El usuario hace clic en "Continuar con Google"
2. Se redirige a Google para autenticarse
3. Google redirige de vuelta a `/api/auth/callback/google`
4. NextAuth crea automáticamente el usuario en la base de datos
5. Se establece el rol por defecto: **BUYER**
6. El usuario queda logueado automáticamente

### Inicio de sesión con Google

1. Si el usuario ya existe (por registro manual o Google), simplemente inicia sesión
2. Si el usuario tiene cuenta manual y luego usa Google, se vincula automáticamente
3. Si el usuario está bloqueado, no podrá iniciar sesión

## Notas importantes

- Los usuarios creados con Google tienen `passwordHash = null`
- El email se marca como verificado automáticamente (`emailVerified = true`)
- El rol por defecto es **BUYER**, pero los administradores pueden cambiarlo desde `/admin/users`
- Los usuarios pueden completar su perfil (teléfono, etc.) después del registro con Google
- El sistema de bloqueo también aplica a usuarios OAuth

## Troubleshooting

### Error: "Invalid client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Asegúrate de que las URLs de redirección estén configuradas correctamente en Google Console

### Error: "Redirect URI mismatch"
- Verifica que la URL de redirección en Google Console coincida exactamente con tu dominio
- En desarrollo: `http://localhost:3000/api/auth/callback/google`
- En producción: `https://tu-dominio.com/api/auth/callback/google`

### El usuario no se crea
- Verifica que las migraciones se hayan ejecutado correctamente
- Revisa los logs del servidor para ver errores de base de datos
