# DILIGENZ - Marketplace de Compraventa de Empresas

Marketplace privado y seguro para comprar, vender y valorar empresas en España. Plataforma completa con autenticación, paneles de administración, gestión de usuarios y sistema de solicitudes de información.

## 🚀 Características Principales

- **Autenticación completa**: Login/registro con email y contraseña + OAuth con Google
- **Paneles personalizados**: Dashboard para compradores, vendedores y administradores
- **Gestión de empresas**: Sistema completo para publicar y gestionar empresas en venta
- **Sistema de solicitudes**: Los usuarios pueden solicitar información sobre empresas
- **Rate limiting**: Protección contra abuso en todas las APIs críticas
- **Sistema de bloqueo**: Los administradores pueden bloquear usuarios abusivos
- **Valoración instantánea**: Calculadora de valoración de empresas
- **Formularios de contacto**: Sistema completo de contacto y solicitudes
- **Blog integrado**: Sección de blog con artículos sobre M&A

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Base de datos**: Prisma + PostgreSQL (Supabase recomendado)
- **Autenticación**: NextAuth.js v5 + OAuth (Google)
- **Estilos**: Tailwind CSS 4
- **Lenguaje**: TypeScript
- **Deploy**: Vercel

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Base de datos PostgreSQL (para producción)

## 🔧 Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd diligenz
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` con `DATABASE_URL`, `DIRECT_URL` (Supabase), `AUTH_SECRET`, `NEXTAUTH_URL` y opcionalmente Google OAuth. Ver `.env.example`.

4. **Base de datos**
   - Si usas Supabase: ejecuta en SQL Editor **`prisma/SUPABASE-MIGRACION-IDEMPOTENTE.sql`** (ver [SUPABASE.md](./SUPABASE.md)).
   - Si usas migraciones locales: `npx prisma migrate dev` y `npx prisma generate`.

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🚀 Deploy en Vercel

Guía paso a paso: **[DEPLOY.md](./DEPLOY.md)** (Git, Vercel, Supabase, variables de entorno y checklist).

## 📁 Estructura del Proyecto

```
diligenz/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes (auth, admin, companies, contact, etc.)
│   ├── admin/              # Panel de administración
│   ├── dashboard/          # Paneles comprador / vendedor
│   ├── companies/          # Listado y fichas de empresas
│   ├── login/              # Login
│   └── register/           # Registro
├── components/             # Componentes React (layout, home, companies, auth)
├── lib/                    # Prisma, rate-limit, security, public-companies, etc.
├── prisma/
│   ├── schema.prisma       # Schema de base de datos
│   ├── migrations/         # Historial de migraciones
│   └── SUPABASE-MIGRACION-IDEMPOTENTE.sql   # SQL idempotente para Supabase (producción)
└── public/                 # Logos e iconos
```

**Base de datos:** Para Supabase usa **`prisma/SUPABASE-MIGRACION-IDEMPOTENTE.sql`**. Instrucciones: [SUPABASE.md](./SUPABASE.md).

## 🔐 Seguridad

El proyecto incluye múltiples capas de seguridad:

- **Rate Limiting**: Protección contra abuso en todas las APIs
- **Validación de inputs**: Sanitización y validación de todos los datos
- **Headers de seguridad**: CSP, X-Frame-Options, etc.
- **Cookies seguras**: HttpOnly, Secure, SameSite
- **Sistema de bloqueo**: Los admins pueden bloquear usuarios abusivos
- **Autenticación robusta**: NextAuth.js con OAuth

Ver [README-SEGURIDAD.md](./README-SEGURIDAD.md) para más detalles.

## 📚 Documentación

| Archivo | Contenido |
|---------|-----------|
| [DEPLOY.md](./DEPLOY.md) | Despliegue en Vercel (Git, variables, checklist) |
| [SUPABASE.md](./SUPABASE.md) | Cómo actualizar el esquema en Supabase sin perder datos |
| [GOOGLE-LOGIN.md](./GOOGLE-LOGIN.md) | Inicio de sesión con Google (variables y Google Console) |
| [README-SEGURIDAD.md](./README-SEGURIDAD.md) | Seguridad (rate limiting, validación, cookies, bloqueo) |

## 🧪 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar linter
```

## 🔑 Roles de Usuario

- **BUYER**: Compradores/inversores
- **SELLER**: Vendedores de empresas
- **ADMIN**: Administradores del sistema

## 📝 Notas

- **Producción**: Usa PostgreSQL (p. ej. Supabase). Ejecuta `prisma/SUPABASE-MIGRACION-IDEMPOTENTE.sql` en el SQL Editor.
- **Variables de entorno**: Ver `.env.example`. No subas `.env` a Git.
- **Google OAuth**: Ver [GOOGLE-LOGIN.md](./GOOGLE-LOGIN.md).

## 🐛 Troubleshooting

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Migration not applied"
```bash
npx prisma migrate deploy
```

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté correcta
- Asegúrate de que la base de datos acepte conexiones desde Vercel
- Verifica que el formato de la URL sea correcto

### Error: "Invalid NEXTAUTH_SECRET"
Genera uno nuevo:
```bash
openssl rand -base64 32
```

## 📄 Licencia

Privado - Todos los derechos reservados

## 👥 Soporte

Para soporte técnico, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para DILIGENZ**
