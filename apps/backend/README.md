# Backend - Viajero Conectado

API REST construida con NestJS + TypeScript.

## Stack

- **Framework:** NestJS 10+
- **Lenguaje:** TypeScript 5+
- **Base de datos relacional:** PostgreSQL (TypeORM)
- **Base de datos NoSQL:** MongoDB
- **Caché:** Redis
- **Documentación:** Swagger/OpenAPI

## Estructura del proyecto

```
src/
├── modules/           # Módulos funcionales
│   ├── auth/         # Autenticación y autorización
│   ├── users/        # Gestión de usuarios
│   ├── experiences/  # Tours y experiencias
│   ├── bookings/     # Sistema de reservas
│   ├── social/       # Red social
│   ├── b2b/          # Alianzas B2B
│   ├── payments/     # Pagos (Stripe, Mercado Pago)
│   ├── media/        # Gestión de multimedia
│   └── points/       # Sistema de puntos
├── common/           # Código compartido
│   ├── decorators/   # Decoradores custom
│   ├── guards/       # Guards de autenticación/autorización
│   ├── filters/      # Exception filters
│   ├── interceptors/ # Interceptors
│   └── pipes/        # Validation pipes
├── config/           # Configuraciones
├── app.module.ts     # Módulo raíz
└── main.ts          # Entry point
```

## Instalación

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
```

## Desarrollo

```bash
# Modo desarrollo con hot-reload
pnpm dev

# Modo debug
pnpm start:debug
```

La API estará disponible en `http://localhost:4000`
La documentación Swagger en `http://localhost:4000/api/docs`

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

## Build

```bash
# Build para producción
pnpm build

# Ejecutar build
pnpm start:prod
```

## Módulos principales

### Auth
- Registro y login
- JWT tokens
- OAuth (Google, Facebook, Apple)
- Verificación de email/teléfono

### Users (Viajeros)
- Perfiles sociales
- Preferencias de viaje
- Sistema de puntos y niveles
- Galería "Capturado en Ruta"

### Experiences
- CRUD de tours y experiencias
- Calendario y disponibilidad
- Pricing y variantes

### Bookings
- Creación de reservas
- Pagos y splits
- Cancelaciones y reembolsos
- Gestión de documentos

### Social
- Feed de publicaciones
- Stories
- Comentarios y reacciones
- Chat real-time

### B2B
- Directorio de proveedores
- Acuerdos y tarifas netas
- Órdenes B2B

## Base de datos

### PostgreSQL (Relacional)
- Usuarios y autenticación
- Tours, hoteles, servicios
- Reservas y transacciones
- Sistema de puntos
- Relaciones B2B

### MongoDB (NoSQL)
- Feed social
- Comentarios y reacciones
- Chat y mensajería
- Logs

### Redis (Caché)
- Sesiones
- Rate limiting
- Real-time presence
- Job queues

## Seguridad

- Helmet para headers seguros
- CORS configurado
- Rate limiting
- Validación estricta de inputs (class-validator)
- Password hashing con bcrypt
- JWT con refresh tokens

## Documentación API

La documentación interactiva está disponible en `/api/docs` cuando el servidor está corriendo.

## Variables de entorno

Ver `.env.example` para todas las variables necesarias.

**Importante:** Nunca commitear el archivo `.env` real.
