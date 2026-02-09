# Instrucciones después de instalar dependencias

## ✅ Pasos completados
- ✅ Dependencias instaladas (`npm install`)
- ⚠️ Hay 1 vulnerabilidad de alta severidad (revisar abajo)

## 🔧 Próximos pasos

### 1. Revisar y solucionar vulnerabilidad

Ejecuta:
```bash
npm audit
```

Para ver detalles de la vulnerabilidad, y luego:
```bash
npm audit fix
```

Si `npm audit fix` no la soluciona automáticamente, puedes intentar:
```bash
npm audit fix --force
```

**Nota:** `--force` puede actualizar dependencias de forma más agresiva, revisa los cambios antes de hacer commit.

### 2. Ejecutar migraciones de base de datos

Las migraciones necesarias están listas. Ejecuta:

```bash
npx prisma migrate dev
```

O si prefieres aplicar solo las nuevas migraciones:
```bash
npx prisma migrate deploy
npx prisma generate
```

Esto creará las tablas necesarias para OAuth:
- `Account` (para cuentas OAuth)
- `Session` (para sesiones de NextAuth)
- `VerificationToken` (para tokens de verificación)
- Actualizará `User` con campos OAuth

### 3. Configurar variables de entorno

Asegúrate de tener estas variables en tu `.env`:

```env
# Google OAuth (obtener desde Google Cloud Console)
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret

# NextAuth
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Base de datos (ya deberías tenerla)
DATABASE_URL="file:./dev.db"
```

**Para generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Probar la autenticación con Google

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:3000/login` o `http://localhost:3000/register`

3. Haz clic en "Continuar con Google"

4. Deberías ser redirigido a Google para autenticarte

5. Después de autenticarte, serás redirigido de vuelta y estarás logueado

### 5. Configurar Google OAuth (si aún no lo has hecho)

Sigue las instrucciones en `README-GOOGLE-OAUTH.md`:
- Crear proyecto en Google Cloud Console
- Habilitar Google Identity API
- Crear credenciales OAuth 2.0
- Configurar URLs de redirección

## 🔍 Verificar que todo funciona

Después de completar los pasos anteriores:

1. ✅ El botón "Continuar con Google" aparece en login y registro
2. ✅ Al hacer clic, redirige a Google
3. ✅ Después de autenticarse, crea/usuario y lo loguea
4. ✅ El usuario puede acceder al dashboard
5. ✅ Los usuarios OAuth tienen rol BUYER por defecto
6. ✅ Los usuarios OAuth tienen `emailVerified = true`

## ⚠️ Notas importantes

- Los usuarios creados con Google **no tienen contraseña** (`passwordHash = null`)
- Si un usuario tiene cuenta manual y luego usa Google, se vinculan automáticamente
- El sistema de bloqueo también aplica a usuarios OAuth
- Los administradores pueden cambiar el rol de usuarios OAuth desde `/admin/users`

## 🐛 Troubleshooting

### Error: "Invalid client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Asegúrate de que las URLs de redirección estén configuradas en Google Console

### Error: "Redirect URI mismatch"
- Verifica que la URL en Google Console sea exactamente: `http://localhost:3000/api/auth/callback/google`
- En producción será: `https://tu-dominio.com/api/auth/callback/google`

### Error de migración
- Si hay errores, revisa que la base de datos esté accesible
- Puedes resetear las migraciones con: `npx prisma migrate reset` (⚠️ borra datos)

### La vulnerabilidad no se soluciona
- Revisa qué paquete tiene la vulnerabilidad con `npm audit`
- Puede ser una dependencia transitiva que se actualizará automáticamente
- Si es crítica, considera actualizar manualmente el paquete afectado
