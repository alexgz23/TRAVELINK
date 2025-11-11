# 🚀 Plan de Implementación - Viajero Conectado

**Basado en:** Especificación Funcional y Técnica completa
**Estado actual:** ~33% completado (Backend core: Auth, Users, Experiences)
**Objetivo:** Implementar el ecosistema completo por fases

---

## 📊 Estado Actual vs Especificación

### ✅ Ya Implementado
- ✅ Backend: Auth (JWT + refresh tokens)
- ✅ Backend: Users (perfiles básicos)
- ✅ Backend: Experiences (CRUD completo)
- ✅ Frontend: 9 páginas UI completas
- ✅ Base de datos: Schema con 12 modelos

### 🎯 Por Implementar (Según Especificación)
- 🔴 **6 Dashboards completos** (Viajero, Agencia, Hotel, Guía, Conductor, Admin)
- 🔴 **Módulo B2B completo** (Alianzas, acuerdos, órdenes)
- 🔴 **Red Social** (Feed, posts, likes, comentarios, stories)
- 🔴 **Sistema de Puntos** (5 niveles, misiones, recompensas)
- 🔴 **Bookings completo** (Reservas, pagos, estados)
- 🔴 **Reviews completo** (Reseñas, ratings, moderación)
- 🔴 **Chat** (WebSocket, mensajería 1-a-1 y grupos)
- 🔴 **Multimedia** (Cloudinary, álbumes, "Capturado en Ruta")
- 🔴 **Mapas** (Mapa personal, países visitados, rutas)
- 🔴 **Payments** (Stripe, split payments, multi-moneda)

---

## 🗺️ PLAN DE IMPLEMENTACIÓN POR FASES

---

## 📦 FASE 1: BACKEND CORE (Crítico para MVP)

**Duración estimada:** 8-12 horas
**Prioridad:** 🔴 ALTA - Sin esto no hay marketplace funcional

### Objetivos
Completar el backend para que el marketplace funcione end-to-end:
- ✅ Experiencias (ya hecho)
- 🎯 Bookings completo
- 🎯 Payments
- 🎯 Reviews
- 🎯 Uploads básico

### 1.1 Bookings Module (3-4 horas)

**Modelo actualizado en Prisma:**
```prisma
model Booking {
  id              String   @id @default(cuid())
  experienceId    String
  userId          String
  status          BookingStatus @default(PENDING)
  startDate       DateTime
  endDate         DateTime?
  numberOfPeople  Int
  totalPrice      Decimal
  commission      Decimal
  netPrice        Decimal
  paymentStatus   PaymentStatus @default(PENDING)
  paymentMethod   String?
  notes           String?

  experience      Experience @relation(fields: [experienceId], references: [id])
  user            User @relation(fields: [userId], references: [id])
  payments        Payment[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum BookingStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  REJECTED
}

enum PaymentStatus {
  PENDING
  PARTIAL
  PAID
  REFUNDED
}
```

**Endpoints a implementar:**
- `POST /bookings` - Crear reserva
- `GET /bookings` - Listar mis reservas (con filtros)
- `GET /bookings/:id` - Detalle de reserva
- `PATCH /bookings/:id/confirm` - Confirmar (provider)
- `PATCH /bookings/:id/cancel` - Cancelar
- `PATCH /bookings/:id/status` - Cambiar estado
- `GET /bookings/:id/documents` - Vouchers, tickets
- `POST /bookings/:id/extras` - Añadir extras

**Lógica de negocio:**
- Validar disponibilidad antes de crear
- Bloquear cupos temporalmente (15 min)
- Calcular comisiones automáticamente
- Políticas de cancelación por experiencia
- Notificaciones a usuario y proveedor

### 1.2 Payments Module (2-3 horas)

**Modelo:**
```prisma
model Payment {
  id              String   @id @default(cuid())
  bookingId       String
  amount          Decimal
  currency        String @default("COP")
  status          String
  method          String
  gatewayId       String?
  gatewayResponse Json?

  booking         Booking @relation(fields: [bookingId], references: [id])

  createdAt       DateTime @default(now())
}
```

**Integración Stripe:**
- Crear payment intent
- Webhook para confirmaciones
- Split payment (plataforma + proveedor)
- Refunds
- Multi-moneda (COP, USD, EUR)

**Endpoints:**
- `POST /payments/create-intent` - Crear intención de pago
- `POST /payments/webhooks/stripe` - Webhook Stripe
- `POST /payments/:id/refund` - Reembolso
- `GET /payments/booking/:bookingId` - Pagos de una reserva

### 1.3 Reviews Module Completo (2 horas)

**Modelo actualizado:**
```prisma
model Review {
  id              String   @id @default(cuid())
  experienceId    String
  userId          String
  bookingId       String? @unique
  rating          Int      // 1-5
  title           String?
  content         String
  photos          String[] // URLs
  isVerified      Boolean @default(false)
  isModerated     Boolean @default(false)
  moderationNotes String?
  helpfulCount    Int @default(0)

  experience      Experience @relation(fields: [experienceId], references: [id])
  user            User @relation(fields: [userId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Endpoints:**
- `POST /reviews` - Crear reseña
- `GET /reviews/experience/:id` - Reseñas de experiencia
- `GET /reviews/user/:id` - Reseñas del usuario
- `PATCH /reviews/:id/helpful` - Marcar como útil
- `PATCH /reviews/:id/moderate` - Moderar (admin)
- `DELETE /reviews/:id` - Eliminar (admin/owner)

**Lógica:**
- Solo usuarios con booking completado pueden reseñar
- Una reseña por booking
- Auto-moderación con palabras prohibidas
- Calcular rating promedio de experiencia

### 1.4 Uploads Module (1-2 horas)

**Cloudinary setup:**
- Configurar credenciales
- Upload de imágenes
- Resize y optimización automática
- Generar URLs

**Endpoints:**
- `POST /uploads/image` - Subir imagen
- `POST /uploads/images` - Múltiples imágenes
- `DELETE /uploads/:publicId` - Eliminar imagen

---

## 📱 FASE 2: DASHBOARD VIAJERO (Frontend + Backend)

**Duración estimada:** 10-12 horas
**Prioridad:** 🟡 MEDIA-ALTA

### 2.1 Backend: Perfil de Viajero Extendido (2 horas)

**Actualizar modelo User:**
```prisma
model User {
  // ... campos existentes
  bio             String?
  country         String?
  city            String?
  languages       String[]
  travelStyle     String[]
  budgetRange     String?
  dreamDestinations String[]

  // Estadísticas
  countriesVisited String[]
  citiesVisited    String[]
  totalTrips       Int @default(0)

  // Puntos
  points          Int @default(0)
  level           UserLevel @default(EXPLORER)

  // Privacy
  isProfilePublic Boolean @default(true)
  showMap         Boolean @default(true)
  showTrips       Boolean @default(true)
}

enum UserLevel {
  EXPLORER
  WALKER
  ACTIVE_TRAVELER
  EXPERT_TRAVELER
  AMBASSADOR
}
```

**Endpoints:**
- `PUT /users/profile/extended` - Actualizar perfil completo
- `GET /users/:id/stats` - Estadísticas del viajero
- `GET /users/:id/map` - Mapa de viajes
- `PUT /users/privacy` - Configuración de privacidad

### 2.2 Frontend: Dashboard Viajero (8-10 horas)

**Páginas a crear:**

1. **`/dashboard`** - Resumen personal
   - Próximo viaje con countdown
   - Reservas activas
   - Checklist de pendientes
   - Recomendaciones personalizadas

2. **`/dashboard/trips`** - Mis Viajes
   - Lista de reservas (tabs: Activas, Futuras, Pasadas, Canceladas)
   - Detalle de cada reserva
   - Itinerario, documentos, pagos
   - Acciones: pagar, cancelar, modificar

3. **`/dashboard/captured`** - Capturado en Ruta
   - Galería de fotos por viaje
   - Upload de fotos
   - Álbumes
   - Timeline view

4. **`/dashboard/map`** - Mapa Personal
   - Mapa mundial con países visitados
   - Rutas de viajes
   - Estadísticas

5. **`/dashboard/profile`** - Perfil y Configuración
   - Editar perfil
   - Métodos de pago
   - Documentos de viaje
   - Privacidad

6. **`/dashboard/points`** - Puntos y Niveles
   - Balance de puntos
   - Progreso al siguiente nivel
   - Misiones
   - Catálogo de recompensas

---

## 🏢 FASE 3: DASHBOARD AGENCIA

**Duración estimada:** 12-15 horas
**Prioridad:** 🟡 MEDIA

### 3.1 Backend: Agency Module (6-8 horas)

**Nuevos modelos:**

```prisma
model Agency {
  id              String   @id @default(cuid())
  userId          String   @unique
  businessName    String
  legalName       String
  taxId           String
  phone           String
  address         String
  city            String
  country         String

  // Perfil público
  logo            String?
  description     String
  specialties     String[]
  destinations    String[]

  // Verificación
  isVerified      Boolean @default(false)
  isPremium       Boolean @default(false)
  verificationDocs Json?

  // B2B
  canUseB2B       Boolean @default(false)

  user            User @relation(fields: [userId], references: [id])
  experiences     Experience[]
  bookings        Booking[] // Como provider

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Product {
  // Alias para Experience pero con campos adicionales para agencias
  // Como packages, multi-day tours, etc.
}
```

**Endpoints a implementar:**
- `POST /agencies` - Registrar agencia
- `GET /agencies/:id` - Perfil de agencia
- `PUT /agencies/:id` - Actualizar agencia
- `POST /agencies/:id/verify` - Subir docs de verificación
- `GET /agencies/:id/stats` - KPIs de la agencia
- `GET /agencies/:id/bookings` - Reservas recibidas
- `POST /agencies/:id/products` - Crear producto turístico
- `PUT /agencies/:id/products/:productId` - Actualizar producto
- `GET /agencies/:id/calendar` - Calendario y cupos
- `PUT /agencies/:id/calendar` - Actualizar disponibilidad

### 3.2 Frontend: Dashboard Agencia (6-7 horas)

**Páginas:**

1. **`/agency/dashboard`** - Resumen Ejecutivo
   - KPIs (reservas, ingresos, productos top)
   - Alertas (reservas sin confirmar, pagos pendientes)
   - Gráficas

2. **`/agency/products`** - Productos Turísticos
   - Lista de productos
   - Crear/editar producto
   - Galería, itinerarios, tarifas

3. **`/agency/calendar`** - Calendario y Cupos
   - Vista mensual
   - Temporadas de precios
   - Cupos por salida

4. **`/agency/bookings`** - Reservas
   - Lista con filtros
   - Detalle de reserva
   - Acciones (confirmar, modificar, cancelar)

5. **`/agency/finances`** - Finanzas
   - Ingresos vs comisiones
   - Cuentas por cobrar
   - Reportes

---

## 🏨 FASE 4: DASHBOARDS HOTEL, GUÍA, CONDUCTOR

**Duración estimada:** 8-10 horas
**Prioridad:** 🟢 MEDIA-BAJA

Similar a Dashboard Agencia pero adaptado a cada tipo de proveedor.

### 4.1 Backend: Provider Modules (4-5 horas)

**Modelos:**
```prisma
model Hotel {
  id              String @id @default(cuid())
  // Similar a Agency
}

model Guide {
  id              String @id @default(cuid())
  // Perfil de guía
}

model Driver {
  id              String @id @default(cuid())
  // Perfil de conductor/transporte
}
```

### 4.2 Frontend: 3 Dashboards (4-5 horas)

Compartir componentes con Dashboard Agencia y adaptar.

---

## 🤝 FASE 5: MÓDULO B2B

**Duración estimada:** 15-20 horas
**Prioridad:** 🟡 MEDIA

### 5.1 Backend: B2B System (10-12 horas)

**Modelos:**
```prisma
model B2BPartnership {
  id              String @id @default(cuid())
  requesterId     String // Agency
  providerId      String // Hotel, Guide, Driver
  status          PartnershipStatus
  terms           Json // Tarifas, condiciones

  createdAt       DateTime @default(now())
}

model B2BOrder {
  id              String @id @default(cuid())
  partnershipId   String
  type            String // "rooms", "guide-services", "transport"
  details         Json
  status          OrderStatus

  createdAt       DateTime @default(now())
}
```

**Endpoints:**
- Directorio B2B
- Solicitudes de alianza
- Acuerdos
- Órdenes B2B

### 5.2 Frontend: B2B Interface (5-8 horas)

Integrar en dashboards de agencias y proveedores.

---

## 📱 FASE 6: RED SOCIAL

**Duración estimada:** 12-15 horas
**Prioridad:** 🟡 MEDIA

### 6.1 Backend: Social Module (6-8 horas)

**Modelos (ya en schema, completar lógica):**
- Post, Like, Comment

**Endpoints:**
- CRUD de posts
- Feed algorithm
- Likes, comentarios
- Follow system
- Stories (24h)

### 6.2 Frontend: Red Social (6-7 horas)

**Páginas:**
- `/social` - Feed
- `/social/post/:id` - Detalle post
- `/social/user/:id` - Perfil social
- Crear post, comentar, etc.

---

## 🎮 FASE 7: SISTEMA DE PUNTOS

**Duración estimada:** 10-12 horas
**Prioridad:** 🟢 MEDIA-BAJA

### 7.1 Backend: Points & Gamification (5-6 horas)

**Modelos:**
```prisma
model PointsTransaction {
  id              String @id @default(cuid())
  userId          String
  amount          Int
  reason          String
  referenceId     String?

  user            User @relation(fields: [userId], references: [id])
  createdAt       DateTime @default(now())
}

model Mission {
  id              String @id @default(cuid())
  title           String
  description     String
  points          Int
  type            String
  isActive        Boolean
}

model Reward {
  id              String @id @default(cuid())
  title           String
  description     String
  pointsCost      Int
  type            RewardType
  isActive        Boolean
}
```

**Lógica:**
- Reglas de acumulación
- Límites y expiración
- Canje de recompensas
- Niveles automáticos

### 7.2 Frontend: Puntos (5-6 horas)

Integrado en Dashboard Viajero.

---

## 👨‍💼 FASE 8: DASHBOARD ADMIN

**Duración estimada:** 15-20 horas
**Prioridad:** 🟢 BAJA (para cuando ya haya contenido)

### 8.1 Backend: Admin Module (8-10 horas)

**Endpoints:**
- KPIs globales
- Gestión de usuarios
- Verificación de proveedores
- Moderación de contenido
- Configuración de sistema

### 8.2 Frontend: Admin Dashboard (7-10 horas)

**Páginas:**
- `/admin/dashboard` - Visión global
- `/admin/users` - Gestión de usuarios
- `/admin/providers` - Proveedores
- `/admin/content` - Moderación
- `/admin/points` - Configuración de puntos
- `/admin/finances` - Finanzas de plataforma

---

## 📊 RESUMEN DE FASES

| Fase | Componente | Horas | Prioridad | Dependencias |
|------|-----------|-------|-----------|--------------|
| 1 | Backend Core | 8-12h | 🔴 CRÍTICA | Ninguna |
| 2 | Dashboard Viajero | 10-12h | 🟡 ALTA | Fase 1 |
| 3 | Dashboard Agencia | 12-15h | 🟡 MEDIA | Fase 1 |
| 4 | Dashboards Proveedores | 8-10h | 🟢 MEDIA-BAJA | Fase 3 |
| 5 | Módulo B2B | 15-20h | 🟡 MEDIA | Fase 3, 4 |
| 6 | Red Social | 12-15h | 🟡 MEDIA | Fase 2 |
| 7 | Sistema de Puntos | 10-12h | 🟢 MEDIA-BAJA | Fase 2, 6 |
| 8 | Dashboard Admin | 15-20h | 🟢 BAJA | Todas |

**TOTAL:** 90-116 horas (~12-15 días de trabajo full-time)

---

## 🎯 ESTRATEGIA RECOMENDADA

### MVP Mínimo (30-40 horas)
1. ✅ Fase 1: Backend Core (Bookings, Payments, Reviews)
2. ✅ Fase 2: Dashboard Viajero
3. ✅ Fase 3: Dashboard Agencia (básico)

Con esto ya tienes un **marketplace funcional end-to-end**.

### Producto Completo v1.0 (90-116 horas)
Todas las fases implementadas.

### Iteración Continua
- Testing y bugs
- UX improvements
- Performance optimization
- SEO
- Analytics

---

## 🚀 PRÓXIMO PASO

**¿Empezamos con FASE 1: Backend Core (Bookings Module)?**

Voy a implementar:
1. Bookings Module completo (3-4 horas)
2. Payments Module con Stripe (2-3 horas)
3. Reviews Module completo (2 horas)
4. Uploads Module básico (1-2 horas)

**Total Fase 1:** 8-12 horas de implementación

¿Procedemos?
