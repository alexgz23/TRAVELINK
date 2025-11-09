# API de Reseñas y Calificaciones

Sistema completo de reseñas y calificaciones para experiencias, agencias, hoteles, guías y conductores en la plataforma Viajero Conectado.

## Índice

- [Características](#características)
- [Entidades Reviewables](#entidades-reviewables)
- [Endpoints de Reseñas](#endpoints-de-reseñas)
- [Endpoints de Respuestas](#endpoints-de-respuestas)
- [Endpoints de Reportes](#endpoints-de-reportes)
- [Endpoints de Votación](#endpoints-de-votación)
- [Endpoints de Moderación](#endpoints-de-moderación)
- [Ejemplos de Uso](#ejemplos-de-uso)

## Características

### Sistema de Reseñas
- ✅ Calificación de 1-5 estrellas
- ✅ Título y comentario
- ✅ Calificaciones detalladas (limpieza, comunicación, precisión, valor, etc.)
- ✅ Fotos y videos en reseñas
- ✅ Compra verificada (vinculado a reservas confirmadas)
- ✅ Prevención de duplicados (una reseña por entidad)

### Respuestas de Proveedores
- ✅ Respuestas oficiales a reseñas
- ✅ Una respuesta por proveedor
- ✅ Edición de respuestas

### Sistema de Utilidad
- ✅ Votos de "útil" / "no útil"
- ✅ Ordenamiento por utilidad
- ✅ Prevención de voto duplicado

### Moderación y Reportes
- ✅ Reportar reseñas inapropiadas
- ✅ Razones de reporte: spam, ofensivo, falso, irrelevante
- ✅ Auto-flagging con múltiples reportes
- ✅ Panel de moderación para admins
- ✅ Aprobar/rechazar/ocultar reseñas

### Estadísticas
- ✅ Promedio de calificación
- ✅ Distribución de ratings (1-5 estrellas)
- ✅ Total de reseñas
- ✅ Filtrado y ordenamiento flexible

## Entidades Reviewables

El sistema soporta reseñas para:

```typescript
enum ReviewableType {
  EXPERIENCE = 'experience',  // Experiencias/tours
  AGENCY = 'agency',          // Agencias de viajes
  HOTEL = 'hotel',            // Hoteles
  GUIDE = 'guide',            // Guías turísticos
  DRIVER = 'driver',          // Conductores/transporte
}
```

## Endpoints de Reseñas

### POST /reviews
Crear nueva reseña.

**Auth:** JWT

**Body:**
```json
{
  "reviewableType": "experience",
  "reviewableId": "uuid",
  "bookingId": "uuid",
  "rating": 5,
  "title": "¡Experiencia increíble!",
  "comment": "Tuve una experiencia maravillosa en este tour. El guía fue muy profesional y conocedor. Totalmente recomendado.",
  "detailedRatings": {
    "accuracy": 5,
    "communication": 5,
    "value": 4,
    "service": 5
  },
  "mediaUrls": [
    "https://storage.viajero.com/reviews/photo1.jpg",
    "https://storage.viajero.com/reviews/photo2.jpg"
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "reviewableType": "experience",
  "reviewableId": "uuid",
  "bookingId": "uuid",
  "rating": 5,
  "title": "¡Experiencia increíble!",
  "comment": "Tuve una experiencia maravillosa...",
  "detailedRatings": {
    "accuracy": 5,
    "communication": 5,
    "value": 4,
    "service": 5
  },
  "mediaUrls": ["https://..."],
  "status": "approved",
  "isVerifiedPurchase": true,
  "helpfulCount": 0,
  "notHelpfulCount": 0,
  "reportCount": 0,
  "isEdited": false,
  "createdAt": "2024-06-01T10:00:00.000Z",
  "updatedAt": "2024-06-01T10:00:00.000Z"
}
```

**Validaciones:**
- Usuario solo puede reseñar una entidad una vez
- Si se proporciona bookingId, se marca como "compra verificada"
- Rating debe estar entre 1 y 5
- Título máximo 255 caracteres
- Comentario máximo 2000 caracteres

### GET /reviews
Obtener reseñas con filtros.

**Auth:** No requerida

**Query Params:**
- `reviewableType`: experience | agency | hotel | guide | driver
- `reviewableId`: UUID de la entidad
- `userId`: UUID del usuario (para ver sus reseñas)
- `status`: pending | approved | rejected | flagged | hidden
- `minRating`: 1-5
- `maxRating`: 1-5
- `isVerifiedPurchase`: true | false
- `sortBy`: recent | rating_high | rating_low | helpful
- `page`: número de página (default: 1)
- `limit`: resultados por página (default: 10)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez",
        "profilePicture": "https://..."
      },
      "rating": 5,
      "title": "¡Experiencia increíble!",
      "comment": "Tuve una experiencia maravillosa...",
      "isVerifiedPurchase": true,
      "helpfulCount": 15,
      "responses": [
        {
          "id": "uuid",
          "message": "¡Gracias por tu reseña!",
          "responderId": "uuid",
          "createdAt": "2024-06-02T10:00:00.000Z"
        }
      ],
      "createdAt": "2024-06-01T10:00:00.000Z"
    }
  ],
  "total": 50,
  "averageRating": 4.5,
  "ratingDistribution": {
    "1": 2,
    "2": 3,
    "3": 8,
    "4": 15,
    "5": 22
  },
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### GET /reviews/:id
Obtener reseña por ID.

**Auth:** No requerida

**Response:** Objeto Review completo con relaciones

### PATCH /reviews/:id
Actualizar reseña.

**Auth:** JWT (solo el autor)

**Body:**
```json
{
  "rating": 4,
  "title": "Muy buena experiencia",
  "comment": "Actualización: después de pensarlo mejor...",
  "detailedRatings": {
    "value": 5
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "rating": 4,
  "isEdited": true,
  "editedAt": "2024-06-03T15:00:00.000Z",
  ...
}
```

### DELETE /reviews/:id
Eliminar reseña.

**Auth:** JWT (solo el autor)

**Response:**
```json
{
  "message": "Reseña eliminada exitosamente"
}
```

### GET /reviews/stats/summary
Obtener estadísticas de reseñas.

**Auth:** No requerida

**Query Params:**
- `reviewableType`: Tipo de entidad
- `reviewableId`: ID de la entidad

**Response:**
```json
{
  "averageRating": 4.5,
  "totalReviews": 50,
  "ratingDistribution": {
    "1": 2,
    "2": 3,
    "3": 8,
    "4": 15,
    "5": 22
  }
}
```

## Endpoints de Respuestas

### POST /reviews/responses
Crear respuesta a una reseña.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Body:**
```json
{
  "reviewId": "uuid",
  "message": "Gracias por tu reseña. Nos alegra mucho que hayas disfrutado la experiencia. ¡Esperamos verte pronto!"
}
```

**Response:**
```json
{
  "id": "uuid",
  "reviewId": "uuid",
  "responderId": "uuid",
  "message": "Gracias por tu reseña...",
  "isEdited": false,
  "createdAt": "2024-06-02T10:00:00.000Z",
  "updatedAt": "2024-06-02T10:00:00.000Z"
}
```

**Validaciones:**
- Solo un proveedor puede responder a una reseña
- El proveedor debe ser el dueño de la entidad reseñada
- Mensaje máximo 1000 caracteres

### PATCH /reviews/responses/:id
Actualizar respuesta.

**Auth:** JWT (solo el autor)

**Body:**
```json
{
  "message": "Mensaje actualizado..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "message": "Mensaje actualizado...",
  "isEdited": true,
  "editedAt": "2024-06-03T12:00:00.000Z",
  ...
}
```

### DELETE /reviews/responses/:id
Eliminar respuesta.

**Auth:** JWT (solo el autor)

**Response:**
```json
{
  "message": "Respuesta eliminada exitosamente"
}
```

## Endpoints de Reportes

### POST /reviews/report
Reportar reseña inapropiada.

**Auth:** JWT

**Body:**
```json
{
  "reviewId": "uuid",
  "reason": "spam",
  "details": "Esta reseña es claramente spam promocionando otro servicio."
}
```

**Razones de reporte:**
```typescript
enum ReportReason {
  SPAM = 'spam',
  OFFENSIVE = 'offensive',
  FAKE = 'fake',
  IRRELEVANT = 'irrelevant',
  OTHER = 'other',
}
```

**Response:**
```json
{
  "id": "uuid",
  "reviewId": "uuid",
  "reporterId": "uuid",
  "reason": "spam",
  "details": "Esta reseña es claramente spam...",
  "status": "pending",
  "createdAt": "2024-06-01T10:00:00.000Z"
}
```

**Nota:** Si una reseña recibe 5 o más reportes, automáticamente se marca como `FLAGGED` y requiere revisión administrativa.

### GET /reviews/admin/reports/pending
Obtener reportes pendientes (admin).

**Auth:** JWT (ADMIN)

**Response:**
```json
[
  {
    "id": "uuid",
    "review": {
      "id": "uuid",
      "title": "Reseña reportada",
      "rating": 1,
      "comment": "...",
      "reportCount": 3
    },
    "reporterId": "uuid",
    "reason": "offensive",
    "details": "...",
    "status": "pending",
    "createdAt": "2024-06-01T10:00:00.000Z"
  }
]
```

### POST /reviews/admin/reports/:id/resolve
Resolver reporte (admin).

**Auth:** JWT (ADMIN)

**Body:**
```json
{
  "resolution": "Reseña revisada y aprobada. No viola las políticas."
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "resolved",
  "reviewedBy": "admin-uuid",
  "reviewedAt": "2024-06-02T10:00:00.000Z",
  "resolution": "Reseña revisada y aprobada...",
  ...
}
```

## Endpoints de Votación

### POST /reviews/helpful
Votar si una reseña es útil.

**Auth:** JWT

**Body:**
```json
{
  "reviewId": "uuid",
  "isHelpful": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "reviewId": "uuid",
  "userId": "uuid",
  "isHelpful": true,
  "createdAt": "2024-06-01T10:00:00.000Z"
}
```

**Lógica:**
- Si el usuario ya votó, actualiza su voto
- Los contadores `helpfulCount` y `notHelpfulCount` se actualizan automáticamente
- Previene votación duplicada

### DELETE /reviews/helpful/:reviewId
Remover voto de utilidad.

**Auth:** JWT

**Response:**
```json
{
  "message": "Voto removido exitosamente"
}
```

## Endpoints de Moderación

### POST /reviews/admin/:id/moderate
Moderar reseña (admin).

**Auth:** JWT (ADMIN)

**Body:**
```json
{
  "status": "rejected",
  "reason": "La reseña contiene lenguaje ofensivo que viola nuestras políticas."
}
```

**Estados disponibles:**
```typescript
enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  HIDDEN = 'hidden',
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "rejected",
  "moderatedBy": "admin-uuid",
  "moderatedAt": "2024-06-02T10:00:00.000Z",
  "moderationReason": "La reseña contiene lenguaje ofensivo...",
  ...
}
```

### GET /reviews/admin/flagged
Obtener reseñas reportadas (admin).

**Auth:** JWT (ADMIN)

**Response:**
```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "firstName": "Usuario",
      "email": "user@example.com"
    },
    "title": "Reseña con múltiples reportes",
    "rating": 1,
    "status": "flagged",
    "reportCount": 7,
    "reports": [
      {
        "reason": "spam",
        "details": "...",
        "createdAt": "2024-06-01T10:00:00.000Z"
      }
    ],
    "createdAt": "2024-06-01T08:00:00.000Z"
  }
]
```

## Ejemplos de Uso

### Flujo completo de reseña

#### 1. Usuario completa una experiencia
```bash
# Usuario hace checkout de su reserva
# El sistema le permite dejar una reseña
```

#### 2. Usuario crea reseña
```bash
POST /reviews
{
  "reviewableType": "experience",
  "reviewableId": "exp-uuid",
  "bookingId": "booking-uuid",
  "rating": 5,
  "title": "¡Tour increíble en Chichén Itzá!",
  "comment": "El guía Carlos fue excepcional. Nos explicó la historia maya de manera muy entretenida. El transporte fue cómodo y puntual. Totalmente recomendado.",
  "detailedRatings": {
    "accuracy": 5,
    "communication": 5,
    "value": 5,
    "service": 5
  },
  "mediaUrls": ["https://storage.viajero.com/reviews/chichen-1.jpg"]
}

# Response:
{
  "id": "review-uuid",
  "status": "approved",
  "isVerifiedPurchase": true,
  ...
}
```

#### 3. Agencia ve la reseña y responde
```bash
POST /reviews/responses
{
  "reviewId": "review-uuid",
  "message": "¡Muchas gracias por tu reseña! Nos alegra mucho que hayas disfrutado del tour. Carlos es uno de nuestros mejores guías y le compartiremos tus comentarios. ¡Esperamos verte en futuras aventuras!"
}
```

#### 4. Otros usuarios ven la reseña
```bash
GET /reviews?reviewableType=experience&reviewableId=exp-uuid&sortBy=helpful

# Response:
{
  "items": [
    {
      "user": {
        "firstName": "Juan",
        "profilePicture": "..."
      },
      "rating": 5,
      "title": "¡Tour increíble en Chichén Itzá!",
      "comment": "...",
      "isVerifiedPurchase": true,
      "helpfulCount": 0,
      "responses": [
        {
          "message": "¡Muchas gracias por tu reseña!...",
          "createdAt": "..."
        }
      ]
    }
  ],
  "averageRating": 5.0,
  "totalReviews": 1
}
```

#### 5. Usuario encuentra útil la reseña
```bash
POST /reviews/helpful
{
  "reviewId": "review-uuid",
  "isHelpful": true
}

# La reseña ahora tiene helpfulCount: 1
```

### Ejemplo de reporte y moderación

#### 1. Usuario reporta reseña sospechosa
```bash
POST /reviews/report
{
  "reviewId": "spam-review-uuid",
  "reason": "spam",
  "details": "Esta reseña está promocionando otra compañía y no es relevante."
}
```

#### 2. Múltiples usuarios reportan la misma reseña
```bash
# Después del 5to reporte
# La reseña automáticamente se marca como: status: "flagged"
```

#### 3. Admin revisa reseñas flagged
```bash
GET /reviews/admin/flagged

# Response:
[
  {
    "id": "spam-review-uuid",
    "status": "flagged",
    "reportCount": 6,
    "reports": [...]
  }
]
```

#### 4. Admin modera la reseña
```bash
POST /reviews/admin/spam-review-uuid/moderate
{
  "status": "rejected",
  "reason": "La reseña es spam y viola nuestras políticas de contenido."
}

# La reseña ya no aparece en listados públicos
```

#### 5. Admin resuelve los reportes
```bash
POST /reviews/admin/reports/report-uuid/resolve
{
  "resolution": "Reseña eliminada por violación de políticas."
}
```

### Ejemplo de estadísticas

#### Obtener stats de una experiencia
```bash
GET /reviews/stats/summary?reviewableType=experience&reviewableId=exp-uuid

# Response:
{
  "averageRating": 4.5,
  "totalReviews": 127,
  "ratingDistribution": {
    "1": 3,
    "2": 5,
    "3": 15,
    "4": 42,
    "5": 62
  }
}
```

## Enums

### ReviewableType
```typescript
enum ReviewableType {
  EXPERIENCE = 'experience',
  AGENCY = 'agency',
  HOTEL = 'hotel',
  GUIDE = 'guide',
  DRIVER = 'driver',
}
```

### ReviewStatus
```typescript
enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  HIDDEN = 'hidden',
}
```

### ReviewSortBy
```typescript
enum ReviewSortBy {
  RECENT = 'recent',
  RATING_HIGH = 'rating_high',
  RATING_LOW = 'rating_low',
  HELPFUL = 'helpful',
}
```

### ReportReason
```typescript
enum ReportReason {
  SPAM = 'spam',
  OFFENSIVE = 'offensive',
  FAKE = 'fake',
  IRRELEVANT = 'irrelevant',
  OTHER = 'other',
}
```

## Estructura de Base de Datos

### reviews
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  reviewable_type reviewable_type NOT NULL,
  reviewable_id UUID NOT NULL,
  booking_id UUID,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  detailed_ratings JSONB,
  media_urls TEXT[],

  status review_status DEFAULT 'pending',
  moderated_by UUID,
  moderated_at TIMESTAMP,
  moderation_reason TEXT,

  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,

  is_verified_purchase BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Índices
CREATE INDEX idx_reviews_reviewable ON reviews(reviewable_type, reviewable_id, status);
CREATE INDEX idx_reviews_user ON reviews(user_id, created_at);
CREATE UNIQUE INDEX idx_reviews_unique_per_entity ON reviews(user_id, reviewable_type, reviewable_id);
```

### review_responses
```sql
CREATE TABLE review_responses (
  id UUID PRIMARY KEY,
  review_id UUID NOT NULL,
  responder_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);
```

### review_reports
```sql
CREATE TABLE review_reports (
  id UUID PRIMARY KEY,
  review_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  reason report_reason NOT NULL,
  details TEXT,
  status report_status DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  resolution TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);
```

### review_helpful
```sql
CREATE TABLE review_helpful (
  id UUID PRIMARY KEY,
  review_id UUID NOT NULL,
  user_id UUID NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  UNIQUE(review_id, user_id)
);
```

## Consideraciones de Seguridad

1. **Prevención de spam**: Una reseña por usuario por entidad
2. **Verificación**: Reseñas vinculadas a reservas se marcan como "compra verificada"
3. **Moderación**: Sistema de reportes con auto-flagging
4. **Ownership**: Solo el autor puede editar/eliminar sus reseñas
5. **Respuestas**: Solo el proveedor puede responder a reseñas de su entidad

## Performance

1. **Índices**: Índices compuestos para queries rápidas
2. **Unique constraint**: Previene duplicados a nivel de base de datos
3. **Paginación**: Todas las listas paginadas
4. **Eager loading**: Incluir relaciones user/responses para evitar N+1 queries

## Próximas Mejoras

- [ ] Filtro por calificaciones detalladas
- [ ] Trending reviews (más populares)
- [ ] Verificación de imágenes con IA
- [ ] Detección automática de spam con ML
- [ ] Reseñas con video
- [ ] Badges para top reviewers
- [ ] Respuestas con plantillas predefinidas
- [ ] Analytics de sentimiento
- [ ] Export de reseñas en PDF
- [ ] API webhook para nuevas reseñas
