# Checklist para Producción

## ✅ Pre-Deploy Checklist

### 1. Base de Datos
- [ ] Migrar de SQLite a PostgreSQL (obligatorio para Vercel)
- [ ] Ejecutar todas las migraciones: `npx prisma migrate deploy`
- [ ] Generar Prisma Client: `npx prisma generate`
- [ ] Verificar que `DATABASE_URL` esté configurada en Vercel

### 2. Variables de Entorno en Vercel
Configura estas variables en el panel de Vercel:

```env
# Base de datos (PostgreSQL)
DATABASE_URL=postgresql://...

# NextAuth.js
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
NEXTAUTH_URL=https://tu-dominio.com

# Google OAuth (opcional pero recomendado)
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret

# Node Environment (Vercel lo configura automáticamente)
NODE_ENV=production
```

### 3. Google OAuth (si lo usas)
- [ ] Crear proyecto en Google Cloud Console
- [ ] Configurar URLs autorizadas en Google Console:
  - `https://tu-dominio.com`
- [ ] Configurar URLs de redirección:
  - `https://tu-dominio.com/api/auth/callback/google`
- [ ] Verificar que las credenciales estén correctas

### 4. Seguridad
- [ ] Revisar vulnerabilidades: `npm audit`
- [ ] Aplicar fixes: `npm audit fix`
- [ ] Verificar que los headers de seguridad estén activos (ya implementados en middleware)
- [ ] Verificar que las cookies sean seguras (`secure: true` en producción)

### 5. Build y Tests
- [ ] Ejecutar build local: `npm run build`
- [ ] Verificar que no haya errores de TypeScript
- [ ] Verificar que no haya errores de linting: `npm run lint`
- [ ] Probar que el servidor inicie: `npm start`

### 6. Funcionalidades Críticas
- [ ] Login con email/password funciona
- [ ] Login con Google funciona (si está configurado)
- [ ] Registro funciona
- [ ] Panel de administración accesible
- [ ] Panel de usuario accesible
- [ ] Formularios de contacto funcionan
- [ ] Rate limiting funciona
- [ ] Bloqueo de usuarios funciona

### 7. Contenido
- [ ] Verificar que todas las imágenes estén disponibles
- [ ] Verificar que los logos se vean correctamente
- [ ] Revisar textos y traducciones
- [ ] Verificar que los enlaces funcionen

### 8. Performance
- [ ] Verificar que las imágenes usen `next/image`
- [ ] Verificar que no haya recursos innecesarios
- [ ] Revisar tamaño del bundle

### 9. Monitoreo
- [ ] Configurar logs de errores (Vercel tiene logs integrados)
- [ ] Considerar agregar servicio de monitoreo (Sentry, etc.)
- [ ] Configurar alertas para errores críticos

### 10. Backup
- [ ] Configurar backup automático de base de datos
- [ ] Documentar proceso de restauración

## 🚀 Deploy en Vercel

1. **Conectar repositorio**
   - Conecta tu repositorio Git con Vercel
   - O usa `vercel` CLI

2. **Configurar proyecto**
   - Framework: Next.js
   - Build Command: `npm run build` (automático)
   - Output Directory: `.next` (automático)
   - Install Command: `npm install` (automático)

3. **Variables de entorno**
   - Agrega todas las variables del punto 2

4. **Deploy**
   - Haz push a la rama principal o usa `vercel --prod`

5. **Verificar**
   - Revisa los logs del deploy
   - Prueba todas las funcionalidades críticas
   - Verifica que las migraciones se ejecutaron

## 🔧 Post-Deploy

- [ ] Verificar que el sitio carga correctamente
- [ ] Probar login/registro
- [ ] Verificar que los emails se envíen (si aplica)
- [ ] Revisar logs de errores
- [ ] Configurar dominio personalizado (si aplica)
- [ ] Configurar SSL (automático en Vercel)

## 📝 Notas Importantes

- **SQLite NO funciona en Vercel**: Debes usar PostgreSQL, MySQL o similar
- **Variables de entorno**: Nunca commitees el archivo `.env` (ya está en `.gitignore`)
- **Migraciones**: Se ejecutan automáticamente si usas `prisma migrate deploy` en el build
- **NextAuth**: Asegúrate de que `NEXTAUTH_URL` coincida exactamente con tu dominio

## 🐛 Troubleshooting Común

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Migration not applied"
```bash
npx prisma migrate deploy
```

### Error: "Invalid NEXTAUTH_SECRET"
Genera uno nuevo:
```bash
openssl rand -base64 32
```

### Error: "Database connection failed"
- Verifica `DATABASE_URL` en Vercel
- Asegúrate de que la base de datos acepte conexiones desde Vercel
- Verifica que el formato de la URL sea correcto

### Error: "Google OAuth redirect mismatch"
- Verifica que la URL en Google Console sea exactamente: `https://tu-dominio.com/api/auth/callback/google`
- No debe tener trailing slash
- Debe usar HTTPS
