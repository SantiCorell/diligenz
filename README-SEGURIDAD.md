# Guía de Seguridad para Producción

## Configuración para Vercel

### 1. Variables de Entorno

Configura las siguientes variables en el panel de Vercel:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
NODE_ENV=production
```

**⚠️ IMPORTANTE:** 
- Usa una base de datos PostgreSQL en producción (no SQLite)
- Vercel ofrece integración con Postgres o puedes usar servicios como Supabase, Neon, etc.

### 2. Migración de Base de Datos

Ejecuta las migraciones en producción:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Características de Seguridad Implementadas

#### Rate Limiting
- **Login**: Máximo 5 intentos por 15 minutos por IP
- **Registro**: Máximo 3 registros por hora por IP
- **Solicitudes de información**: Máximo 10 por minuto por usuario
- **Formularios de contacto**: Máximo 5 por hora por IP
- **Límite diario de solicitudes**: 20 solicitudes de información por usuario por día

#### Bloqueo de Usuarios
- Los administradores pueden bloquear usuarios desde `/admin/users`
- Opciones de bloqueo:
  - 1 hora
  - 24 horas
  - Permanente
- Los usuarios bloqueados no pueden:
  - Iniciar sesión
  - Solicitar información de empresas
  - Enviar formularios de contacto

#### Validación de Inputs
- Sanitización de todos los inputs de texto
- Validación de emails y teléfonos
- Límites de longitud en todos los campos
- Prevención de XSS básica

#### Headers de Seguridad
- `X-Frame-Options: DENY` - Previene clickjacking
- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Protección XSS
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (en producción)
- `Permissions-Policy` - Restringe geolocalización, micrófono, cámara

#### Cookies Seguras
- `httpOnly: true` - No accesibles desde JavaScript
- `secure: true` - Solo HTTPS en producción
- `sameSite: lax` - Protección CSRF básica

### 4. Monitoreo de Abuso

#### Señales de Abuso Automáticas
- Si un usuario excede el límite de rate limiting en solicitudes de información, se bloquea automáticamente por 1 hora
- Los administradores pueden ver todas las solicitudes en `/admin/actions` y bloquear usuarios manualmente

#### Recomendaciones
1. Revisa regularmente `/admin/actions` para detectar patrones sospechosos
2. Monitorea `/admin/users` para usuarios bloqueados
3. Considera implementar alertas por email para bloqueos automáticos

### 5. Mejoras Futuras Recomendadas

- [ ] Integrar Redis para rate limiting distribuido (si usas múltiples instancias)
- [ ] Implementar CAPTCHA en formularios públicos
- [ ] Agregar logging de seguridad
- [ ] Implementar 2FA para administradores
- [ ] Configurar alertas de seguridad
- [ ] Implementar backup automático de base de datos

### 6. Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos PostgreSQL configurada
- [ ] Migraciones ejecutadas (`npx prisma migrate deploy`)
- [ ] `NODE_ENV=production` configurado
- [ ] HTTPS habilitado (automático en Vercel)
- [ ] Revisar logs de errores después del deploy
- [ ] Probar rate limiting en producción
- [ ] Verificar que los headers de seguridad se aplican

### 7. Comandos Útiles

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones en producción
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Abrir Prisma Studio (solo desarrollo)
npx prisma studio
```

## Soporte

Si encuentras problemas de seguridad, contacta al equipo de desarrollo inmediatamente.
