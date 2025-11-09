# Arquitectura - Viajero Conectado

## Visión General

Viajero Conectado es una plataforma que integra:
- **Marketplace multivendedor** de turismo
- **Red social** de viajes
- **Sistema de puntos** y gamificación
- **Ecosistema B2B** para proveedores

## Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTS                                 │
├─────────────────┬───────────────────┬──────────────────────┤
│   Web App       │   Mobile App      │   Admin Panel        │
│   (Next.js)     │   (React Native)  │   (Next.js)          │
└────────┬────────┴─────────┬─────────┴──────────┬───────────┘
         │                  │                    │
         └──────────────────┴────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Gateway   │
                    │   (NestJS)      │
                    └───────┬─────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐      ┌─────▼──────┐    ┌─────▼─────┐
    │  Auth   │      │ Core API   │    │  Social   │
    │ Service │      │  Service   │    │  Service  │
    └────┬────┘      └─────┬──────┘    └─────┬─────┘
         │                 │                  │
         └─────────────────┼──────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼──────┐   ┌─────▼──────┐   ┌─────▼────┐
    │PostgreSQL │   │  MongoDB   │   │  Redis   │
    │(Relacional)│   │  (Social)  │   │ (Cache)  │
    └───────────┘   └────────────┘   └──────────┘
```

## Componentes Principales

### 1. Frontend Web (Next.js 14)

**Responsabilidades:**
- Renderizado del lado del servidor (SSR) para SEO
- Experiencia de usuario para viajeros y proveedores
- Dashboards especializados por rol
- Sistema de autenticación con OAuth

**Stack:**
- Next.js 14 (App Router)
- React 18
- TailwindCSS
- Zustand (estado)
- TanStack Query (server state)

**Rutas principales:**
- `/` - Homepage pública
- `/explore` - Marketplace
- `/dashboard/*` - Dashboard de viajero
- `/agency/*` - Dashboard de agencia
- `/social/*` - Red social

### 2. Mobile App (React Native + Expo)

**Responsabilidades:**
- Experiencia móvil nativa
- Funcionalidades específicas: cámara, GPS, notificaciones
- Modo offline parcial
- "Capturado en Ruta" con geolocalización

**Stack:**
- React Native 0.73
- Expo SDK 50
- Expo Router
- Zustand + TanStack Query
- NativeWind (Tailwind)

**Apps específicas:**
- Viajero (principal)
- Guía (operación en campo)
- Conductor (operación en ruta)

### 3. Backend API (NestJS)

**Arquitectura:** Monolito modular (preparado para microservicios)

#### Módulos principales:

##### **Auth Module**
- Autenticación JWT
- OAuth2 (Google, Facebook, Apple)
- Verificación de email/SMS
- Refresh tokens
- Password reset

##### **Users Module**
- CRUD de usuarios
- Perfiles sociales
- Preferencias de viaje
- Conexiones (followers/following)
- Verificación de proveedores

##### **Experiences Module**
- Gestión de tours y experiencias
- Calendario y disponibilidad
- Pricing dinámico
- Variantes de productos

##### **Bookings Module**
- Creación de reservas
- Gestión de cupos
- Bloqueo temporal
- Check-in/check-out
- Documentos (vouchers)

##### **Payments Module**
- Integración Stripe
- Integración Mercado Pago
- Split payments (marketplace)
- Reembolsos automatizados
- Webhooks

##### **Social Module**
- Feed de publicaciones
- Stories (24h)
- Comentarios y reacciones
- Hashtags
- Moderación

##### **Chat Module**
- Mensajería 1-a-1
- Grupos de viaje
- Socket.io (real-time)
- Historial persistente

##### **Media Module**
- Upload de fotos/videos
- Compresión automática
- Integración S3/Cloudinary
- Gestión de álbumes
- "Capturado en Ruta"

##### **Points Module**
- Sistema de puntos
- Niveles y badges
- Misiones
- Recompensas
- Ranking
- Antifraude

##### **B2B Module**
- Directorio de proveedores
- Acuerdos y tarifas netas
- Órdenes B2B
- Reportes de volumen

##### **Notifications Module**
- Push notifications
- Emails transaccionales
- SMS
- In-app notifications
- Preferencias de usuario

##### **Search Module**
- Typesense/Elasticsearch
- Búsqueda de experiencias
- Filtros complejos
- Autocompletado
- Búsqueda en social

##### **Analytics Module**
- Eventos de usuario
- Mixpanel/Amplitude
- KPIs de negocio
- Reportes

### 4. Bases de Datos

#### PostgreSQL (Relacional)
**Esquemas principales:**

```sql
-- Usuarios
users
- id (uuid, PK)
- email (unique)
- role (enum: viajero, agencia, hotel, guia, conductor)
- verified_at
- created_at

user_profiles
- user_id (FK)
- display_name
- bio
- avatar_url
- country
- languages

-- Experiencias
experiences
- id (uuid, PK)
- agency_id (FK)
- title
- description
- category
- location
- price_from
- status (draft, published, paused)

experience_variants
- id (uuid, PK)
- experience_id (FK)
- name
- price
- max_people

-- Reservas
bookings
- id (uuid, PK)
- experience_id (FK)
- user_id (FK)
- variant_id (FK)
- date
- status (pending, confirmed, cancelled)
- total_amount

-- Pagos
payments
- id (uuid, PK)
- booking_id (FK)
- amount
- status
- provider (stripe, mercadopago)
- provider_payment_id

-- Puntos
user_points
- user_id (FK)
- current_points
- lifetime_points
- level

points_transactions
- id (uuid, PK)
- user_id (FK)
- points
- type (earned, redeemed, expired)
- reason
- created_at

-- B2B
b2b_agreements
- id (uuid, PK)
- provider_id (FK)
- partner_id (FK)
- terms
- commission_rate
- status
```

#### MongoDB (NoSQL)
**Colecciones principales:**

```javascript
// Feed social
posts {
  _id: ObjectId,
  userId: UUID,
  content: String,
  mediaUrls: [String],
  linkedExperienceId: UUID?,
  hashtags: [String],
  location: {
    type: 'Point',
    coordinates: [lng, lat]
  },
  stats: {
    likes: Number,
    comments: Number,
    shares: Number
  },
  createdAt: Date
}

// Stories
stories {
  _id: ObjectId,
  userId: UUID,
  mediaUrl: String,
  expiresAt: Date,
  views: [UUID],
  createdAt: Date
}

// Comentarios
comments {
  _id: ObjectId,
  postId: ObjectId,
  userId: UUID,
  content: String,
  parentId: ObjectId?, // Para anidados
  createdAt: Date
}

// Chat
messages {
  _id: ObjectId,
  conversationId: String,
  senderId: UUID,
  content: String,
  type: 'text' | 'image' | 'location',
  readBy: [UUID],
  createdAt: Date
}

// Notificaciones
notifications {
  _id: ObjectId,
  userId: UUID,
  type: String,
  data: Object,
  read: Boolean,
  createdAt: Date
}
```

#### Redis
**Usos:**
- Sesiones de usuario (JWT refresh tokens)
- Rate limiting por IP/usuario
- Caché de queries frecuentes (destinos, experiencias destacadas)
- Real-time presence (usuarios online)
- Cola de jobs (emails, notificaciones)
- Bloqueo temporal de cupos en reservas

### 5. Servicios Externos

#### Storage
- **AWS S3** o **Cloudflare R2**
  - Fotos de usuarios
  - Videos
  - Documentos

- **Cloudinary** (procesamiento)
  - Optimización de imágenes
  - Transformaciones
  - CDN

#### Pagos
- **Stripe Connect**
  - Pagos internacionales
  - Split payments
  - KYC de proveedores

- **Mercado Pago**
  - Pagos LATAM
  - Métodos locales

#### Comunicaciones
- **SendGrid** / **AWS SES**
  - Emails transaccionales
  - Newsletters

- **Twilio**
  - SMS verificación
  - WhatsApp (futuro)

#### Mapas
- **Mapbox**
  - Mapas web/mobile
  - Geocoding
  - Rutas

#### Búsqueda
- **Typesense** (preferido)
  - Fast, fácil configuración
  - Typo tolerance

- **Elasticsearch** (alternativa)
  - Más complejo, muy poderoso

#### Analytics
- **Mixpanel** / **Amplitude**
  - Product analytics
  - Funnels
  - Cohorts

- **Google Analytics 4**
  - Web analytics básico

#### Monitoreo
- **Sentry**
  - Error tracking
  - Performance

- **Datadog** (futuro)
  - APM
  - Logs
  - Infraestructura

## Flujos Principales

### 1. Registro y Onboarding

```
Usuario → Web/App
  ↓
Auth Module (crear usuario)
  ↓
Email verification (SendGrid)
  ↓
Onboarding flow (preferencias)
  ↓
Dashboard personalizado
```

### 2. Búsqueda y Reserva

```
Usuario busca "Tours Cartagena"
  ↓
Search Module (Typesense)
  ↓
Listado de experiencias
  ↓
Usuario selecciona → Detalle
  ↓
Selecciona fecha/variante
  ↓
Bookings Module (bloqueo temporal en Redis)
  ↓
Payments Module (Stripe/MP)
  ↓
Confirmación → Email + Notificación
  ↓
Points Module (+puntos automático)
```

### 3. Publicación Social

```
Usuario sube foto desde móvil
  ↓
Media Module (upload a S3)
  ↓
Cloudinary (optimización)
  ↓
Social Module (crear post en MongoDB)
  ↓
Feed de seguidores actualizado
  ↓
Notificaciones a seguidores (async)
  ↓
Points Module (+puntos si cumple criterios)
```

### 4. Alianza B2B

```
Agencia busca hoteles
  ↓
B2B Module (directorio)
  ↓
Agencia envía propuesta de acuerdo
  ↓
Hotel recibe notificación
  ↓
Negociación via chat
  ↓
Acuerdo creado (PostgreSQL)
  ↓
Agencia crea orden B2B (cupos de habitaciones)
  ↓
Hotel confirma
  ↓
Ambos reciben notificación
```

## Seguridad

### Autenticación
- JWT tokens (access + refresh)
- HttpOnly cookies para web
- Secure storage para mobile
- Expiración automática

### Autorización
- Guards por rol (viajero, agencia, admin, etc.)
- Decoradores custom (@Roles, @Public)
- Validación a nivel de módulo

### Validación de Inputs
- class-validator en todos los DTOs
- Sanitización automática
- Prevención de SQL injection (TypeORM)
- Prevención de NoSQL injection (validación)

### Rate Limiting
- Por IP: 100 req/min
- Por usuario: 1000 req/min
- Endpoints sensibles más restrictivos

### Datos Sensibles
- Passwords hasheados (bcrypt, rounds=12)
- PII encriptado en DB
- Secrets en variables de entorno
- No logs de datos sensibles

### CORS
- Whitelist de orígenes
- Credentials permitidos solo para dominios propios

### Headers de Seguridad
- Helmet.js
- CSP
- HSTS

## Escalabilidad

### Fase 1 (MVP - Colombia)
- Monolito modular
- Single region
- PostgreSQL + MongoDB + Redis
- ~10k usuarios

### Fase 2 (LATAM)
- Separación de servicios críticos
- Multi-región (read replicas)
- CDN global
- ~100k usuarios

### Fase 3 (Global)
- Microservicios completos
- Kubernetes
- Multi-región activa
- Sharding de DB
- ~1M+ usuarios

## Performance

### Backend
- Caching agresivo (Redis)
- Query optimization (índices, explain analyze)
- Pagination en todo listado
- Lazy loading de relaciones

### Frontend Web
- Server Components (React)
- Static Generation donde posible
- Image optimization (Next/Image)
- Code splitting automático
- Lazy loading de rutas

### Mobile
- Infinite scroll (FlashList)
- Image caching (Expo Image)
- Offline first para lecturas
- Optimistic updates

## Monitoreo y Observabilidad

### Logs
- Structured logging (JSON)
- Niveles: error, warn, info, debug
- Contexto enriquecido (userId, requestId)

### Métricas
- Latencia de endpoints
- Tasa de error
- Uso de recursos
- Métricas de negocio (reservas/día, etc.)

### Alertas
- Errores críticos → Slack
- Latencia alta → Email
- Uptime monitoring → PagerDuty (futuro)

### APM
- Sentry (errores)
- Datadog (performance)
- Custom dashboards

## Backup y Recuperación

### Bases de Datos
- PostgreSQL: backup diario, retention 30 días
- MongoDB: backup diario, retention 30 días
- Point-in-time recovery

### Media Files
- S3: versionado habilitado
- Cross-region replication (producción)

### Disaster Recovery
- RTO: 4 horas
- RPO: 24 horas

---

**Última actualización:** 2025-11-09
