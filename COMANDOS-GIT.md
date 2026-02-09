# 📦 Comandos Git - Subir a Repositorio

## Si es la primera vez (nuevo repositorio)

```bash
# 1. Inicializar git (si no está inicializado)
cd /Users/santicorell/Documents/SANTI/DILIGENZ/diligenz
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer commit inicial
git commit -m "Initial commit - Diligenz production ready"

# 4. Crear rama main
git branch -M main

# 5. Conectar con tu repositorio de GitHub
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git

# 6. Subir código
git push -u origin main
```

## Si ya tienes un repositorio

```bash
# 1. Verificar estado
git status

# 2. Agregar cambios
git add .

# 3. Commit
git commit -m "Preparado para producción - Deploy Vercel"

# 4. Push
git push origin main
```

## ⚠️ Verificar antes de hacer push

```bash
# Ver qué archivos se van a subir
git status

# Verificar que .env NO esté incluido
git status | grep .env

# Verificar que dev.db NO esté incluido
git status | grep dev.db
```

## ✅ Archivos que SÍ deben subirse

- ✅ Todo el código fuente (`app/`, `components/`, `lib/`)
- ✅ `package.json` y `package-lock.json`
- ✅ `prisma/schema.prisma` y todas las migraciones
- ✅ Archivos de configuración (`next.config.ts`, `tsconfig.json`, etc.)
- ✅ Archivos en `public/` (logos, imágenes)
- ✅ `.env.example` (sí, este se sube)
- ✅ Todos los archivos `.md` de documentación
- ✅ `.gitignore`
- ✅ `.nvmrc`
- ✅ `vercel.json`

## ❌ Archivos que NO deben subirse

- ❌ `.env` (ya está en .gitignore)
- ❌ `prisma/dev.db` (ya está en .gitignore)
- ❌ `node_modules/` (ya está en .gitignore)
- ❌ `.next/` (ya está en .gitignore)
- ❌ Archivos de log

## 🔍 Verificar antes del push final

```bash
# Ver todos los archivos que se van a commitear
git ls-files

# Si ves algún archivo que NO debería estar, elimínalo del staging:
git reset HEAD nombre-del-archivo

# Y agrégalo al .gitignore si es necesario
```
