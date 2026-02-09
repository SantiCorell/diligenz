# 🔗 Configurar GitHub y Subir el Proyecto

## ✅ Estado Actual

Tu proyecto ya está commiteado localmente. Ahora necesitas:

1. **Crear un repositorio en GitHub**
2. **Conectarlo con tu proyecto local**
3. **Hacer push**

## 📋 Pasos Detallados

### Paso 1: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba derecha) → **"New repository"**
3. Configura:
   - **Repository name**: `diligenz` (o el nombre que prefieras)
   - **Description**: "Marketplace de compraventa de empresas"
   - **Visibility**: Privado o Público (tu elección)
   - **NO marques**: "Add a README file", "Add .gitignore", "Choose a license"
4. Haz clic en **"Create repository"**

### Paso 2: Conectar y Subir

GitHub te mostrará comandos. Ejecuta estos en tu terminal:

```bash
cd /Users/santicorell/Documents/SANTI/DILIGENZ/diligenz

# Conectar con tu repositorio (reemplaza TU-USUARIO y TU-REPO)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# Verificar que se conectó correctamente
git remote -v

# Subir el código
git push -u origin main
```

### Paso 3: Verificar

1. Ve a tu repositorio en GitHub
2. Deberías ver todos los archivos del proyecto
3. Verifica que **NO** aparezcan:
   - ❌ `.env`
   - ❌ `prisma/dev.db`
   - ❌ `node_modules/`

## 🔐 Si GitHub te pide autenticación

### Opción A: Personal Access Token (Recomendado)

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token** → Selecciona `repo` (todos los permisos)
3. Copia el token
4. Cuando hagas `git push`, usa el token como contraseña

### Opción B: SSH (Más seguro a largo plazo)

```bash
# Generar clave SSH (si no tienes una)
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Copiar la clave pública
cat ~/.ssh/id_ed25519.pub

# Agregar en GitHub: Settings → SSH and GPG keys → New SSH key
# Luego cambia el remote a SSH:
git remote set-url origin git@github.com:TU-USUARIO/TU-REPO.git
```

## ✅ Comandos Completos (Copia y Pega)

```bash
# 1. Ir al directorio
cd /Users/santicorell/Documents/SANTI/DILIGENZ/diligenz

# 2. Verificar estado (debe decir "nothing to commit")
git status

# 3. Conectar con GitHub (REEMPLAZA TU-USUARIO y TU-REPO)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# 4. Verificar conexión
git remote -v

# 5. Subir código
git push -u origin main
```

## 🎯 Después del Push

Una vez subido a GitHub:

1. ✅ Ve a tu repositorio en GitHub
2. ✅ Verifica que todos los archivos estén ahí
3. ✅ Sigue `PRIMER-DEPLOY.md` para conectar con Vercel

## 🆘 Si Algo Falla

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
```

### Error: "authentication failed"
- Usa Personal Access Token en lugar de contraseña
- O configura SSH (ver arriba)

### Error: "repository not found"
- Verifica que el nombre del repositorio sea correcto
- Verifica que tengas permisos de escritura

---

**¡Una vez subido a GitHub, sigue `PRIMER-DEPLOY.md` para deployar en Vercel! 🚀**
