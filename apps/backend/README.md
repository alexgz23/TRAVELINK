# Viajero Conectado - Backend API

Backend API construido con NestJS, Prisma y PostgreSQL.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
cd apps/backend
pnpm install
```

### 2. Iniciar servicios de base de datos

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto `5432`
- Redis en puerto `6379`
- Adminer (DB UI) en `http://localhost:8080`
- Redis Commander en `http://localhost:8081`

### 3. Configurar variables de entorno

El archivo `.env` ya está creado con valores de desarrollo. Puedes editarlo según necesites.

### 4. Ejecutar migraciones de Prisma

```bash
# Generar cliente de Prisma
pnpm prisma:generate

# Crear y aplicar migraciones
pnpm prisma:migrate

# (Opcional) Ver base de datos con Prisma Studio
pnpm prisma:studio
```

### 5. Iniciar servidor de desarrollo

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

### Bookings
- `GET /api/v1/bookings` - Mis reservas
- `POST /api/v1/bookings` - Crear reserva

### Reviews
- `GET /api/v1/reviews` - Listar reseñas
- `POST /api/v1/reviews` - Crear reseña

### Posts (Social Feed)
- `GET /api/v1/posts` - Feed de posts
- `POST /api/v1/posts` - Crear post

### Chat
- WebSocket en `/` para mensajería en tiempo real

### Uploads
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

## 🐳 Docker

### Solo base de datos:
```bash
docker-compose up -d
```

### Todo (backend + DB):
```bash
# TO DO: Agregar Dockerfile para backend
```

## 📊 Monitoreo

- **Adminer**: http://localhost:8080 (User: postgres, Pass: postgres)
- **Redis Commander**: http://localhost:8081
- **Prisma Studio**: `pnpm prisma:studio`

## 🚧 Estado del Proyecto

### ✅ Completado
- Estructura base de NestJS
- Autenticación JWT completa
- Módulo de Users
- Módulo de Experiences (CRUD)
- Schema de Prisma completo
- Docker Compose para desarrollo
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
   - Dockerfile
   - Deploy en Railway/Render
   - CI/CD con GitHub Actions

---

**¡El backend está listo para desarrollar!** 🚀
