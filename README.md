# Viajero Conectado

**Red social + marketplace de viajes en Colombia**

Plataforma web que conecta viajeros con experiencias turísticas, con backend API REST.

![Status](https://img.shields.io/badge/status-development-yellow.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)

---

## 📊 Estado del Proyecto

| Componente | Estado | Descripción |
|------------|--------|-------------|
| **Frontend Web** | ✅ Completo | Next.js 14 con 10+ páginas funcionales |
| **Backend API** | 🟡 Base Lista | NestJS + Prisma + PostgreSQL (core implementado) |
| **Base de Datos** | ✅ Schema Completo | PostgreSQL con Prisma (12 modelos) |
| **Auth Sistema** | ✅ Completo | JWT con refresh tokens |
| **Experiencias** | ✅ CRUD Completo | Búsqueda, filtros, gestión completa |
| **Usuarios** | ✅ Completo | Perfiles, estadísticas |
| **Bookings** | 🟡 Pendiente | Estructura creada, lógica pendiente |
| **Reviews** | 🟡 Pendiente | Estructura creada, lógica pendiente |
| **Posts** | 🟡 Pendiente | Estructura creada, lógica pendiente |
| **Chat** | 🟡 Pendiente | WebSocket configurado, lógica pendiente |
| **Deploy** | ⚪ No iniciado | - |

---

## 🏗️ Arquitectura

```
TRAVELINK/
├── apps/
│   ├── web/              # Frontend - Next.js 14
│   │   ├── src/
│   │   │   ├── app/      # App Router (rutas)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   └── backend/          # Backend API - NestJS 10
│       ├── src/
│       │   ├── auth/     # ✅ Autenticación JWT
│       │   ├── users/    # ✅ Gestión usuarios
│       │   ├── experiences/  # ✅ CRUD experiencias
│       │   ├── bookings/     # 🟡 Stub
│       │   ├── reviews/      # 🟡 Stub
│       │   ├── posts/        # 🟡 Stub
│       │   ├── chat/         # 🟡 Stub
│       │   ├── uploads/      # 🟡 Stub
│       │   └── common/   # Utilidades compartidas
│       ├── prisma/
│       │   └── schema.prisma  # Schema de base de datos
│       └── package.json
│
├── package.json
└── README.md
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **PostgreSQL** 15+ ([Descargar](https://www.postgresql.org/download/))
- **Redis** 7+ (Opcional) ([Descargar](https://redis.io/download))

### 1. Clonar repositorio

```bash
git clone <tu-repo-url>
cd TRAVELINK
```

### 2. Configurar PostgreSQL

**Opción A - Instalación local:**

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Descargar instalador desde https://www.postgresql.org/download/windows/
```

**Crear base de datos:**

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE viajero_conectado;

# Crear usuario (opcional)
CREATE USER viajero_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE viajero_conectado TO viajero_user;

# Salir
\q
```

**Opción B - PostgreSQL cloud gratuito:**

- **Supabase:** https://supabase.com (gratis hasta 500MB)
- **Railway:** https://railway.app (gratis con límites)
- **Neon:** https://neon.tech ($0 para desarrollo)

### 3. Configurar Backend

```bash
cd apps/backend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tu conexión PostgreSQL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/viajero_conectado?schema=public"

# Generar cliente Prisma
pnpm prisma:generate

# Ejecutar migraciones
pnpm prisma:migrate

# (Opcional) Ver DB en Prisma Studio
pnpm prisma:studio
```

### 4. Configurar Frontend

```bash
cd apps/web

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 5. Iniciar aplicaciones

**Terminal 1 - Backend:**
```bash
cd apps/backend
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

### 6. Acceder a la aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs (Swagger):** http://localhost:4000/api/docs
- **Health Check:** http://localhost:4000/api/v1/health

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS 3
- **Estado:** Zustand
- **Data Fetching:** TanStack Query v5
- **Formularios:** React Hook Form + Zod
- **Animaciones:** Framer Motion

### Backend
- **Framework:** NestJS 10
- **Lenguaje:** TypeScript 5
- **ORM:** Prisma
- **Base de datos:** PostgreSQL 15
- **Caché:** Redis 7 (opcional)
- **Auth:** JWT + Passport
- **Validación:** class-validator
- **Docs:** Swagger/OpenAPI

### DevOps
- **Package Manager:** pnpm
- **Version Control:** Git

---

## 📚 API Endpoints

### Auth
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Refrescar token
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/me` - Usuario actual

### Users
- `GET /api/v1/users/profile` - Perfil del usuario
- `PUT /api/v1/users/profile` - Actualizar perfil
- `GET /api/v1/users/stats` - Estadísticas
- `GET /api/v1/users/:id` - Ver usuario

### Experiences
- `GET /api/v1/experiences` - Listar experiencias (con filtros)
- `GET /api/v1/experiences/:id` - Detalle de experiencia
- `POST /api/v1/experiences` - Crear (PROVIDER only)
- `PUT /api/v1/experiences/:id` - Actualizar
- `DELETE /api/v1/experiences/:id` - Eliminar (soft delete)

### Bookings, Reviews, Posts, Chat, Uploads
🟡 **En desarrollo** - Estructura creada, lógica pendiente

**Ver documentación completa:** http://localhost:4000/api/docs

---

## 🗄️ Base de Datos

### Modelos (Prisma Schema)

1. **User** - Usuarios (TRAVELER, PROVIDER, ADMIN)
2. **RefreshToken** - Tokens JWT
3. **Experience** - Experiencias turísticas
4. **Booking** - Reservas
5. **Review** - Reseñas y ratings
6. **Post** - Red social
7. **Like** - Likes en posts
8. **Comment** - Comentarios
9. **Conversation** - Conversaciones
10. **ConversationParticipant** - Participantes de chat
11. **Message** - Mensajes de chat

**Schema completo:** `apps/backend/prisma/schema.prisma`

### Comandos Prisma

```bash
cd apps/backend

# Generar cliente
pnpm prisma:generate

# Crear migración
pnpm prisma:migrate

# Ver base de datos (GUI)
pnpm prisma:studio

# Resetear DB (⚠️ elimina datos)
pnpm db:reset
```

---

## 🧪 Testing

### Frontend
```bash
cd apps/web

# Tests unitarios
pnpm test

# Tests E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Backend
```bash
cd apps/backend

# Tests unitarios
pnpm test

# Tests E2E
pnpm test:e2e

# Coverage
pnpm test:cov
```

---

## 📜 Scripts Disponibles

### Raíz del Proyecto
```bash
# Instalar todas las dependencias
pnpm install:all

# Desarrollo
pnpm dev:web           # Solo frontend
pnpm dev:backend       # Solo backend

# Build
pnpm build:web
pnpm build:backend

# Producción
pnpm start:web
pnpm start:backend

# Testing y linting
pnpm lint
pnpm test

# Prisma
pnpm prisma:studio
pnpm prisma:migrate
```

### Frontend (`apps/web/`)
```bash
pnpm dev              # Desarrollo (puerto 3000)
pnpm build            # Build producción
pnpm start            # Ejecutar build
pnpm lint             # ESLint
pnpm type-check       # TypeScript
pnpm test             # Tests unitarios
pnpm test:e2e         # Tests E2E
```

### Backend (`apps/backend/`)
```bash
pnpm dev              # Desarrollo (puerto 4000)
pnpm build            # Build producción
pnpm start:prod       # Ejecutar build
pnpm lint             # ESLint
pnpm test             # Tests
pnpm prisma:studio    # DB UI
```

---

## 🔐 Variables de Entorno

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_APP_NAME=Viajero Conectado
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (`.env`)

```env
NODE_ENV=development
PORT=4000

# PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/viajero_conectado?schema=public"

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

**Ver:** `apps/backend/.env.example` para todas las variables

---

## 🚧 Roadmap

### ✅ Completado

- [x] Frontend web con Next.js 14
- [x] Backend con NestJS 10
- [x] Base de datos PostgreSQL + Prisma
- [x] Sistema de autenticación JWT
- [x] CRUD de usuarios
- [x] CRUD de experiencias
- [x] Documentación Swagger

### 🔄 En Desarrollo

- [ ] Sistema de reservas (Bookings)
- [ ] Integración de pagos (Stripe/PayU)
- [ ] Sistema de reseñas (Reviews)
- [ ] Red social (Posts, Likes, Comments)
- [ ] Chat en tiempo real (WebSocket)
- [ ] Upload de imágenes (Cloudinary/S3)

### 📅 Próximamente

- [ ] Sistema de puntos y gamificación
- [ ] Notificaciones (Email, Push, In-App)
- [ ] Panel de administración
- [ ] Analytics y reportes
- [ ] Testing completo (>80% coverage)
- [ ] Deploy a producción
- [ ] App móvil (React Native)

---

## 📖 Documentación

- **Backend README:** [apps/backend/README.md](apps/backend/README.md)
- **Frontend README:** [apps/web/README.md](apps/web/README.md)
- **Frontend Deployment:** [apps/web/DEPLOYMENT.md](apps/web/DEPLOYMENT.md)
- **API Docs (Swagger):** http://localhost:4000/api/docs

---

## 🐛 Troubleshooting

### PostgreSQL no conecta

```bash
# Verificar que PostgreSQL está corriendo
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Probar conexión
psql -U postgres -d viajero_conectado

# Si hay problemas de autenticación, editar pg_hba.conf
# Cambiar método de "peer" a "md5"
```

### Puerto ya en uso

```bash
# Backend (4000)
lsof -ti:4000 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Problemas con Prisma

```bash
cd apps/backend

# Regenerar cliente
pnpm prisma:generate

# Resetear base de datos
pnpm db:reset
```

### Problemas con dependencias

```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules apps/*/node_modules
pnpm install:all
```

---

## 💡 Servicios de Base de Datos Recomendados

### PostgreSQL Cloud (Gratis para desarrollo)

1. **Supabase** (Recomendado)
   - URL: https://supabase.com
   - Tier gratuito: 500MB, 2GB de transferencia
   - Incluye: PostgreSQL + UI + Storage + Auth

2. **Neon**
   - URL: https://neon.tech
   - Tier gratuito: Proyectos ilimitados
   - Serverless PostgreSQL

3. **Railway**
   - URL: https://railway.app
   - Tier gratuito: $5/mes de créditos
   - Deploy fácil

### Redis Cloud (Opcional)

- **Upstash:** https://upstash.com (gratis 10k comandos/día)
- **Redis Cloud:** https://redis.com/try-free/ (30MB gratis)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Propietario - Todos los derechos reservados

---

## 📧 Contacto

- **Website:** https://viajeroconectado.com
- **Email:** contact@viajeroconectado.com

---

**¡Construyendo la mejor red social de viajes!** 🌍✈️
