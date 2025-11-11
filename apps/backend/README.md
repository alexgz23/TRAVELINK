# Viajero Conectado - Backend API

Backend API construido con NestJS, Prisma y PostgreSQL.

## 🚀 Inicio Rápido

### Opción A: Setup Automático (Recomendado)

```bash
cd apps/backend
./quick-start.sh
```

El script te guiará por todo el proceso de configuración automáticamente.

### Opción B: Setup Manual

#### 1. Instalar PostgreSQL

Necesitas tener PostgreSQL instalado y corriendo.

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Descargar desde https://www.postgresql.org/download/windows/

**Alternativa - PostgreSQL Cloud (Gratis):**
- **Supabase:** https://supabase.com
- **Neon:** https://neon.tech
- **Railway:** https://railway.app

### 2. Crear base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE viajero_conectado;

# (Opcional) Crear usuario
CREATE USER viajero_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE viajero_conectado TO viajero_user;

# Salir
\q
```

### 3. Instalar dependencias

```bash
cd apps/backend
pnpm install
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tu conexión PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/viajero_conectado?schema=public"
```

### 5. Ejecutar migraciones

```bash
# Generar cliente de Prisma
pnpm prisma:generate

# Crear y aplicar migraciones
pnpm prisma:migrate

# (Opcional) Ver base de datos con Prisma Studio
pnpm prisma:studio
```

### 6. Iniciar servidor de desarrollo

```bash
pnpm dev
```

El servidor estará disponible en: **http://localhost:4000**

## 📚 Documentación API

Una vez el servidor esté corriendo, accede a la documentación interactiva de Swagger:

**http://localhost:4000/api/docs**

## 🔑 Endpoints Principales

### Auth
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Refrescar token
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/me` - Obtener usuario actual

### Users
- `GET /api/v1/users/profile` - Perfil del usuario
- `PUT /api/v1/users/profile` - Actualizar perfil
- `GET /api/v1/users/stats` - Estadísticas del usuario

### Experiences
- `GET /api/v1/experiences` - Listar experiencias
- `GET /api/v1/experiences/:id` - Detalle de experiencia
- `POST /api/v1/experiences` - Crear experiencia (PROVIDER)
- `PUT /api/v1/experiences/:id` - Actualizar experiencia
- `DELETE /api/v1/experiences/:id` - Eliminar experiencia

### Bookings (🟡 Pendiente)
- `GET /api/v1/bookings` - Mis reservas
- `POST /api/v1/bookings` - Crear reserva

### Reviews (🟡 Pendiente)
- `GET /api/v1/reviews` - Listar reseñas
- `POST /api/v1/reviews` - Crear reseña

### Posts (🟡 Pendiente)
- `GET /api/v1/posts` - Feed de posts
- `POST /api/v1/posts` - Crear post

### Chat (🟡 Pendiente)
- WebSocket en `/` para mensajería en tiempo real

### Uploads (🟡 Pendiente)
- `POST /api/v1/uploads/image` - Subir imagen

## 🗄️ Estructura de Base de Datos

### Modelos Principales:
- **User** - Usuarios (TRAVELER, PROVIDER, ADMIN)
- **Experience** - Experiencias turísticas
- **Booking** - Reservas
- **Review** - Reseñas y ratings
- **Post** - Red social
- **Message** - Chat
- **RefreshToken** - Tokens JWT

Ver `prisma/schema.prisma` para más detalles.

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 📦 Scripts Disponibles

```bash
pnpm dev                 # Desarrollo con hot-reload
pnpm build              # Build para producción
pnpm start:prod         # Ejecutar build de producción
pnpm lint               # ESLint
pnpm format             # Prettier
pnpm prisma:generate    # Generar cliente Prisma
pnpm prisma:migrate     # Ejecutar migraciones
pnpm prisma:studio      # UI de base de datos
pnpm db:reset           # Resetear base de datos (⚠️ borra todo)
```

## 🛠️ Setup & Verification Scripts

### Quick Start Script
```bash
./quick-start.sh
```
Automated setup that:
- Installs dependencies
- Checks .env configuration
- Generates Prisma client
- Runs database migrations
- Verifies setup is complete

### Setup Verification
```bash
./verify-setup.sh
```
Checks your environment:
- Node.js and pnpm versions
- Dependencies installation
- Environment variables
- Database connection
- Prisma client generation
- TypeScript compilation

Use this to troubleshoot issues or verify your setup is correct.

## 🔐 Autenticación

El sistema usa JWT con refresh tokens:

1. Login/Register → Retorna `accessToken` y `refreshToken`
2. Usar `accessToken` en header: `Authorization: Bearer <token>`
3. Cuando expire, usar `/api/v1/auth/refresh` con `refreshToken`
4. Los tokens se almacenan en la base de datos

## 🌍 Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

Principales:
- `PORT` - Puerto del servidor (default: 4000)
- `DATABASE_URL` - URL de PostgreSQL
- `JWT_SECRET` - Secret para access token
- `JWT_REFRESH_SECRET` - Secret para refresh token
- `REDIS_HOST` - Host de Redis (opcional)
- `REDIS_PORT` - Puerto de Redis (opcional)

## 🚧 Estado del Proyecto

### ✅ Completado
- Estructura base de NestJS
- Autenticación JWT completa
- Módulo de Users
- Módulo de Experiences (CRUD)
- Schema de Prisma completo
- Documentación Swagger

### 🚧 En Desarrollo / Pendiente
- Implementar Bookings completo
- Sistema de pagos con Stripe
- Reviews y ratings completo
- Posts y red social completo
- Chat WebSocket en tiempo real
- Upload de imágenes con Cloudinary
- Envío de emails
- Testing completo
- CI/CD

## 🤝 Próximos Pasos

1. **Terminar implementación de módulos**
   - Bookings con integración de Stripe
   - Reviews y ratings
   - Posts (likes, comments)
   - Chat en tiempo real

2. **Configurar servicios externos**
   - Cloudinary para imágenes
   - Stripe para pagos
   - Nodemailer para emails

3. **Testing**
   - Unit tests
   - E2E tests
   - Coverage > 80%

4. **Deploy**
   - Deploy en Railway/Render
   - CI/CD con GitHub Actions

---

**¡El backend está listo para desarrollar!** 🚀
