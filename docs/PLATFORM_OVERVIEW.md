# Plataforma Viajero Conectado - Resumen General

**Ecosistema completo de turismo conectado** que integra marketplace, red social, sistema de puntos, publicidad, alianzas B2B, notificaciones y reseñas.

## Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Módulos Implementados](#módulos-implementados)
- [Stack Tecnológico](#stack-tecnológico)
- [Roles de Usuario](#roles-de-usuario)
- [Flujos Principales](#flujos-principales)
- [APIs Documentadas](#apis-documentadas)
- [Estado del Proyecto](#estado-del-proyecto)

## Arquitectura

### Estructura del Proyecto

```
TRAVELINK/
├── apps/
│   └── backend/              # API NestJS
│       ├── src/
│       │   ├── modules/      # Módulos de funcionalidad
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── experiences/
│       │   │   ├── bookings/
│       │   │   ├── payments/
│       │   │   ├── social/
│       │   │   ├── points/
│       │   │   ├── ads/
│       │   │   ├── b2b/
│       │   │   ├── notifications/
│       │   │   └── reviews/
│       │   ├── common/       # Guards, decorators, filters
│       │   └── config/       # Configuración
│       └── ...
├── packages/
│   └── types/                # TypeScript types compartidos
│       └── src/
│           └── enums/        # Enumeraciones globales
└── docs/
    └── api/                  # Documentación de APIs
```

### Bases de Datos

**PostgreSQL** - Datos relacionales:
- Usuarios y perfiles
- Experiencias y reservas
- Pagos y transacciones
- Alianzas B2B
- Publicidad
- Reseñas

**MongoDB** - Datos no relacionales:
- Red social (posts, comentarios, likes)
- Notificaciones
- Preferencias de usuario

## Módulos Implementados

### 1. Autenticación y Usuarios (Auth & Users)

**Descripción:** Sistema completo de autenticación con JWT y gestión de perfiles multi-rol.

**Características:**
- Registro y login con JWT
- 7 roles de usuario (Viajero, Agencia, Hotel, Guía, Conductor, No Registrado, Admin)
- Perfiles personalizados por rol
- Recuperación de contraseña
- Verificación de email

**Endpoints:** 15+

**Documentación:** `/docs/api/AUTH_API.md` (pendiente)

---

### 2. Experiencias (Experiences)

**Descripción:** Catálogo de tours, actividades y experiencias turísticas.

**Características:**
- CRUD de experiencias
- Categorías y etiquetas
- Disponibilidad y horarios
- Precios y capacidad
- Galería de imágenes
- Ubicaciones

**Endpoints:** 12+

**Documentación:** `/docs/api/EXPERIENCES_API.md` (pendiente)

---

### 3. Reservas (Bookings)

**Descripción:** Sistema de reservas con confirmación y gestión de estados.

**Características:**
- Crear reservas con participantes
- Estados: Pendiente, Confirmada, Cancelada, Completada, Reembolsada
- Validación de disponibilidad
- Políticas de cancelación
- Vinculación con pagos

**Endpoints:** 10+

**Documentación:** `/docs/api/BOOKINGS_API.md` (pendiente)

---

### 4. Pagos (Payments)

**Descripción:** Procesamiento de pagos con múltiples métodos y estados.

**Características:**
- Múltiples métodos: Tarjeta, PayPal, Transferencia, Efectivo
- Estados de pago completos
- Reembolsos
- Historial de transacciones
- Webhooks para procesadores externos

**Endpoints:** 8+

**Documentación:** `/docs/api/PAYMENTS_API.md` (pendiente)

---

### 5. Red Social (Social)

**Descripción:** Red social de viajes con posts, comentarios, likes y follows.

**Características:**
- Publicaciones con fotos/videos
- Comentarios anidados
- Sistema de likes
- Seguir usuarios
- Feed personalizado
- Trending posts

**Endpoints:** 20+

**Documentación:** `/docs/api/SOCIAL_API.md`

**Base de datos:** MongoDB

---

### 6. Puntos y Gamificación (Points)

**Descripción:** Sistema de recompensas con 5 niveles de usuario.

**Características:**
- 5 niveles: Explorador → Caminante → Viajero Activo → Viajero Experto → Embajador
- Ganar puntos por acciones (reservas, reseñas, compartir, etc.)
- Catálogo de recompensas
- Canje de puntos
- Historial de transacciones
- Badges y logros

**Endpoints:** 15+

**Documentación:** `/docs/api/POINTS_API.md`

**Base de datos:** PostgreSQL + MongoDB (para historial)

---

### 7. Publicidad y Marketing (Ads)

**Descripción:** Plataforma de publicidad tipo Facebook Ads para agencias.

**Características:**
- Campañas publicitarias con presupuesto
- Modelos de facturación: CPC (costo por clic), CPM (costo por mil impresiones)
- Formatos de anuncios: feed, story, destacado, banner
- Targeting por demografía e intereses
- Métricas en tiempo real (impresiones, clics, conversiones, CTR)
- Aprobación administrativa
- Auto-pausa por presupuesto

**Endpoints:** 23+

**Documentación:** `/docs/api/ADS_API.md`

**Base de datos:** PostgreSQL

---

### 8. Alianzas B2B (B2B)

**Descripción:** Sistema de alianzas estratégicas entre agencias y proveedores.

**Características:**
- Solicitudes de alianza (Agencia → Hotel/Guía/Conductor)
- Contratos formales con términos y comisiones
- Tipos de comisión: Porcentaje, Fijo, Híbrido
- Transacciones de comisiones
- Firmas digitales
- Objetivos y bonificaciones
- SLA (Service Level Agreements)

**Endpoints:** 20+

**Documentación:** `/docs/api/B2B_API.md`

**Base de datos:** PostgreSQL

---

### 9. Notificaciones (Notifications)

**Descripción:** Sistema multi-canal de notificaciones en tiempo real.

**Características:**
- 25+ tipos de notificaciones
- 4 canales: In-App, Email, Push, SMS
- Preferencias personalizables por usuario
- Horarios de "No Molestar"
- Email digest (resumen diario/semanal)
- Acciones en masa (marcar leídas, archivar, etc.)
- Agrupación de notificaciones
- Contador de no leídas

**Endpoints:** 18+

**Documentación:** `/docs/api/NOTIFICATIONS_API.md`

**Base de datos:** MongoDB

---

### 10. Reseñas y Calificaciones (Reviews)

**Descripción:** Sistema de reviews para experiencias, agencias, hoteles, guías y conductores.

**Características:**
- Calificación 1-5 estrellas
- Ratings detallados (limpieza, comunicación, valor, etc.)
- Fotos/videos en reseñas
- Badge de "compra verificada"
- Respuestas de proveedores
- Votos de utilidad (helpful/not helpful)
- Sistema de reportes y moderación
- Auto-flagging con múltiples reportes
- Estadísticas (promedio, distribución)

**Endpoints:** 16+

**Documentación:** `/docs/api/REVIEWS_API.md`

**Base de datos:** PostgreSQL

---

## Stack Tecnológico

### Backend
- **Framework:** NestJS 10+
- **Lenguaje:** TypeScript 5+
- **Base de datos relacional:** PostgreSQL con TypeORM
- **Base de datos no relacional:** MongoDB con Mongoose
- **Autenticación:** JWT con Passport
- **Validación:** class-validator, class-transformer
- **Rate limiting:** @nestjs/throttler
- **Monorepo:** Turborepo con pnpm

### Arquitectura
- Arquitectura modular
- Separación de concerns
- DTOs para validación
- Guards para autorización
- Filters para manejo de errores
- Decoradores custom
- Enums compartidos

## Roles de Usuario

### 1. Viajero (VIAJERO)
**Puede:**
- Buscar y reservar experiencias
- Publicar en red social
- Dejar reseñas
- Ganar puntos y canjear recompensas
- Ver notificaciones
- Votar en reseñas

### 2. Agencia (AGENCIA)
**Puede:**
- Todo lo de Viajero +
- Crear y gestionar experiencias
- Ver reservas de sus experiencias
- Crear campañas publicitarias
- Solicitar alianzas B2B
- Responder a reseñas

### 3. Hotel (HOTEL)
**Puede:**
- Gestionar perfil de hotel
- Recibir solicitudes de alianza
- Responder a reseñas
- Ver transacciones de comisiones

### 4. Guía (GUIA)
**Puede:**
- Gestionar perfil de guía
- Recibir solicitudes de alianza
- Responder a reseñas
- Ver transacciones de comisiones

### 5. Conductor (CONDUCTOR)
**Puede:**
- Gestionar perfil de conductor
- Recibir solicitudes de alianza
- Responder a reseñas
- Ver transacciones de comisiones

### 6. No Registrado (NO_REGISTRADO)
**Puede:**
- Buscar experiencias (limitado)
- Ver contenido público de red social
- Ver reseñas

### 7. Administrador (ADMIN)
**Puede:**
- Todo +
- Aprobar/rechazar campañas publicitarias
- Moderar reseñas
- Resolver reportes
- Gestionar usuarios
- Acceso a analytics completos

## Flujos Principales

### Flujo 1: Reserva de Experiencia

```
1. Viajero busca experiencias
   GET /experiences?category=tours&location=Cancun

2. Viajero ve detalles
   GET /experiences/:id

3. Viajero ve reseñas
   GET /reviews?reviewableType=experience&reviewableId=:id

4. Viajero crea reserva
   POST /bookings
   {
     experienceId: "uuid",
     date: "2024-07-15",
     participants: 2
   }

5. Viajero realiza pago
   POST /payments
   {
     bookingId: "uuid",
     method: "card",
     amount: 1500
   }

6. Sistema confirma reserva
   PATCH /bookings/:id
   status: "confirmed"

7. Viajero recibe notificación
   Notification: BOOKING_CONFIRMED

8. Viajero gana puntos
   POST /points/transactions (internal)
   points: +50 por reserva

9. Después del tour, viajero deja reseña
   POST /reviews
   {
     reviewableType: "experience",
     rating: 5,
     comment: "Excelente tour!"
   }

10. Viajero gana más puntos
    +20 puntos por reseña
```

### Flujo 2: Campaña Publicitaria

```
1. Agencia crea campaña
   POST /ads/campaigns
   {
     name: "Promo Verano",
     totalBudget: 1000,
     billingType: "cpc"
   }

2. Agencia crea anuncio
   POST /ads/ads
   {
     campaignId: "uuid",
     format: "feed",
     cpcBid: 0.50
   }

3. Agencia envía a aprobación
   POST /ads/campaigns/:id/submit
   status: "pending_approval"

4. Admin aprueba
   POST /ads/admin/campaigns/:id/approve
   status: "active"

5. Usuarios ven el anuncio
   GET /ads/... (filtrado por targeting)

6. Usuario hace clic
   POST /ads/track/click
   - Se cobra $0.50
   - Se actualiza métrica

7. Usuario reserva
   POST /ads/track/conversion
   - Se registra conversión

8. Agencia ve métricas
   GET /ads/campaigns/:id/metrics
   {
     impressions: 5000,
     clicks: 150,
     conversions: 12,
     ctr: 3.0%,
     spent: $75
   }
```

### Flujo 3: Alianza B2B

```
1. Agencia solicita alianza con hotel
   POST /b2b/alliances
   {
     providerId: "hotel-uuid",
     type: "hotel",
     defaultCommissionRate: 15
   }
   status: "pending"

2. Hotel recibe notificación
   Notification: ALLIANCE_REQUEST

3. Hotel acepta
   POST /b2b/alliances/:id/accept
   status: "accepted"

4. Agencia crea contrato
   POST /b2b/contracts
   {
     allianceId: "uuid",
     commissionType: "percentage",
     commissionPercentage: 15,
     duration: "1_year"
   }

5. Ambas partes firman
   POST /b2b/contracts/:id/sign
   {
     signatureUrl: "..."
   }

6. Cliente hace reserva a través de agencia
   POST /bookings (incluye hotelId)

7. Sistema crea transacción de comisión
   POST /b2b/transactions
   {
     allianceId: "uuid",
     baseAmount: 2000,
     commissionRate: 15,
     commissionAmount: 300
   }

8. Agencia marca como pagado
   POST /b2b/transactions/:id/pay
   {
     paymentReference: "TRF-12345"
   }
```

## APIs Documentadas

Toda la documentación de APIs está en `/docs/api/`:

| Módulo | Archivo | Endpoints | Estado |
|--------|---------|-----------|--------|
| Social | `SOCIAL_API.md` | 20+ | ✅ Completo |
| Points | `POINTS_API.md` | 15+ | ✅ Completo |
| Ads | `ADS_API.md` | 23+ | ✅ Completo |
| B2B | `B2B_API.md` | 20+ | ✅ Completo |
| Notifications | `NOTIFICATIONS_API.md` | 18+ | ✅ Completo |
| Reviews | `REVIEWS_API.md` | 16+ | ✅ Completo |
| Auth | `AUTH_API.md` | 15+ | ⏳ Pendiente |
| Users | `USERS_API.md` | 12+ | ⏳ Pendiente |
| Experiences | `EXPERIENCES_API.md` | 12+ | ⏳ Pendiente |
| Bookings | `BOOKINGS_API.md` | 10+ | ⏳ Pendiente |
| Payments | `PAYMENTS_API.md` | 8+ | ⏳ Pendiente |

## Estado del Proyecto

### ✅ Módulos Completados (10/10)

1. **Auth** - Autenticación JWT
2. **Users** - Gestión de usuarios y perfiles
3. **Experiences** - Catálogo de experiencias
4. **Bookings** - Sistema de reservas
5. **Payments** - Procesamiento de pagos
6. **Social** - Red social de viajes
7. **Points** - Gamificación y recompensas
8. **Ads** - Plataforma publicitaria
9. **B2B** - Alianzas estratégicas
10. **Notifications** - Sistema de notificaciones
11. **Reviews** - Reseñas y calificaciones

### 📊 Estadísticas del Código

- **Total de endpoints:** 150+
- **Módulos:** 11
- **Entidades TypeORM:** 30+
- **Schemas MongoDB:** 5+
- **DTOs:** 60+
- **Enums:** 40+
- **Guards:** 2 (JWT, Roles)
- **Decorators:** 3+ (@CurrentUser, @Roles, @Public)

### 🗄️ Base de Datos

**PostgreSQL:**
- `users`, `user_profiles`
- `experiences`, `experience_availability`
- `bookings`
- `payments`
- `campaigns`, `ads`, `ad_metrics`
- `alliances`, `alliance_contracts`, `alliance_transactions`
- `reviews`, `review_responses`, `review_reports`, `review_helpful`

**MongoDB:**
- `posts`, `comments`, `likes`, `follows`
- `notifications`, `notification_preferences`
- `point_transactions`

### 🚀 Próximos Pasos

**Backend:**
- [ ] Crear documentación de APIs pendientes
- [ ] Implementar WebSockets para notificaciones en tiempo real
- [ ] Agregar tests unitarios e integración
- [ ] Implementar logging con Winston
- [ ] Agregar Swagger/OpenAPI
- [ ] Configurar CI/CD

**Frontend:**
- [ ] Dashboards por rol
- [ ] Interfaz de red social
- [ ] Sistema de notificaciones en tiempo real
- [ ] Panel de analytics
- [ ] Gestión de campañas publicitarias
- [ ] Sistema de reseñas UI

**DevOps:**
- [ ] Dockerizar aplicación
- [ ] Configurar PostgreSQL y MongoDB
- [ ] Setup de Redis para caché
- [ ] Configurar S3 para archivos
- [ ] Deploy a producción

**Integraciones:**
- [ ] Pasarelas de pago (Stripe, PayPal)
- [ ] Firebase para push notifications
- [ ] SendGrid para emails
- [ ] Twilio para SMS
- [ ] Google Maps API
- [ ] CDN para imágenes

## Integración entre Módulos

### Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────┐
│                         Auth                            │
│              (Autenticación y Autorización)             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│                        Users                            │
│               (Perfiles Multi-Rol)                      │
└──┬────────┬─────────┬─────────┬──────────┬─────────┬───┘
   │        │         │         │          │         │
   ↓        ↓         ↓         ↓          ↓         ↓
┌──────┐ ┌────────┐ ┌────┐ ┌───────┐ ┌────────┐ ┌─────────┐
│Experi│ │Bookings│ │B2B │ │  Ads  │ │ Social │ │ Reviews │
│ences │ │        │ │    │ │       │ │        │ │         │
└──┬───┘ └───┬────┘ └──┬─┘ └───────┘ └────────┘ └────┬────┘
   │         │         │                              │
   ↓         ↓         ↓                              ↓
┌──────────────┐ ┌──────────────┐              ┌────────────┐
│   Payments   │ │Notifications │              │   Points   │
│              │ │              │              │            │
└──────────────┘ └──────────────┘              └────────────┘
```

### Eventos que Generan Notificaciones

- **Bookings** → `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`
- **Payments** → `PAYMENT_SUCCESSFUL`, `PAYMENT_FAILED`, `PAYMENT_REFUND`
- **Social** → `POST_LIKE`, `POST_COMMENT`, `NEW_FOLLOWER`, `MENTION`
- **B2B** → `ALLIANCE_REQUEST`, `ALLIANCE_ACCEPTED`, `CONTRACT_SIGNED`, `TRANSACTION_PAID`
- **Points** → `POINTS_EARNED`, `LEVEL_UP`, `REWARD_AVAILABLE`
- **Ads** → `CAMPAIGN_PENDING_APPROVAL`
- **Reviews** → `EXPERIENCE_REVIEW`

### Eventos que Generan Puntos

- Crear reserva → +50 puntos
- Completar reserva → +100 puntos
- Dejar reseña → +20 puntos
- Compartir en red social → +10 puntos
- Primer booking → +100 puntos (bonus)
- Recomendar amigo → +200 puntos

## Seguridad

### Autenticación
- JWT con expiración configurable
- Refresh tokens
- Password hashing con bcrypt
- Rate limiting en endpoints sensibles

### Autorización
- Guards basados en roles
- Decorador @Roles para proteger endpoints
- Validación de ownership (solo el dueño puede editar)

### Validación
- DTOs con class-validator
- Transformación automática con class-transformer
- Sanitización de inputs
- Prevención de SQL injection (TypeORM)
- Prevención de NoSQL injection (Mongoose)

### Rate Limiting
- Límite global: 100 requests/minuto
- Configurable por endpoint

## Monitoreo y Logs

### Logs
- Todas las peticiones HTTP
- Errores con stack trace
- Eventos importantes (reservas, pagos, etc.)

### Métricas (por implementar)
- Tiempo de respuesta promedio
- Requests por segundo
- Errores por tipo
- Uso de base de datos

## Escalabilidad

### Arquitectura Modular
- Cada módulo es independiente
- Fácil de escalar horizontalmente
- Posibilidad de microservicios en el futuro

### Caché (por implementar)
- Redis para sesiones
- Caché de queries frecuentes
- Caché de estadísticas

### Optimización
- Índices en base de datos
- Eager loading para evitar N+1
- Paginación en todas las listas
- Compresión de respuestas

## Contacto y Soporte

**Proyecto:** Viajero Conectado
**Versión:** 1.0.0
**Stack:** NestJS + PostgreSQL + MongoDB
**Arquitectura:** Monorepo con Turborepo

---

**Última actualización:** 2024-06-01
