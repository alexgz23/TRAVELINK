# API de Notificaciones

Sistema completo de notificaciones en tiempo real para mantener a los usuarios informados sobre eventos importantes en la plataforma.

## Índice

- [Características](#características)
- [Tipos de Notificaciones](#tipos-de-notificaciones)
- [Endpoints de Notificaciones](#endpoints-de-notificaciones)
- [Endpoints de Preferencias](#endpoints-de-preferencias)
- [Ejemplos de Uso](#ejemplos-de-uso)

## Características

### Notificaciones Multi-canal
- ✅ In-App (dentro de la aplicación)
- ✅ Email
- ✅ Push notifications
- ✅ SMS

### Gestión de Notificaciones
- ✅ Lectura/No leída
- ✅ Archivar/Desarchivar
- ✅ Eliminar individual o en masa
- ✅ Acciones en masa (bulk actions)
- ✅ Agrupación de notificaciones similares
- ✅ Contador de no leídas
- ✅ Prioridades (Baja, Normal, Alta, Urgente)

### Preferencias de Usuario
- ✅ Habilitar/deshabilitar por canal
- ✅ Configurar preferencias por tipo de notificación
- ✅ Horarios de "No Molestar"
- ✅ Email digest (resumen diario/semanal)
- ✅ Personalización completa

### Notificaciones Programadas
- ✅ Envío programado (scheduled)
- ✅ Fecha de expiración
- ✅ Recordatorios

## Tipos de Notificaciones

### Reservas (Bookings)
```typescript
BOOKING_CREATED        // Reserva creada
BOOKING_CONFIRMED      // Reserva confirmada
BOOKING_CANCELLED      // Reserva cancelada
BOOKING_REMINDER       // Recordatorio de reserva próxima
```

### Pagos (Payments)
```typescript
PAYMENT_SUCCESSFUL     // Pago exitoso
PAYMENT_FAILED         // Pago fallido
PAYMENT_REFUND         // Reembolso procesado
```

### Red Social
```typescript
POST_LIKE             // Me gusta en publicación
POST_COMMENT          // Comentario en publicación
NEW_FOLLOWER          // Nuevo seguidor
MENTION               // Mención en post/comentario
```

### B2B (Alianzas)
```typescript
ALLIANCE_REQUEST      // Solicitud de alianza
ALLIANCE_ACCEPTED     // Alianza aceptada
ALLIANCE_REJECTED     // Alianza rechazada
CONTRACT_SIGNED       // Contrato firmado
TRANSACTION_PAID      // Transacción pagada
```

### Puntos y Gamificación
```typescript
POINTS_EARNED         // Puntos ganados
LEVEL_UP              // Subida de nivel
REWARD_AVAILABLE      // Recompensa disponible
REWARD_REDEEMED       // Recompensa canjeada
```

### Experiencias
```typescript
NEW_EXPERIENCE        // Nueva experiencia disponible
EXPERIENCE_UPDATED    // Experiencia actualizada
EXPERIENCE_REVIEW     // Nueva reseña en experiencia
```

### Admin
```typescript
CAMPAIGN_PENDING_APPROVAL  // Campaña pendiente de aprobación
REPORT_RECEIVED           // Reporte recibido
```

### General
```typescript
SYSTEM_ANNOUNCEMENT   // Anuncio del sistema
WELCOME               // Bienvenida
```

## Endpoints de Notificaciones

### POST /notifications
Crear nueva notificación (solo admin/sistema).

**Auth:** JWT (ADMIN)

**Body:**
```json
{
  "userId": "uuid",
  "type": "booking_created",
  "priority": "normal",
  "channels": ["in_app", "email"],
  "title": "Reserva confirmada",
  "message": "Tu reserva para 'Tour Cancún' ha sido confirmada",
  "data": {
    "entityId": "booking-uuid",
    "entityType": "booking",
    "actionUrl": "/bookings/booking-uuid",
    "imageUrl": "https://...",
    "actorId": "user-uuid",
    "actorName": "Juan Pérez"
  },
  "scheduledFor": "2024-06-15T10:00:00Z",
  "expiresAt": "2024-07-15T23:59:59Z",
  "groupKey": "booking_reminders"
}
```

**Response:**
```json
{
  "_id": "mongodb-id",
  "userId": "uuid",
  "type": "booking_created",
  "priority": "normal",
  "channels": ["in_app", "email"],
  "status": "pending",
  "title": "Reserva confirmada",
  "message": "Tu reserva para 'Tour Cancún' ha sido confirmada",
  "data": {
    "entityId": "booking-uuid",
    "entityType": "booking",
    "actionUrl": "/bookings/booking-uuid"
  },
  "isRead": false,
  "isArchived": false,
  "scheduledFor": "2024-06-15T10:00:00.000Z",
  "createdAt": "2024-06-01T10:00:00.000Z",
  "updatedAt": "2024-06-01T10:00:00.000Z"
}
```

### POST /notifications/bulk
Crear múltiples notificaciones en batch.

**Auth:** JWT (ADMIN)

**Body:** Array de CreateNotificationDto

**Response:** Array de notificaciones creadas

### GET /notifications/my-notifications
Obtener mis notificaciones.

**Auth:** JWT

**Query Params:**
- `type`: Tipo de notificación
- `status`: pending | sent | delivered | read | failed
- `isRead`: true | false
- `isArchived`: true | false
- `page`: número de página (default: 1)
- `limit`: resultados por página (default: 20)

**Response:**
```json
{
  "items": [
    {
      "_id": "mongodb-id",
      "type": "booking_created",
      "title": "Reserva confirmada",
      "message": "Tu reserva ha sido confirmada",
      "isRead": false,
      "createdAt": "2024-06-01T10:00:00.000Z"
    }
  ],
  "total": 50,
  "unreadCount": 12,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### GET /notifications/:id
Obtener notificación por ID.

**Auth:** JWT

**Response:** Objeto Notification

### PATCH /notifications/:id/read
Marcar notificación como leída.

**Auth:** JWT

**Response:**
```json
{
  "_id": "mongodb-id",
  "isRead": true,
  "readAt": "2024-06-01T12:30:00.000Z",
  "status": "read",
  ...
}
```

### PATCH /notifications/:id/unread
Marcar notificación como no leída.

**Auth:** JWT

**Response:**
```json
{
  "_id": "mongodb-id",
  "isRead": false,
  "readAt": null,
  "status": "delivered",
  ...
}
```

### POST /notifications/read-all
Marcar todas las notificaciones como leídas.

**Auth:** JWT

**Response:**
```json
{
  "modifiedCount": 15
}
```

### PATCH /notifications/:id/archive
Archivar notificación.

**Auth:** JWT

**Response:**
```json
{
  "_id": "mongodb-id",
  "isArchived": true,
  ...
}
```

### PATCH /notifications/:id/unarchive
Desarchivar notificación.

**Auth:** JWT

**Response:**
```json
{
  "_id": "mongodb-id",
  "isArchived": false,
  ...
}
```

### DELETE /notifications/:id
Eliminar notificación.

**Auth:** JWT

**Response:**
```json
{
  "message": "Notificación eliminada exitosamente"
}
```

### DELETE /notifications
Eliminar todas las notificaciones del usuario.

**Auth:** JWT

**Response:**
```json
{
  "deletedCount": 25
}
```

### POST /notifications/bulk-action
Realizar acción en masa sobre notificaciones.

**Auth:** JWT

**Body:**
```json
{
  "notificationIds": ["id1", "id2", "id3"],
  "action": "mark_as_read"
}
```

O para aplicar a todas:
```json
{
  "all": true,
  "action": "archive"
}
```

**Acciones disponibles:**
- `mark_as_read`
- `mark_as_unread`
- `archive`
- `unarchive`
- `delete`

**Response:**
```json
{
  "modifiedCount": 3
}
```

### GET /notifications/unread/count
Obtener contador de notificaciones no leídas.

**Auth:** JWT

**Response:**
```json
{
  "unreadCount": 12
}
```

### GET /notifications/grouped/list
Obtener notificaciones agrupadas.

**Auth:** JWT

**Response:**
```json
[
  {
    "groupKey": "new_followers",
    "count": 5,
    "latestNotification": {
      "title": "Nuevo seguidor",
      "message": "María y 4 personas más comenzaron a seguirte",
      "createdAt": "2024-06-01T15:00:00.000Z"
    }
  }
]
```

**Nota:** Las notificaciones se agrupan cuando tienen el mismo `groupKey`.

## Endpoints de Preferencias

### GET /notifications/preferences/me
Obtener mis preferencias de notificaciones.

**Auth:** JWT

**Response:**
```json
{
  "userId": "uuid",
  "enableInApp": true,
  "enableEmail": true,
  "enablePush": false,
  "enableSms": false,
  "typePreferences": {
    "booking_created": {
      "enabled": true,
      "channels": ["in_app", "email"]
    },
    "post_like": {
      "enabled": false,
      "channels": []
    }
  },
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "08:00",
    "timezone": "America/Mexico_City"
  },
  "enableEmailDigest": true,
  "emailDigestFrequency": "daily",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-06-01T10:00:00.000Z"
}
```

### PATCH /notifications/preferences/me
Actualizar preferencias de notificaciones.

**Auth:** JWT

**Body:**
```json
{
  "enableEmail": false,
  "enablePush": true,
  "quietHours": {
    "enabled": true,
    "startTime": "23:00",
    "endTime": "07:00",
    "timezone": "America/Mexico_City"
  },
  "enableEmailDigest": true,
  "emailDigestFrequency": "weekly"
}
```

**Response:** Objeto NotificationPreferences actualizado

### PATCH /notifications/preferences/type/:type
Actualizar preferencia de un tipo específico de notificación.

**Auth:** JWT

**Params:**
- `type`: Tipo de notificación (ej: `booking_created`)

**Body:**
```json
{
  "enabled": false,
  "channels": ["in_app"]
}
```

**Response:** Objeto NotificationPreferences actualizado

## Ejemplos de Uso

### Flujo completo de notificación

#### 1. Usuario hace una reserva
```bash
# Backend automáticamente crea notificación
POST /notifications (internal)
{
  "userId": "user-uuid",
  "type": "booking_created",
  "title": "¡Reserva confirmada!",
  "message": "Tu reserva para 'Tour Chichén Itzá' ha sido confirmada",
  "data": {
    "entityId": "booking-uuid",
    "entityType": "booking",
    "actionUrl": "/bookings/booking-uuid"
  }
}
# Status: sent
# Enviada a canales: in_app, email
```

#### 2. Usuario revisa sus notificaciones
```bash
GET /notifications/my-notifications?page=1&limit=10
# Response:
{
  "items": [
    {
      "_id": "notif-1",
      "type": "booking_created",
      "title": "¡Reserva confirmada!",
      "isRead": false,
      "createdAt": "2024-06-01T10:00:00.000Z"
    }
  ],
  "total": 1,
  "unreadCount": 1
}
```

#### 3. Usuario ve contador de no leídas (para badge)
```bash
GET /notifications/unread/count
# Response:
{
  "unreadCount": 1
}
```

#### 4. Usuario hace clic en la notificación
```bash
# Frontend hace:
PATCH /notifications/notif-1/read
# Response:
{
  "isRead": true,
  "readAt": "2024-06-01T12:30:00.000Z"
}
```

#### 5. Usuario archiva la notificación
```bash
PATCH /notifications/notif-1/archive
# Response:
{
  "isArchived": true
}
```

### Ejemplo de preferencias

#### Usuario deshabilita notificaciones de likes
```bash
PATCH /notifications/preferences/type/post_like
{
  "enabled": false
}

# Ahora ya no recibirá notificaciones cuando alguien le de like
```

#### Usuario configura horario de No Molestar
```bash
PATCH /notifications/preferences/me
{
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "08:00",
    "timezone": "America/Mexico_City"
  }
}

# Notificaciones push/email se pausan durante ese horario
```

#### Usuario quiere solo notificaciones in-app
```bash
PATCH /notifications/preferences/me
{
  "enableInApp": true,
  "enableEmail": false,
  "enablePush": false,
  "enableSms": false
}
```

### Ejemplo de acciones en masa

#### Marcar todas como leídas
```bash
POST /notifications/bulk-action
{
  "all": true,
  "action": "mark_as_read"
}
# Response: { "modifiedCount": 15 }
```

#### Archivar varias notificaciones específicas
```bash
POST /notifications/bulk-action
{
  "notificationIds": ["id1", "id2", "id3"],
  "action": "archive"
}
# Response: { "modifiedCount": 3 }
```

#### Eliminar todas las notificaciones
```bash
DELETE /notifications
# Response: { "deletedCount": 25 }
```

### Ejemplo de notificaciones agrupadas

Cuando múltiples usuarios te siguen en poco tiempo:
```bash
GET /notifications/grouped/list
# Response:
[
  {
    "groupKey": "new_followers_user-uuid",
    "count": 5,
    "latestNotification": {
      "title": "Nuevos seguidores",
      "message": "María, Juan y 3 personas más comenzaron a seguirte",
      "data": {
        "actionUrl": "/profile/followers"
      },
      "createdAt": "2024-06-01T15:00:00.000Z"
    }
  }
]
```

## Helpers del Service

El servicio incluye métodos auxiliares para crear notificaciones comunes:

### Notificación de reserva
```typescript
await notificationsService.notifyBookingCreated(
  userId,
  bookingId,
  experienceName
);
```

### Notificación de pago
```typescript
await notificationsService.notifyPaymentSuccessful(
  userId,
  paymentId,
  amount
);
```

### Notificación de alianza
```typescript
await notificationsService.notifyAllianceRequest(
  providerId,
  allianceId,
  agencyName
);
```

### Notificación de seguidor
```typescript
await notificationsService.notifyNewFollower(
  userId,
  followerId,
  followerName
);
```

### Notificación de puntos
```typescript
await notificationsService.notifyPointsEarned(
  userId,
  points,
  reason
);
```

### Notificación de nivel
```typescript
await notificationsService.notifyLevelUp(
  userId,
  newLevel
);
```

## Enums

### NotificationType
```typescript
enum NotificationType {
  // Bookings
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',

  // Payments
  PAYMENT_SUCCESSFUL = 'payment_successful',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUND = 'payment_refund',

  // Social
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  NEW_FOLLOWER = 'new_follower',
  MENTION = 'mention',

  // B2B
  ALLIANCE_REQUEST = 'alliance_request',
  ALLIANCE_ACCEPTED = 'alliance_accepted',
  ALLIANCE_REJECTED = 'alliance_rejected',
  CONTRACT_SIGNED = 'contract_signed',
  TRANSACTION_PAID = 'transaction_paid',

  // Points
  POINTS_EARNED = 'points_earned',
  LEVEL_UP = 'level_up',
  REWARD_AVAILABLE = 'reward_available',
  REWARD_REDEEMED = 'reward_redeemed',

  // Experiences
  NEW_EXPERIENCE = 'new_experience',
  EXPERIENCE_UPDATED = 'experience_updated',
  EXPERIENCE_REVIEW = 'experience_review',

  // Admin
  CAMPAIGN_PENDING_APPROVAL = 'campaign_pending_approval',
  REPORT_RECEIVED = 'report_received',

  // General
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  WELCOME = 'welcome',
}
```

### NotificationPriority
```typescript
enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}
```

### NotificationChannel
```typescript
enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
}
```

### NotificationStatus
```typescript
enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}
```

## Estructura de Base de Datos (MongoDB)

### notifications
```javascript
{
  _id: ObjectId,
  userId: String,                    // UUID del usuario
  type: NotificationType,
  priority: NotificationPriority,
  channels: [NotificationChannel],
  status: NotificationStatus,

  title: String,
  message: String,
  data: {
    entityId: String,
    entityType: String,
    actionUrl: String,
    imageUrl: String,
    actorId: String,
    actorName: String
  },

  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  failedAt: Date,
  errorMessage: String,

  scheduledFor: Date,
  expiresAt: Date,
  groupKey: String,

  isRead: Boolean,
  isArchived: Boolean,
  isMuted: Boolean,

  createdAt: Date,
  updatedAt: Date
}

// Índices
{ userId: 1, isRead: 1, createdAt: -1 }
{ userId: 1, type: 1, createdAt: -1 }
{ status: 1, scheduledFor: 1 }
{ userId: 1, groupKey: 1 }
```

### notification_preferences
```javascript
{
  _id: ObjectId,
  userId: String,                    // UUID del usuario (único)

  enableInApp: Boolean,
  enableEmail: Boolean,
  enablePush: Boolean,
  enableSms: Boolean,

  typePreferences: Map<NotificationType, {
    enabled: Boolean,
    channels: [NotificationChannel]
  }>,

  quietHours: {
    enabled: Boolean,
    startTime: String,               // "22:00"
    endTime: String,                 // "08:00"
    timezone: String                 // "America/Mexico_City"
  },

  enableEmailDigest: Boolean,
  emailDigestFrequency: String,      // "daily" | "weekly"
  lastDigestSentAt: Date,

  createdAt: Date,
  updatedAt: Date
}

// Índice único
{ userId: 1 }
```

## Consideraciones de Performance

1. **Índices**: MongoDB con índices compuestos para queries rápidas
2. **Paginación**: Todas las listas paginadas por defecto (20 por página)
3. **Agrupación**: Notificaciones similares se agrupan con `groupKey`
4. **Caché**: Contador de no leídas puede cachearse
5. **Soft delete**: Las notificaciones se archivan en vez de eliminarse

## Integración con otros módulos

### Bookings
```typescript
// En BookingsService
await this.notificationsService.notifyBookingCreated(
  userId,
  booking.id,
  experience.name
);
```

### Payments
```typescript
// En PaymentsService
await this.notificationsService.notifyPaymentSuccessful(
  userId,
  payment.id,
  payment.amount
);
```

### Social
```typescript
// En SocialService
await this.notificationsService.notifyNewFollower(
  targetUserId,
  currentUserId,
  currentUserName
);
```

### Points
```typescript
// En PointsService
await this.notificationsService.notifyPointsEarned(
  userId,
  points,
  'completar tu perfil'
);
```

## Próximas Mejoras

- [ ] WebSocket para notificaciones en tiempo real
- [ ] Push notifications con Firebase Cloud Messaging
- [ ] Email templates personalizables
- [ ] SMS con Twilio
- [] Rich notifications con imágenes/acciones
- [ ] Notificaciones programadas recurrentes
- [ ] A/B testing de mensajes
- [ ] Analytics de engagement
- [ ] Deep linking en notificaciones
- [ ] Notificaciones offline con service workers
