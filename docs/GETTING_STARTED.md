# Guía de Inicio - Viajero Conectado

Esta guía te ayudará a configurar tu entorno de desarrollo local paso a paso.

## Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Ejecución](#ejecución)
5. [Verificación](#verificación)
6. [Solución de Problemas](#solución-de-problemas)

---

## Prerrequisitos

### Obligatorios

#### 1. Node.js 18+

**Verificar instalación:**
```bash
node --version  # Debe mostrar v18.x.x o superior
```

**Instalar si no lo tienes:**
- macOS: `brew install node@18`
- Windows: [Descargar instalador](https://nodejs.org/)
- Linux: `nvm install 18`

#### 2. pnpm 8+

**Verificar instalación:**
```bash
pnpm --version  # Debe mostrar 8.x.x o superior
```

**Instalar:**
```bash
npm install -g pnpm@8.10.0
```

#### 3. Docker Desktop

**Verificar instalación:**
```bash
docker --version  # Debe funcionar
docker-compose --version
```

**Instalar:**
- [Docker Desktop para Mac](https://docs.docker.com/desktop/install/mac-install/)
- [Docker Desktop para Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Docker Engine para Linux](https://docs.docker.com/engine/install/)

**Nota:** Asegúrate de que Docker Desktop esté corriendo antes de continuar.

#### 4. Git

**Verificar instalación:**
```bash
git --version
```

**Instalar:**
- macOS: `brew install git`
- Windows: [Descargar instalador](https://git-scm.com/)
- Linux: `sudo apt-get install git`

### Opcionales (pero recomendados)

- **VS Code:** [Descargar](https://code.visualstudio.com/)
  - Extensiones recomendadas:
    - ESLint
    - Prettier
    - TypeScript and JavaScript Language Features
    - Tailwind CSS IntelliSense
    - Docker
    - GitLens

- **Postman o Insomnia:** Para probar la API
- **TablePlus o DBeaver:** Para explorar bases de datos

---

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-org/viajero-conectado.git
cd viajero-conectado
```

### 2. Ejecutar Setup Automático

Este script configura todo automáticamente:

```bash
chmod +x infrastructure/scripts/dev-setup.sh
./infrastructure/scripts/dev-setup.sh
```

El script realiza:
- ✅ Verifica que Docker esté corriendo
- ✅ Instala pnpm si es necesario
- ✅ Copia archivos `.env` de ejemplo
- ✅ Instala todas las dependencias
- ✅ Levanta servicios de Docker (PostgreSQL, MongoDB, Redis, etc.)

**Duración:** 3-5 minutos (dependiendo de tu conexión)

### 3. Instalación Manual (alternativa)

Si prefieres hacerlo paso a paso:

```bash
# 1. Instalar dependencias
pnpm install

# 2. Copiar archivos de configuración
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env

# 3. Levantar servicios de Docker
docker-compose up -d postgres mongodb redis typesense minio mailhog

# 4. Esperar a que servicios estén listos
sleep 10

# 5. Verificar servicios
docker-compose ps
```

---

## Configuración

### Variables de Entorno

Los archivos `.env` ya fueron copiados en el paso anterior. Para desarrollo local, los valores por defecto funcionan bien.

#### Backend (`apps/backend/.env`)

Principales variables:

```env
NODE_ENV=development
PORT=4000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=viajero_conectado

MONGO_URI=mongodb://admin:admin123@localhost:27017/viajero_conectado_social?authSource=admin

REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d
```

#### Frontend Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

#### Mobile (`apps/mobile/.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:4000
```

### Base de Datos

#### Ejecutar Migraciones

```bash
cd apps/backend
pnpm run migration:run
```

Esto crea todas las tablas necesarias en PostgreSQL.

#### Seed de Datos (Opcional)

Para cargar datos de prueba:

```bash
pnpm run seed
```

Esto crea:
- Usuarios de prueba (viajeros, agencias, etc.)
- Experiencias de ejemplo
- Datos de Colombia (destinos, ciudades)

---

## Ejecución

### Iniciar Todo el Stack

Necesitarás **3 terminales** (o usa tmux/screen):

#### Terminal 1 - Backend

```bash
cd apps/backend
pnpm dev
```

Verás:
```
🚀 Backend running on: http://localhost:4000
📚 API Documentation: http://localhost:4000/api/docs
```

#### Terminal 2 - Frontend Web

```bash
cd apps/web
pnpm dev
```

Verás:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

#### Terminal 3 - Mobile (Opcional)

```bash
cd apps/mobile
pnpm start
```

Verás el QR code de Expo. Escanéalo con:
- iOS: App de Cámara
- Android: App Expo Go

### Iniciar Servicios Específicos

```bash
# Solo backend
pnpm --filter @viajero-conectado/backend dev

# Solo web
pnpm --filter @viajero-conectado/web dev

# Solo mobile
pnpm --filter @viajero-conectado/mobile dev
```

---

## Verificación

### 1. Verificar Servicios Docker

```bash
docker-compose ps
```

Debes ver todos los servicios en estado `Up`:

```
NAME                    STATUS
viajero_postgres        Up (healthy)
viajero_mongodb         Up (healthy)
viajero_redis           Up (healthy)
viajero_typesense       Up
viajero_minio           Up (healthy)
viajero_mailhog         Up
```

### 2. Verificar Backend API

Abre en tu navegador:

**Health check:**
```
http://localhost:4000/api/v1/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T...",
  "service": "viajero-conectado-api",
  "version": "0.1.0"
}
```

**API Documentation:**
```
http://localhost:4000/api/docs
```

Verás la interfaz de Swagger con todos los endpoints documentados.

### 3. Verificar Frontend Web

Abre en tu navegador:
```
http://localhost:3000
```

Deberías ver la homepage de Viajero Conectado.

### 4. Verificar Bases de Datos

#### PostgreSQL

```bash
docker exec -it viajero_postgres psql -U postgres -d viajero_conectado
```

Dentro de psql:
```sql
\dt  -- Listar tablas
SELECT * FROM users LIMIT 5;
\q   -- Salir
```

#### MongoDB

```bash
docker exec -it viajero_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

Dentro de mongosh:
```js
use viajero_conectado_social
show collections
db.posts.find().limit(5)
exit
```

### 5. Verificar Herramientas de Desarrollo

**MinIO Console (S3 local):**
```
http://localhost:9001
```
- User: `minioadmin`
- Password: `minioadmin123`

**Mailhog (emails capturados):**
```
http://localhost:8025
```

---

## Solución de Problemas

### Servicios de Docker no inician

**Error:** `Cannot connect to the Docker daemon`

**Solución:**
```bash
# macOS/Windows: Abre Docker Desktop
# Linux: Inicia el servicio
sudo systemctl start docker
```

### Puerto ya en uso

**Error:** `Port 4000 is already in use`

**Solución:**
```bash
# Encuentra el proceso
lsof -ti:4000

# Mata el proceso
kill -9 $(lsof -ti:4000)
```

O cambia el puerto en `.env`:
```env
PORT=4001
```

### Dependencias no se instalan

**Error:** `EACCES: permission denied`

**Solución:**
```bash
# Limpiar caché de npm/pnpm
pnpm store prune
rm -rf node_modules
pnpm install
```

### Migraciones fallan

**Error:** `relation "users" already exists`

**Solución:**
```bash
# Revertir todas las migraciones
cd apps/backend
pnpm run migration:revert

# Ejecutar nuevamente
pnpm run migration:run
```

O reiniciar la base de datos:
```bash
docker-compose down -v  # ⚠️ Elimina datos
docker-compose up -d postgres
cd apps/backend
pnpm run migration:run
```

### Frontend no conecta con Backend

**Verificar:**
1. Backend está corriendo en `http://localhost:4000`
2. `NEXT_PUBLIC_API_URL` en `.env.local` es correcto
3. No hay errores de CORS en la consola del navegador

**Solución:**
```bash
# Reiniciar ambos servicios
# Terminal 1
cd apps/backend
pnpm dev

# Terminal 2
cd apps/web
rm -rf .next
pnpm dev
```

### Expo/Mobile no conecta

**En iOS Simulator:**
```bash
# En apps/mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
```

**En dispositivo físico:**
```bash
# Encuentra tu IP local
# macOS/Linux
ifconfig | grep "inet "
# Windows
ipconfig

# Actualiza .env
EXPO_PUBLIC_API_URL=http://192.168.1.X:4000/api/v1
```

### Limpiar todo y empezar de nuevo

```bash
# Detener y limpiar Docker
docker-compose down -v

# Limpiar dependencias
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm store prune

# Limpiar builds
rm -rf apps/*/.next
rm -rf apps/*/dist
rm -rf apps/*/build

# Reinstalar todo
pnpm install

# Levantar servicios
docker-compose up -d

# Ejecutar migraciones
cd apps/backend
pnpm run migration:run
pnpm run seed
```

---

## Próximos Pasos

Una vez que todo esté funcionando:

1. **Explora la documentación:**
   - [Arquitectura](./architecture/ARCHITECTURE.md)
   - [Esquema de DB](./architecture/DATABASE_SCHEMA.md)
   - [Stack Tecnológico](../TECH_STACK.md)

2. **Lee las guías de contribución:**
   - [CONTRIBUTING.md](../CONTRIBUTING.md)

3. **Prueba la API:**
   - Abre Swagger: http://localhost:4000/api/docs
   - Prueba endpoints con Postman

4. **Empieza a desarrollar:**
   - Crea un branch para tu feature
   - Sigue las convenciones de código
   - Escribe tests

---

## Ayuda Adicional

Si tienes problemas que no están cubiertos aquí:

1. Revisa los [Issues en GitHub](https://github.com/tu-org/viajero-conectado/issues)
2. Crea un nuevo issue con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Tu entorno (OS, versiones)

---

**¡Listo para desarrollar!** 🚀
