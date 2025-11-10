# Arquitectura - Viajero Conectado

## Visión General

Viajero Conectado utiliza una arquitectura monolítica modular con separación clara entre frontend y backend, diseñada para escalar a microservicios cuando sea necesario.

## Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USERS / CLIENTS                              │
│              (Web Browsers, Mobile Apps, Third-party Apps)            │
└────────────────────────┬──────────────────────────────────────────────┘
                         │
                         │ HTTPS/WSS
                         │
┌────────────────────────▼──────────────────────────────────────────────┐
│                       NGINX REVERSE PROXY                              │
│            (Load Balancing, SSL Termination, Rate Limiting)            │
└──────────┬─────────────────────────────────────┬──────────────────────┘
           │                                     │
           │ HTTP                                │ HTTP
           │                                     │
┌──────────▼──────────┐                 ┌────────▼─────────┐
│  FRONTEND (Next.js) │                 │  BACKEND (NestJS)│
│  - Server Components│                 │  - REST API      │
│  - Client Components│                 │  - WebSocket     │
│  - SSR/ISR/CSR     │                 │  - Business Logic│
│  - Static Assets   │                 │  - Authentication│
└────────────────────┘                 └───────┬───────────┘
                                               │
                    ┌──────────────────────────┼────────────────────┐
                    │                          │                    │
          ┌─────────▼──────┐        ┌──────────▼──────┐  ┌─────────▼────────┐
          │   PostgreSQL   │        │      Redis      │  │     MongoDB      │
          │   (Primary DB) │        │     (Cache)     │  │  (Chat/Social)   │
          │  - Users       │        │  - Sessions     │  │  - Messages      │
          │  - Experiences │        │  - Rate Limits  │  │  - Posts         │
          │  - Bookings    │        │  - Queue Jobs   │  │  - Comments      │
          │  - Payments    │        └─────────────────┘  └──────────────────┘
          └────────────────┘                │
                    │                       │
          ┌─────────▼──────┐                │
          │ Elasticsearch  │                │
          │   (Search)     │                │
          │  - Full-text   │                │
          │  - Facets      │                │
          │  - Ranking     │                │
          └────────────────┘                │
                                            │
                    ┌───────────────────────┼──────────────┐
                    │                       │              │
          ┌─────────▼──────┐    ┌──────────▼──────┐  ┌───▼──────┐
          │   AWS S3/R2    │    │   Prometheus    │  │ Grafana  │
          │  (File Storage)│    │   (Metrics)     │  │(Dashboards)│
          └────────────────┘    └─────────────────┘  └──────────┘
```

## Componentes Principales

### 1. Frontend (Next.js 14)

**Tecnologías:**
- Next.js 14 con App Router
- React 18 (Server + Client Components)
- TypeScript 5
- Tailwind CSS 3
- TanStack Query v5 (Server State)
- Zustand v4 (Client State)

**Responsabilidades:**
- Renderizado de UI (SSR, ISR, CSR)
- Manejo de estado del cliente
- Interacción con usuario
- Optimización de performance (Code Splitting, Image Optimization)
- SEO (Meta tags, Sitemap, Structured Data)

**Patrones:**
- Server Components por defecto
- Client Components cuando sea necesario (interactividad)
- Custom Hooks para lógica reutilizable
- Optimistic Updates para mejor UX

### 2. Backend (NestJS)

**Tecnologías:**
- NestJS 10
- TypeScript 5
- Prisma ORM
- Socket.IO (WebSocket)
- Class Validator
- JWT Authentication

**Arquitectura Modular:**

```
src/
├── modules/
│   ├── auth/           # Autenticación JWT, refresh tokens
│   ├── users/          # Gestión de usuarios y perfiles
│   ├── experiences/    # Tours y experiencias
│   ├── bookings/       # Sistema de reservas
│   ├── payments/       # Procesamiento de pagos
│   ├── social/         # Red social (posts, likes, follows)
│   ├── chat/           # Chat en tiempo real
│   ├── reviews/        # Reseñas y calificaciones
│   ├── search/         # Búsqueda con Elasticsearch
│   ├── notifications/  # Notificaciones multi-canal
│   ├── points/         # Sistema de puntos
│   ├── ads/            # Publicidad
│   └── b2b/            # Alianzas B2B
├── common/             # Guards, Decorators, Filters
├── config/             # Configuración
└── main.ts             # Bootstrap
```

**Patrones:**
- Dependency Injection
- Repository Pattern
- Service Layer
- DTOs (Data Transfer Objects)
- Guards & Interceptors
- Middleware
- Exception Filters

### 3. Bases de Datos

#### PostgreSQL (Relacional)
**Uso:** Datos transaccionales y relacionales

**Tablas Principales:**
- users, profiles, roles
- experiences, categories
- bookings, booking_states
- payments, transactions
- reviews, ratings
- b2b_partnerships, contracts
- points_transactions, levels

#### MongoDB (NoSQL)
**Uso:** Datos no estructurados y de alta escritura

**Colecciones:**
- messages (chat)
- posts (social feed)
- comments
- notifications
- activity_logs

#### Redis (Cache & Queue)
**Uso:** Cache, sesiones, rate limiting, queues

**Estructuras:**
- Sessions: `session:{userId}`
- Cache: `cache:experiences:*`, `cache:user:*`
- Rate Limiting: `ratelimit:{ip}:{endpoint}`
- Queues: Bull queues para jobs asíncronos

#### Elasticsearch
**Uso:** Búsqueda full-text

**Índices:**
- experiences
- users
- posts

### 4. Infraestructura

#### Docker Compose
- Desarrollo local
- Todos los servicios orquestados
- Hot reloading habilitado

#### Kubernetes
- Producción
- Auto-scaling (HPA)
- Self-healing
- Rolling updates
- Secrets management

#### Nginx
- Reverse Proxy
- Load Balancing
- SSL Termination
- Rate Limiting
- Caching de assets estáticos

#### Monitoring
- **Prometheus**: Métricas
- **Grafana**: Visualización
- **Node Exporter**: Métricas del sistema

## Flujos de Datos Principales

### 1. Autenticación

```
User → Frontend → Backend (POST /auth/login)
                    ↓
                 Validate Credentials
                    ↓
                 Generate JWT + Refresh Token
                    ↓
                 Store in Redis + Return
                    ↓
                 Frontend stores in localStorage
```

### 2. Búsqueda de Experiencias

```
User Search → Frontend
                ↓
            Backend /experiences/search
                ↓
            Elasticsearch Query
                ↓
            Results + Facets
                ↓
            Cache in Redis (5 min)
                ↓
            Return to Frontend
```

### 3. Reserva (Booking)

```
User selects experience → Frontend
                            ↓
                        Create Booking (POST /bookings)
                            ↓
                        Backend validates availability
                            ↓
                        Create booking record (PostgreSQL)
                            ↓
                        Generate payment link (Wompi)
                            ↓
                        Return payment URL
                            ↓
                        Frontend redirects to payment
                            ↓
                        Webhook confirms payment
                            ↓
                        Update booking status
                            ↓
                        Send notifications (Email + In-App)
```

### 4. Chat en Tiempo Real

```
User sends message → Frontend (Socket.IO)
                        ↓
                    Backend receives event
                        ↓
                    Save to MongoDB
                        ↓
                    Emit to recipient(s)
                        ↓
                    Recipient receives (if online)
                        ↓
                    Create notification (if offline)
```

## Seguridad

### Autenticación
- JWT tokens con expiración
- Refresh tokens en Redis
- Password hashing con bcrypt

### Autorización
- Role-Based Access Control (RBAC)
- Guards en endpoints sensibles
- Ownership validation

### Rate Limiting
- Redis-based rate limiting
- Por IP y por usuario
- Diferentes límites por endpoint

### Validación
- DTOs con class-validator
- Zod en frontend
- Sanitización de inputs

### Encryption
- HTTPS en producción
- Secrets encriptados en Kubernetes
- Database credentials en variables de entorno

## Escalabilidad

### Horizontal Scaling
- Frontend: CDN + Edge Functions
- Backend: Multiple instances detrás de LB
- Database: Read replicas (futuro)

### Vertical Scaling
- Optimización de queries
- Índices en base de datos
- Connection pooling

### Caching Strategy
1. **Browser Cache**: Assets estáticos (365 días)
2. **CDN Cache**: Imágenes y contenido público
3. **Application Cache**: Redis (5-60 min)
4. **Database Cache**: Query result cache

## Deployment

### CI/CD Pipeline

```
Git Push → GitHub Actions
             ↓
         Run Tests
             ↓
         Build Docker Image
             ↓
         Push to Registry
             ↓
         Deploy to K8s
             ↓
         Health Check
             ↓
         Rollout Complete
```

### Ambientes

1. **Development**: Local Docker Compose
2. **Staging**: Kubernetes cluster (staging namespace)
3. **Production**: Kubernetes cluster (production namespace)

## Performance

### Frontend
- Code Splitting
- Image Optimization (Next.js Image)
- Static Generation donde sea posible
- Service Worker (PWA)
- Web Vitals tracking

### Backend
- Connection Pooling
- Query Optimization
- Caching
- Async processing para tareas pesadas
- Compression

### Database
- Índices optimizados
- Query optimization
- Connection pooling
- Prepared statements

## Monitoring & Observability

### Métricas
- Request latency (p50, p95, p99)
- Request rate (requests/sec)
- Error rate
- Database query time
- Cache hit/miss ratio

### Logs
- Structured logging (JSON)
- Log levels: debug, info, warn, error
- Centralized logging (futuro: ELK stack)

### Alertas (Futuro)
- High error rate
- High latency
- Database connection issues
- Service down

## Próximos Pasos

1. **Microservicios**: Separar módulos críticos
2. **Event-Driven**: Implementar event bus (RabbitMQ/Kafka)
3. **GraphQL**: API alternativa para clients
4. **gRPC**: Comunicación inter-service
5. **Service Mesh**: Istio para observabilidad avanzada

---

Para más detalles sobre componentes específicos:
- [Backend Documentation](apps/backend/README.md)
- [Frontend Guide](apps/web/FRONTEND_GUIDE.md)
- [Infrastructure](infrastructure/README.md)
