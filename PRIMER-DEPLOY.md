# 🎯 Guía Rápida: Primer Deploy en Vercel

## ⚡ Pasos Rápidos (5 minutos)

### 1. Subir código a GitHub
```bash
git init
git add .
git commit -m "Initial commit - Diligenz ready for production"
git branch -M main
git remote add origin <tu-repositorio-github>
git push -u origin main
```

### 2. Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. **"Add New Project"** → Conecta GitHub → Selecciona `diligenz`
3. **Deploy** (no configures nada todavía)

### 3. Crear Base de Datos PostgreSQL

**Opción más fácil - Supabase (Gratis):**
1. Ve a [supabase.com](https://supabase.com) → Sign up
2. **New Project** → Elige región → Espera 2 minutos
3. **Settings** → **Database** → Copia la **Connection String (URI)**

### 4. Configurar Variables en Vercel

En Vercel → Tu proyecto → **Settings** → **Environment Variables**:

```env
# Base de datos (OBLIGATORIO)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# NextAuth (OBLIGATORIO)
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
NODE_ENV=production
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Ejecutar Migraciones

**Opción A - Automático (ya configurado):**
El build ejecutará las migraciones automáticamente. Si falla, usa Opción B.

**Opción B - Manual:**
```bash
npm i -g vercel
vercel login
vercel link
export DATABASE_URL="tu-postgres-url"
npx prisma migrate deploy
```

### 6. Redeploy

En Vercel → **Deployments** → **Redeploy** (con las variables ya configuradas)

### 7. Configurar NEXTAUTH_URL

Después del deploy, Vercel te dará una URL tipo: `https://diligenz-xxx.vercel.app`

Agrega esta variable:
```env
NEXTAUTH_URL=https://diligenz-xxx.vercel.app
```

Y haz **Redeploy** de nuevo.

## ✅ Verificar

1. Abre tu URL de Vercel
2. Prueba `/login` y `/register`
3. Crea una cuenta de prueba
4. Verifica que funcione

## 🔐 Google OAuth (Opcional - Después)

Si quieres Google OAuth, sigue `README-GOOGLE-OAUTH.md` y agrega:
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## 🆘 Si Algo Falla

1. Revisa los **Logs** en Vercel
2. Verifica que `DATABASE_URL` sea correcta
3. Asegúrate de que las migraciones se ejecutaron
4. Lee `DEPLOY-VERCEL.md` para troubleshooting detallado

---

**¡Listo! Tu app debería estar funcionando en producción 🚀**
