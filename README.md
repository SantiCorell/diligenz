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
- **Base de datos**: Prisma + SQLite (desarrollo) / PostgreSQL (producción)
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
   
   Edita `.env` y configura:
   ```env
   DATABASE_URL="file:./dev.db"
   NODE_ENV="development"
   NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="tu-client-id"
   GOOGLE_CLIENT_SECRET="tu-client-secret"
   ```

4. **Ejecutar migraciones**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🚀 Deploy en Vercel

### Paso 1: Preparar el repositorio

1. Asegúrate de que todos los cambios estén commiteados:
   ```bash
   git add .
   git commit -m "Preparado para producción"
   git push origin main
   ```

### Paso 2: Conectar con Vercel

1. Ve a [Vercel](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Conecta tu repositorio de GitHub/GitLab
4. Selecciona el proyecto `diligenz`

### Paso 3: Configurar Variables de Entorno

En el panel de Vercel, ve a **Settings > Environment Variables** y agrega:

```env
# Base de datos (OBLIGATORIO - usa PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# NextAuth.js (OBLIGATORIO)
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
NEXTAUTH_URL=https://tu-dominio.vercel.app

# Google OAuth (OPCIONAL pero recomendado)
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret

# Node Environment (Vercel lo configura automáticamente)
NODE_ENV=production
```

**⚠️ IMPORTANTE**: 
- `DATABASE_URL` debe ser PostgreSQL (no SQLite)
- `NEXTAUTH_URL` debe coincidir exactamente con tu dominio de Vercel
- Genera `NEXTAUTH_SECRET` con: `openssl rand -base64 32`

### Paso 4: Configurar Build Settings

Vercel detecta Next.js automáticamente, pero verifica:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

### Paso 5: Configurar Base de Datos PostgreSQL

**Opciones recomendadas:**
- **Vercel Postgres**: Integración nativa con Vercel
- **Supabase**: Gratis y fácil de configurar
- **Neon**: PostgreSQL serverless
- **Railway**: PostgreSQL con buen plan gratuito

**Después de crear la base de datos:**
1. Copia la connection string
2. Agrégala como `DATABASE_URL` en Vercel
3. Ejecuta las migraciones (ver abajo)

### Paso 6: Ejecutar Migraciones

Después del primer deploy, ejecuta las migraciones:

**Opción 1: Desde Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel link
npx prisma migrate deploy
```

**Opción 2: Desde tu máquina local**
```bash
# Configura DATABASE_URL temporalmente
export DATABASE_URL="tu-postgres-url"
npx prisma migrate deploy
npx prisma generate
```

**Opción 3: Script de build (recomendado)**
Agrega esto a `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma migrate deploy && next build"
}
```

### Paso 7: Verificar Deploy

1. Revisa los logs del build en Vercel
2. Verifica que no haya errores
3. Prueba todas las funcionalidades:
   - Login/Registro
   - Login con Google (si está configurado)
   - Panel de administración
   - Panel de usuario
   - Formularios de contacto

## 📁 Estructura del Proyecto

```
diligenz/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   ├── admin/              # Panel de administración
│   ├── dashboard/          # Paneles de usuario
│   ├── companies/          # Listado y fichas de empresas
│   ├── login/              # Página de login
│   └── register/           # Página de registro
├── components/             # Componentes React
│   ├── layout/             # Componentes de layout
│   ├── home/               # Componentes de la homepage
│   └── companies/          # Componentes de empresas
├── lib/                    # Utilidades y helpers
│   ├── prisma.ts           # Cliente de Prisma
│   ├── rate-limit.ts       # Sistema de rate limiting
│   └── security.ts          # Utilidades de seguridad
├── prisma/                 # Schema y migraciones
│   ├── schema.prisma       # Schema de base de datos
│   └── migrations/          # Migraciones SQL
└── public/                 # Archivos estáticos
```

## 🔐 Seguridad

El proyecto incluye múltiples capas de seguridad:

- **Rate Limiting**: Protección contra abuso en todas las APIs
- **Validación de inputs**: Sanitización y validación de todos los datos
- **Headers de seguridad**: CSP, X-Frame-Options, etc.
- **Cookies seguras**: HttpOnly, Secure, SameSite
- **Sistema de bloqueo**: Los admins pueden bloquear usuarios abusivos
- **Autenticación robusta**: NextAuth.js con OAuth

Ver `README-SEGURIDAD.md` para más detalles.

## 📚 Documentación Adicional

- **`README-SEGURIDAD.md`**: Guía completa de seguridad
- **`README-GOOGLE-OAUTH.md`**: Configuración de Google OAuth
- **`CHECKLIST-PRODUCCION.md`**: Checklist antes de hacer deploy
- **`INSTRUCCIONES-DESPUES-INSTALACION.md`**: Pasos post-instalación

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

## 📝 Notas Importantes

- **SQLite NO funciona en Vercel**: Debes usar PostgreSQL en producción
- **Migraciones**: Se ejecutan automáticamente si configuras el script de build
- **Variables de entorno**: Nunca commitees el archivo `.env`
- **Google OAuth**: Requiere configuración en Google Cloud Console

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
