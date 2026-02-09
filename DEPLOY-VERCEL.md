# 🚀 Guía de Deploy en Vercel - Paso a Paso

## ✅ Checklist Pre-Deploy

Antes de hacer deploy, asegúrate de:

- [ ] Todos los cambios están commiteados y pusheados
- [ ] No hay errores de linting (`npm run lint`)
- [ ] El build funciona localmente (`npm run build`)
- [ ] Tienes una base de datos PostgreSQL lista
- [ ] Tienes las credenciales de Google OAuth (si vas a usarlas)

## 📦 Paso 1: Preparar el Repositorio

```bash
# Asegúrate de estar en la rama main
git checkout main

# Verifica que no haya cambios sin commitear
git status

# Si hay cambios, commitea y push
git add .
git commit -m "Preparado para producción"
git push origin main
```

## 🔗 Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New Project"**
3. Conecta tu cuenta de GitHub/GitLab/Bitbucket
4. Selecciona el repositorio `diligenz`
5. Haz clic en **"Import"**

## ⚙️ Paso 3: Configurar el Proyecto en Vercel

### Framework Settings
Vercel detectará automáticamente Next.js, pero verifica:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (o deja vacío)
- **Build Command**: `npm run build` (ya configurado en package.json)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

### Environment Variables

Ve a **Settings > Environment Variables** y agrega estas variables:

#### 🔴 OBLIGATORIAS

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
NEXTAUTH_SECRET=tu-secret-generado-con-openssl-rand-base64-32
NODE_ENV=production
```

**Para generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Para NEXTAUTH_URL:**
- Primero haz el deploy sin esta variable
- Después del primer deploy, Vercel te dará una URL tipo: `https://diligenz-xxx.vercel.app`
- Agrega esa URL como `NEXTAUTH_URL`
- O usa tu dominio personalizado si lo tienes configurado

#### 🟡 OPCIONALES (pero recomendadas)

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

**Nota**: Si no configuras Google OAuth, simplemente no funcionará el botón "Continuar con Google", pero el resto de la app funcionará perfectamente.

## 🗄️ Paso 4: Configurar Base de Datos PostgreSQL

### Opción A: Vercel Postgres (Recomendado)

1. En el dashboard de Vercel, ve a **Storage**
2. Haz clic en **"Create Database"**
3. Selecciona **"Postgres"**
4. Elige un nombre y región
5. Vercel creará automáticamente la variable `POSTGRES_URL`
6. Cópiala y úsala como `DATABASE_URL`

### Opción B: Supabase (Gratis)

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Ve a **Settings > Database**
4. Copia la **Connection String** (URI)
5. Úsala como `DATABASE_URL` en Vercel

### Opción C: Neon (Serverless PostgreSQL)

1. Ve a [neon.tech](https://neon.tech)
2. Crea una cuenta y proyecto
3. Copia la connection string
4. Úsala como `DATABASE_URL` en Vercel

## 🚀 Paso 5: Hacer el Deploy

1. En Vercel, haz clic en **"Deploy"**
2. Espera a que termine el build (puede tardar 2-5 minutos)
3. Revisa los logs del build para verificar que no haya errores

## 🔄 Paso 6: Ejecutar Migraciones

Después del primer deploy, necesitas ejecutar las migraciones:

### Método 1: Desde Vercel CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Linkear proyecto
vercel link

# Ejecutar migraciones
npx prisma migrate deploy
```

### Método 2: Desde tu máquina local

```bash
# Configurar DATABASE_URL temporalmente
export DATABASE_URL="tu-postgres-url-de-vercel"

# Ejecutar migraciones
npx prisma migrate deploy
npx prisma generate
```

### Método 3: Script automático (Ya configurado)

El `package.json` ya tiene configurado:
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

Esto ejecutará las migraciones automáticamente en cada build. **Sin embargo**, si hay un error en las migraciones, el build fallará.

## ✅ Paso 7: Verificar que Todo Funciona

Después del deploy, verifica:

1. **Homepage carga correctamente**
   - Ve a tu URL de Vercel
   - Debe cargar sin errores

2. **Login funciona**
   - Ve a `/login`
   - Prueba iniciar sesión

3. **Registro funciona**
   - Ve a `/register`
   - Crea una cuenta de prueba

4. **Panel de admin funciona**
   - Inicia sesión como admin
   - Ve a `/admin`

5. **Google OAuth (si está configurado)**
   - Haz clic en "Continuar con Google"
   - Debe redirigir a Google y volver

## 🔧 Configuración Adicional

### Dominio Personalizado

1. En Vercel, ve a **Settings > Domains**
2. Agrega tu dominio
3. Sigue las instrucciones de DNS
4. Actualiza `NEXTAUTH_URL` con tu dominio

### Variables de Entorno por Entorno

Puedes configurar variables diferentes para:
- **Production**: Producción
- **Preview**: Pull requests
- **Development**: Desarrollo local

En Vercel, al agregar una variable, selecciona para qué entornos aplica.

## 🐛 Troubleshooting

### Error: "Prisma Client not generated"

**Solución**: El script `postinstall` ya está configurado. Si persiste:
```bash
# En Vercel, agrega como build command:
npm run postinstall && npm run build
```

### Error: "Migration failed"

**Solución**: Ejecuta las migraciones manualmente:
```bash
vercel link
npx prisma migrate deploy
```

### Error: "Database connection failed"

**Solución**:
1. Verifica que `DATABASE_URL` esté correcta
2. Asegúrate de que la base de datos acepte conexiones externas
3. Verifica que el formato sea: `postgresql://user:pass@host:port/db?schema=public`

### Error: "Invalid NEXTAUTH_SECRET"

**Solución**: Genera uno nuevo y actualízalo en Vercel:
```bash
openssl rand -base64 32
```

### Error: "Redirect URI mismatch" (Google OAuth)

**Solución**:
1. Ve a Google Cloud Console
2. Edita las credenciales OAuth
3. Agrega la URL exacta: `https://tu-dominio.vercel.app/api/auth/callback/google`
4. Sin trailing slash, con HTTPS

### El sitio carga pero las imágenes no aparecen

**Solución**: Verifica que los archivos en `/public` estén commiteados:
```bash
git add public/
git commit -m "Agregar assets públicos"
git push
```

## 📊 Monitoreo Post-Deploy

1. **Revisa los logs**: Vercel > Tu proyecto > Deployments > Logs
2. **Verifica errores**: Vercel > Tu proyecto > Functions > Logs
3. **Monitorea performance**: Vercel Analytics (si está habilitado)

## 🔄 Actualizaciones Futuras

Para actualizar el sitio:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Vercel detectará automáticamente el push y hará un nuevo deploy.

## 📝 Notas Finales

- **Primer deploy**: Puede tardar más tiempo (5-10 minutos)
- **Deploys siguientes**: Son más rápidos (2-3 minutos)
- **Variables de entorno**: Cualquier cambio requiere un nuevo deploy
- **Base de datos**: Las migraciones se ejecutan automáticamente en cada build

## ✅ Checklist Post-Deploy

- [ ] El sitio carga correctamente
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Panel de admin accesible
- [ ] Panel de usuario accesible
- [ ] Formularios funcionan
- [ ] Google OAuth funciona (si está configurado)
- [ ] Las migraciones se ejecutaron correctamente
- [ ] No hay errores en los logs

---

**¡Tu aplicación está lista para producción! 🎉**
