# Esquema de Base de Datos - Viajero Conectado

## PostgreSQL - Base Relacional

### Core Tables

#### Users & Authentication

```sql
-- Tabla principal de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('viajero', 'agencia', 'hotel', 'guia', 'conductor', 'admin')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  email_verified_at TIMESTAMP,
  phone VARCHAR(50),
  phone_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Perfiles sociales de usuarios
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(500),
  cover_url VARCHAR(500),
  country_code VARCHAR(2),
  city VARCHAR(100),
  languages VARCHAR(255)[], -- array de códigos de idioma
  date_of_birth DATE,
  gender VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Preferencias de viaje
CREATE TABLE user_travel_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  travel_styles VARCHAR(50)[], -- ['adventure', 'luxury', 'nature', 'urban']
  interests VARCHAR(50)[], -- ['food', 'culture', 'sports', 'nightlife']
  budget_range VARCHAR(50), -- 'budget', 'mid', 'luxury'
  group_preferences VARCHAR(50)[], -- ['solo', 'couple', 'family', 'group']
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conexiones sociales (followers)
CREATE TABLE user_connections (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX idx_connections_follower ON user_connections(follower_id);
CREATE INDEX idx_connections_following ON user_connections(following_id);

-- OAuth providers
CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'facebook', 'apple'
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);
```

#### Experiences (Tours, Actividades)

```sql
-- Experiencias/Tours
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category VARCHAR(100), -- 'tour', 'activity', 'transport', 'package'
  subcategory VARCHAR(100),
  location_country VARCHAR(2),
  location_city VARCHAR(100),
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  duration_hours INTEGER,
  difficulty_level VARCHAR(50), -- 'easy', 'moderate', 'hard'
  min_age INTEGER,
  max_group_size INTEGER,
  languages VARCHAR(50)[],
  price_from DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'COP',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_experiences_agency ON experiences(agency_id);
CREATE INDEX idx_experiences_location ON experiences(location_lat, location_lng);
CREATE INDEX idx_experiences_status ON experiences(status);

-- Variantes de experiencia (diferentes precios/configuraciones)
CREATE TABLE experience_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  max_people INTEGER,
  includes TEXT[],
  excludes TEXT[],
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Itinerarios (día a día)
CREATE TABLE experience_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title VARCHAR(255),
  description TEXT,
  location VARCHAR(255),
  meals VARCHAR(50)[], -- ['breakfast', 'lunch', 'dinner']
  created_at TIMESTAMP DEFAULT NOW()
);

-- Media de experiencias
CREATE TABLE experience_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('image', 'video')),
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Calendario y disponibilidad
CREATE TABLE experience_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES experience_variants(id),
  date DATE NOT NULL,
  time TIME,
  available_spots INTEGER NOT NULL,
  price_override DECIMAL(10, 2), -- override de precio para fecha específica
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'limited', 'sold_out')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(experience_id, variant_id, date, time)
);

CREATE INDEX idx_availability_date ON experience_availability(date);
CREATE INDEX idx_availability_experience ON experience_availability(experience_id);
```

#### Bookings (Reservas)

```sql
-- Reservas
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  experience_id UUID REFERENCES experiences(id),
  variant_id UUID REFERENCES experience_variants(id),
  availability_id UUID REFERENCES experience_availability(id),
  booking_date DATE NOT NULL,
  booking_time TIME,
  num_adults INTEGER DEFAULT 1,
  num_children INTEGER DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'COP',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'cancelled', 'completed', 'refunded'
  )),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_experience ON bookings(experience_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);

-- Viajeros en la reserva
CREATE TABLE booking_travelers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('adult', 'child')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  document_type VARCHAR(50),
  document_number VARCHAR(100),
  date_of_birth DATE,
  nationality VARCHAR(2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documentos de reserva (vouchers, tickets, etc.)
CREATE TABLE booking_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'voucher', 'ticket', 'insurance', 'invoice'
  name VARCHAR(255),
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Payments

```sql
-- Pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'COP',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'succeeded', 'failed', 'refunded'
  )),
  provider VARCHAR(50), -- 'stripe', 'mercadopago'
  provider_payment_id VARCHAR(255),
  provider_customer_id VARCHAR(255),
  payment_method VARCHAR(50), -- 'card', 'pse', 'cash', etc.
  fee_amount DECIMAL(10, 2), -- comisión de la plataforma
  net_amount DECIMAL(10, 2), -- monto neto para el proveedor
  refund_amount DECIMAL(10, 2),
  refunded_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider ON payments(provider, provider_payment_id);
```

#### Points System

```sql
-- Puntos de usuario
CREATE TABLE user_points (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  level VARCHAR(50) DEFAULT 'explorador',
  level_progress DECIMAL(5, 2) DEFAULT 0, -- porcentaje hacia siguiente nivel
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Historial de transacciones de puntos
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL, -- positivo = ganado, negativo = gastado
  type VARCHAR(50) CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  reason VARCHAR(255),
  reference_type VARCHAR(50), -- 'booking', 'review', 'social_post', 'referral'
  reference_id UUID,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_points_tx_user ON points_transactions(user_id);
CREATE INDEX idx_points_tx_created ON points_transactions(created_at);

-- Badges y logros
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_code VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_code)
);

-- Recompensas canjeadas
CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  reward_code VARCHAR(100) NOT NULL,
  points_cost INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  fulfilled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Reviews & Ratings

```sql
-- Reseñas
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  user_id UUID REFERENCES users(id),
  experience_id UUID REFERENCES experiences(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  pros TEXT,
  cons TEXT,
  verified_booking BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_experience ON reviews(experience_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Media de reseñas
CREATE TABLE review_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('image', 'video')),
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reacciones a reseñas (helpful)
CREATE TABLE review_reactions (
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reaction VARCHAR(50) DEFAULT 'helpful',
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);
```

#### B2B (Alianzas)

```sql
-- Acuerdos B2B entre proveedores
CREATE TABLE b2b_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES users(id), -- quien provee el servicio
  partner_id UUID REFERENCES users(id), -- quien lo compra
  type VARCHAR(50), -- 'hotel', 'transport', 'guide', 'experience'
  terms TEXT,
  commission_rate DECIMAL(5, 2), -- porcentaje
  net_rate_discount DECIMAL(5, 2), -- descuento sobre tarifa pública
  payment_terms VARCHAR(255), -- 'prepaid', 'credit_30_days', etc.
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'terminated')),
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Órdenes B2B (reservas entre proveedores)
CREATE TABLE b2b_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  agreement_id UUID REFERENCES b2b_agreements(id),
  partner_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES users(id),
  service_type VARCHAR(50),
  service_reference UUID, -- id de la experiencia/habitación/etc.
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Índices Adicionales

```sql
-- Full-text search (básico en PostgreSQL)
CREATE INDEX idx_experiences_title_search ON experiences USING gin(to_tsvector('spanish', title));
CREATE INDEX idx_experiences_desc_search ON experiences USING gin(to_tsvector('spanish', description));

-- Geoespacial
CREATE INDEX idx_experiences_location_gist ON experiences USING gist(
  ll_to_earth(location_lat, location_lng)
);
```

---

## MongoDB - Base NoSQL (Social)

### Collections

```javascript
// Posts del feed social
db.posts.createIndex({ userId: 1, createdAt: -1 });
db.posts.createIndex({ hashtags: 1 });
db.posts.createIndex({ "location.coordinates": "2dsphere" });
db.posts.createIndex({ status: 1 });

posts = {
  _id: ObjectId,
  userId: UUID,
  content: String,
  mediaUrls: [{
    type: 'image' | 'video',
    url: String,
    thumbnailUrl: String
  }],
  linkedExperienceId: UUID | null,
  linkedBookingId: UUID | null,
  hashtags: [String],
  mentions: [UUID],
  location: {
    type: 'Point',
    coordinates: [lng, lat],
    name: String,
    city: String,
    country: String
  },
  stats: {
    likes: Number,
    comments: Number,
    shares: Number,
    saves: Number
  },
  visibility: 'public' | 'followers' | 'private',
  status: 'active' | 'flagged' | 'removed',
  createdAt: Date,
  updatedAt: Date
}

// Stories (24h)
db.stories.createIndex({ userId: 1, expiresAt: 1 });
db.stories.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

stories = {
  _id: ObjectId,
  userId: UUID,
  mediaType: 'image' | 'video',
  mediaUrl: String,
  thumbnailUrl: String,
  duration: Number, // para videos
  caption: String,
  linkedExperienceId: UUID | null,
  views: [UUID],
  expiresAt: Date,
  createdAt: Date
}

// Reacciones
db.reactions.createIndex({ postId: 1, userId: 1 }, { unique: true });
db.reactions.createIndex({ userId: 1, createdAt: -1 });

reactions = {
  _id: ObjectId,
  postId: ObjectId,
  userId: UUID,
  type: 'like' | 'love' | 'want_to_go' | 'useful',
  createdAt: Date
}

// Comentarios
db.comments.createIndex({ postId: 1, createdAt: -1 });
db.comments.createIndex({ userId: 1 });

comments = {
  _id: ObjectId,
  postId: ObjectId,
  userId: UUID,
  content: String,
  parentId: ObjectId | null, // para comentarios anidados
  mentions: [UUID],
  likes: Number,
  createdAt: Date,
  updatedAt: Date
}

// Mensajes (chat)
db.messages.createIndex({ conversationId: 1, createdAt: 1 });
db.messages.createIndex({ senderId: 1 });

messages = {
  _id: ObjectId,
  conversationId: String, // hash de user IDs ordenados
  senderId: UUID,
  recipientId: UUID, // o array para grupos
  content: String,
  type: 'text' | 'image' | 'location' | 'experience' | 'system',
  metadata: {
    experienceId: UUID | null,
    locationLat: Number | null,
    locationLng: Number | null,
    imageUrl: String | null
  },
  readBy: [UUID],
  deletedBy: [UUID],
  createdAt: Date
}

// Conversaciones
db.conversations.createIndex({ participants: 1 });
db.conversations.createIndex({ updatedAt: -1 });

conversations = {
  _id: ObjectId,
  conversationId: String,
  type: 'direct' | 'group' | 'booking',
  participants: [UUID],
  name: String | null, // para grupos
  lastMessage: {
    content: String,
    senderId: UUID,
    createdAt: Date
  },
  unreadCount: {
    [userId: string]: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Notificaciones
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 días

notifications = {
  _id: ObjectId,
  userId: UUID,
  type: 'new_follower' | 'post_like' | 'comment' | 'booking_confirmed' | 'points_earned',
  actorId: UUID | null, // quien generó la notificación
  data: {
    postId: ObjectId | null,
    bookingId: UUID | null,
    points: Number | null,
    // ... otros campos según tipo
  },
  read: Boolean,
  createdAt: Date
}

// "Capturado en Ruta" - Galerías de viaje
db.travel_galleries.createIndex({ userId: 1 });
db.travel_galleries.createIndex({ bookingId: 1 });

travel_galleries = {
  _id: ObjectId,
  userId: UUID,
  bookingId: UUID | null,
  tripName: String,
  description: String,
  startDate: Date,
  endDate: Date,
  items: [{
    type: 'image' | 'video' | 'note',
    url: String | null,
    thumbnailUrl: String | null,
    caption: String,
    location: {
      type: 'Point',
      coordinates: [lng, lat],
      name: String
    },
    tags: [String], // agencias, lugares, personas
    timestamp: Date
  }],
  visibility: 'public' | 'followers' | 'private',
  featured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Redis - Caché y Real-time

### Key Patterns

```
# Sesiones
session:{userId}:{token} → JSON (user data, expires 7d)

# Rate limiting
ratelimit:ip:{ip}:{endpoint} → counter (expires 1min)
ratelimit:user:{userId}:{endpoint} → counter (expires 1min)

# Caché de queries
cache:experiences:featured → JSON (expires 1h)
cache:experience:{id} → JSON (expires 5min)
cache:user:profile:{userId} → JSON (expires 10min)

# Bloqueo temporal de cupos (durante checkout)
booking:lock:{availabilityId}:{userId} → timestamp (expires 10min)

# Presencia online
online:{userId} → timestamp (expires 5min)

# Cola de jobs
bull:email:* → job queue
bull:notifications:* → job queue

# Contadores en tiempo real
stats:experience:{id}:views:today → counter
stats:post:{postId}:views → counter
```

---

**Última actualización:** 2025-11-09
