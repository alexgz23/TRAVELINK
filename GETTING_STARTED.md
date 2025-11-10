# 🚀 Guía de Inicio Rápido - Viajero Conectado

Esta guía te llevará paso a paso para tener el proyecto corriendo en tu máquina local en **menos de 10 minutos**.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js 18+** → [Descargar](https://nodejs.org/)
- ✅ **Docker Desktop** → [Descargar](https://www.docker.com/products/docker-desktop)
- ✅ **Git** → [Descargar](https://git-scm.com/)
- ✅ **pnpm** (opcional, pero recomendado) → `npm install -g pnpm`

---

## 🎯 Opción 1: Inicio Rápido con Docker (Recomendado)

Esta es la forma **más rápida** de tener todo funcionando.

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-org/viajero-conectado.git
cd viajero-conectado
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env y cambiar los valores necesarios
# MÍNIMO requerido: JWT_SECRET y JWT_REFRESH_SECRET
```

**Valores mínimos requeridos en `.env`:**

```bash
# JWT Secrets (IMPORTANTE: cambiar por valores seguros)
JWT_SECRET=tu-super-secreto-jwt-min-32-caracteres-largo
JWT_REFRESH_SECRET=tu-super-secreto-refresh-min-32-caracteres

# Typesense (puede usar el valor por defecto en desarrollo)
TYPESENSE_API_KEY=dev_api_key_change_in_production
```

### Paso 3: Iniciar Docker Desktop

Asegúrate de que Docker Desktop esté corriendo en tu máquina.

### Paso 4: Levantar Todos los Servicios

```bash
# Levantar todos los servicios con Docker Compose
docker-compose up -d

# Ver logs en tiempo real (opcional)
docker-compose logs -f
```

Este comando iniciará **8 servicios**:
- ✅ PostgreSQL (Base de datos relacional)
- ✅ MongoDB (Base de datos NoSQL para social/chat)
- ✅ Redis (Caché y sesiones)
- ✅ Typesense (Motor de búsqueda)
- ✅ MinIO (Storage local tipo S3)
- ✅ Backend API (NestJS)
- ✅ Frontend Web (Next.js)
- ✅ Mailhog (Captura de emails)

### Paso 5: Esperar a que los Servicios Estén Listos

```bash
# Verificar que todos los servicios están corriendo
docker-compose ps

# Deberías ver todos los servicios con estado "Up" o "healthy"
```

**Tiempo estimado:** 2-5 minutos (primera vez descarga las imágenes)

### Paso 6: Acceder a la Aplicación

Una vez que todos los servicios estén corriendo, abre tu navegador:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🌐 **Frontend Web** | http://localhost:3000 | Aplicación principal |
| 🔌 **Backend API** | http://localhost:4000 | API REST |
| 📚 **API Docs** | http://localhost:4000/api/docs | Swagger/OpenAPI |
| 📦 **MinIO Console** | http://localhost:9001 | Storage (user: minioadmin, pass: minioadmin123) |
| 📧 **Mailhog** | http://localhost:8025 | Emails de prueba |

### Paso 7: Crear un Usuario de Prueba (Opcional)

```bash
# Accede al frontend y regístrate
# O usa Swagger en http://localhost:4000/api/docs
# POST /api/v1/auth/register
```

---

## 🎯 Opción 2: Desarrollo Local (Sin Docker)

Si prefieres correr el proyecto sin Docker (útil para desarrollo activo).

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-org/viajero-conectado.git
cd viajero-conectado
```

### Paso 2: Instalar Dependencias

```bash
# Usando pnpm (recomendado)
pnpm install

# O usando npm
npm install
```

### Paso 3: Levantar Servicios de Base de Datos

```bash
# Levanta SOLO las bases de datos y servicios auxiliares
docker-compose up -d postgres mongodb redis typesense minio mailhog

# Verificar que estén corriendo
docker-compose ps
```

### Paso 4: Configurar Variables de Entorno

**Backend (`apps/backend/.env`):**

```bash
# Copiar ejemplo
cp apps/backend/.env.example apps/backend/.env

# Editar apps/backend/.env con estos valores:
NODE_ENV=development
PORT=4000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=viajero_conectado

# MongoDB
MONGODB_URI=mongodb://admin:admin123@localhost:27017/viajero_conectado_social?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Typesense
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=dev_api_key_change_in_production

# MinIO (S3 local)
AWS_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
AWS_S3_BUCKET=viajero-conectado
AWS_REGION=us-east-1

# JWT
JWT_SECRET=tu-super-secreto-jwt-min-32-caracteres-largo
JWT_REFRESH_SECRET=tu-super-secreto-refresh-min-32-caracteres
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# SMTP (Mailhog)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
```

**Frontend (`apps/web/.env.local`):**

```bash
# Copiar ejemplo
cp apps/web/.env.example apps/web/.env.local

# Editar apps/web/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Paso 5: Ejecutar Migraciones de Base de Datos

```bash
cd apps/backend

# Ejecutar migraciones
npm run migration:run

# Opcional: Seed de datos de prueba
npm run seed

cd ../..
```

### Paso 6: Iniciar Backend

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Debería mostrar:
# [Nest] Application is running on: http://localhost:4000
```

### Paso 7: Iniciar Frontend

```bash
# Terminal 2 - Frontend
cd apps/web
npm run dev

# Debería mostrar:
# ✓ Ready on http://localhost:3000
```

### Paso 8: (Opcional) Iniciar Mobile App

```bash
# Terminal 3 - Mobile
cd apps/mobile
npm start

# Escanea el QR con Expo Go (iOS/Android)
```

---

## 📱 Mobile App (React Native + Expo)

### Prerequisitos Adicionales

- **Expo Go** app en tu teléfono → [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Expo CLI** → `npm install -g @expo/cli`

### Iniciar Mobile App

```bash
cd apps/mobile

# Instalar dependencias
npm install

# Iniciar Expo
npm start

# Opciones:
# - Presiona 'i' para abrir en iOS Simulator
# - Presiona 'a' para abrir en Android Emulator
# - Escanea el QR con Expo Go en tu teléfono
```

**Nota:** La app móvil está configurada al 40% (base lista). Ver `apps/mobile/IMPLEMENTATION_GUIDE.md` para continuar el desarrollo.

---

## 🔧 Comandos Útiles

### Docker

```bash
# Ver servicios corriendo
docker-compose ps

# Ver logs de un servicio
docker-compose logs -f backend
docker-compose logs -f web

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA DATOS)
docker-compose down -v

# Rebuild de servicios
docker-compose up -d --build
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker exec -it viajero_postgres psql -U postgres -d viajero_conectado

# Conectar a MongoDB
docker exec -it viajero_mongodb mongosh -u admin -p admin123

# Conectar a Redis
docker exec -it viajero_redis redis-cli
```

### Backend

```bash
cd apps/backend

# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Migraciones
npm run migration:create -- nombre-migracion
npm run migration:run
npm run migration:revert

# Linting
npm run lint
npm run format
```

### Frontend

```bash
cd apps/web

# Desarrollo
npm run dev

# Build
npm run build
npm run start  # Producción

# Tests
npm run test
npm run test:ui
npm run test:e2e

# Linting
npm run lint
```

---

## 🐛 Troubleshooting

### Problema: "Port already in use"

**Solución:**

```bash
# Ver qué proceso está usando el puerto
lsof -i :3000  # o :4000, :5432, etc.

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en .env
```

### Problema: Docker no puede conectarse a las bases de datos

**Solución:**

```bash
# Verificar que los contenedores estén healthy
docker-compose ps

# Revisar logs
docker-compose logs postgres
docker-compose logs mongodb

# Reiniciar servicios
docker-compose restart postgres mongodb redis
```

### Problema: Backend arroja error de migración

**Solución:**

```bash
# Entrar al contenedor backend
docker exec -it viajero_backend sh

# Ejecutar migraciones
npm run migration:run

# Salir
exit
```

### Problema: Frontend no puede conectarse al Backend

**Solución:**

1. Verificar que el backend esté corriendo: http://localhost:4000/api/v1/health
2. Revisar `apps/web/.env.local` que tenga `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`
3. Reiniciar el frontend

### Problema: MinIO no acepta uploads

**Solución:**

```bash
# Acceder a MinIO Console: http://localhost:9001
# User: minioadmin
# Pass: minioadmin123

# Crear bucket "viajero-conectado" si no existe
# Configurar Access Policy a "public" o "download"
```

---

## 📊 Verificar que Todo Funciona

### 1. Backend Health Check

```bash
curl http://localhost:4000/api/v1/health

# Respuesta esperada:
# {"status":"ok","info":{"database":{"status":"up"},...}}
```

### 2. Frontend Health Check

```bash
curl http://localhost:3000/api/health

# Respuesta esperada:
# {"status":"ok"}
```

### 3. Swagger API Docs

Abre en tu navegador: http://localhost:4000/api/docs

Deberías ver la documentación interactiva de todas las APIs (169+ endpoints).

### 4. Crear Usuario y Hacer Login

1. Ve a http://localhost:3000/register
2. Crea una cuenta
3. Revisa Mailhog (http://localhost:8025) para ver el email de bienvenida
4. Haz login en http://localhost:3000/login

---

## 🎓 Próximos Pasos

Una vez que tengas el proyecto corriendo:

1. **Explorar la API**: http://localhost:4000/api/docs
2. **Leer la documentación**:
   - [PLATFORM_OVERVIEW.md](./docs/PLATFORM_OVERVIEW.md) - Visión general
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
   - [API Docs](./docs/api/) - Documentación de cada API
3. **Ejecutar tests**:
   ```bash
   cd apps/backend && npm test
   cd apps/web && npm run test:e2e
   ```
4. **Implementar pantallas móviles**: Ver `apps/mobile/IMPLEMENTATION_GUIDE.md`

---

## 📞 ¿Necesitas Ayuda?

- **Documentación completa**: Ver carpeta `/docs`
- **Issues**: Reporta problemas en GitHub
- **API Docs**: http://localhost:4000/api/docs

---

## 🎉 ¡Listo!

Ahora tienes **Viajero Conectado** corriendo localmente. Explora, experimenta y construye. 🚀

**Estado del Proyecto:**

- ✅ Backend: 14/14 módulos (100%)
- ✅ Frontend Web: Completo (100%)
- ✅ Testing: Unit + E2E (100%)
- ✅ DevOps: Docker + K8s + CI/CD (100%)
- 🟡 Mobile: Base lista (40%)
