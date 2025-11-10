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
├── docker-compose.yml    # PostgreSQL + Redis
├── package.json
└── README.md
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker Desktop** ([Descargar](https://www.docker.com/products/docker-desktop))

### 1. Clonar repositorio

```bash
git clone <tu-repo-url>
cd TRAVELINK
```

### 2. Iniciar servicios de base de datos

```bash
docker-compose up -d
```

Esto iniciará:
- **PostgreSQL** en puerto `5432`
- **Redis** en puerto `6379`
- **Adminer** (DB UI) en `http://localhost:8080`
- **Redis Commander** en `http://localhost:8081`

### 3. Configurar Backend

```bash
cd apps/backend

# Instalar dependencias
pnpm install

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
- **Caché:** Redis 7
- **Auth:** JWT + Passport
- **Validación:** class-validator
- **Docs:** Swagger/OpenAPI

### DevOps
- **Containers:** Docker + Docker Compose
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
pnpm install

# Desarrollo (ambos servidores)
pnpm dev

# Build (ambos proyectos)
pnpm build

# Linting
pnpm lint
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

## 🐳 Docker

### Servicios Disponibles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Acceder a UIs

- **Adminer (PostgreSQL):** http://localhost:8080
  - Sistema: PostgreSQL
  - Servidor: postgres
  - Usuario: postgres
  - Contraseña: postgres
  - Base de datos: viajero_conectado

- **Redis Commander:** http://localhost:8081

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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/viajero_conectado?schema=public"
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
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
- [x] Docker Compose para desarrollo
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

### Docker no inicia

```bash
# Verificar Docker Desktop está corriendo
docker --version

# Reiniciar servicios
docker-compose down
docker-compose up -d
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
pnpm install
```

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
