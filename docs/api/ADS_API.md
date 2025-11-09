# API de Publicidad y Marketing

Sistema completo de publicidad tipo Facebook para que las agencias puedan promocionar sus experiencias en la plataforma Viajero Conectado.

## Índice

- [Características](#características)
- [Modelos de Facturación](#modelos-de-facturación)
- [Endpoints de Agencia](#endpoints-de-agencia)
- [Endpoints de Tracking](#endpoints-de-tracking)
- [Endpoints de Admin](#endpoints-de-admin)
- [Ejemplos de Uso](#ejemplos-de-uso)

## Características

### Campañas Publicitarias
- ✅ Creación de campañas con presupuesto total y diario
- ✅ Múltiples anuncios por campaña
- ✅ Estados: borrador, pendiente aprobación, activa, pausada, completada, rechazada
- ✅ Aprobación administrativa
- ✅ Pausar/reanudar campañas
- ✅ Auto-pausa al exceder presupuesto diario
- ✅ Auto-completar al gastar presupuesto total

### Anuncios
- ✅ Formatos: feed, story, destacado, banner
- ✅ Targeting por: países, ciudades, edad, género, intereses
- ✅ Modelos de pago: CPC (costo por clic), CPM (costo por mil impresiones)
- ✅ Vinculación a experiencias

### Métricas y Analytics
- ✅ Tracking de impresiones, clics, conversiones
- ✅ Cálculo automático de CTR (Click-Through Rate)
- ✅ Cálculo automático de tasa de conversión
- ✅ CPC y CPM reales
- ✅ Métricas diarias por anuncio
- ✅ Métricas agregadas por campaña
- ✅ Filtrado por rango de fechas

## Modelos de Facturación

### CPC (Cost Per Click)
Cobro por cada clic en el anuncio.

```typescript
{
  billingType: 'cpc',
  cpcBid: 0.50 // $0.50 por clic
}
```

**Cómo funciona:**
- Al registrar un clic, se cobra `cpcBid` al presupuesto
- Impresiones son gratis
- Ideal para campañas de conversión

### CPM (Cost Per Mille)
Cobro por cada 1000 impresiones.

```typescript
{
  billingType: 'cpm',
  cpmBid: 5.00 // $5.00 por 1000 impresiones
}
```

**Cómo funciona:**
- Al registrar cada impresión, se cobra `cpmBid / 1000`
- Clics son gratis
- Ideal para campañas de awareness/reconocimiento

### Daily Budget
Presupuesto máximo diario para controlar gastos.

```typescript
{
  totalBudget: 1000.00,
  dailyBudget: 50.00 // Máximo $50/día
}
```

**Cómo funciona:**
- Cron job diario verifica gasto del día
- Auto-pausa campaña si se excede dailyBudget
- Se puede reanudar al día siguiente

## Endpoints de Agencia

### POST /ads/campaigns
Crear nueva campaña publicitaria.

**Auth:** JWT (AGENCIA, ADMIN)

**Body:**
```json
{
  "name": "Promoción Verano 2024",
  "description": "Campañas de tours de verano",
  "totalBudget": 1000.00,
  "dailyBudget": 50.00,
  "billingType": "cpc",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "agencyId": "uuid",
  "name": "Promoción Verano 2024",
  "description": "Campañas de tours de verano",
  "totalBudget": "1000.00",
  "spentBudget": "0.00",
  "dailyBudget": "50.00",
  "billingType": "cpc",
  "status": "draft",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "createdAt": "2024-05-15T10:00:00.000Z",
  "updatedAt": "2024-05-15T10:00:00.000Z"
}
```

### GET /ads/campaigns/my-campaigns
Obtener mis campañas con filtros.

**Auth:** JWT (AGENCIA, ADMIN)

**Query Params:**
- `status`: draft | pending_approval | active | paused | completed | rejected
- `page`: número de página (default: 1)
- `limit`: resultados por página (default: 10)

**Response:**
```json
{
  "items": [/* array de campañas */],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### GET /ads/campaigns/:id
Obtener campaña por ID.

**Auth:** JWT (AGENCIA, ADMIN)

**Response:** Objeto Campaign

### PATCH /ads/campaigns/:id
Actualizar campaña.

**Auth:** JWT (AGENCIA, ADMIN)

**Body:**
```json
{
  "name": "Nuevo nombre",
  "totalBudget": 1500.00
}
```

**Note:** Solo se pueden editar campañas en estado `draft` o `paused`.

### DELETE /ads/campaigns/:id
Eliminar campaña.

**Auth:** JWT (AGENCIA, ADMIN)

**Response:** 204 No Content

### POST /ads/campaigns/:id/submit
Enviar campaña a aprobación administrativa.

**Auth:** JWT (AGENCIA, ADMIN)

**Response:**
```json
{
  "id": "uuid",
  "status": "pending_approval",
  ...
}
```

### POST /ads/campaigns/:id/toggle
Pausar o reanudar campaña.

**Auth:** JWT (AGENCIA, ADMIN)

**Response:**
```json
{
  "id": "uuid",
  "status": "paused", // o "active"
  ...
}
```

### GET /ads/campaigns/:id/metrics
Obtener métricas agregadas de la campaña.

**Auth:** JWT (AGENCIA, ADMIN)

**Response:**
```json
{
  "campaignId": "uuid",
  "totalImpressions": 15420,
  "totalClicks": 523,
  "totalConversions": 47,
  "totalSpent": "261.50",
  "ctr": "3.39",
  "conversionRate": "8.99",
  "avgCpc": "0.50",
  "avgCpm": "16.96",
  "adMetrics": [
    {
      "adId": "uuid",
      "adName": "Banner Principal",
      "impressions": 8500,
      "clicks": 310,
      "conversions": 28,
      "spent": "155.00",
      "ctr": "3.65",
      "conversionRate": "9.03"
    }
  ]
}
```

## Endpoints de Anuncios

### POST /ads/ads
Crear nuevo anuncio dentro de una campaña.

**Auth:** JWT (AGENCIA, ADMIN)

**Body:**
```json
{
  "campaignId": "uuid",
  "experienceId": "uuid",
  "name": "Banner Tours Caribe",
  "description": "Tours todo incluido al Caribe",
  "format": "feed",
  "imageUrl": "https://...",
  "ctaText": "Reservar Ahora",
  "ctaUrl": "https://...",

  // Targeting
  "targetCountries": ["MX", "CO", "AR"],
  "targetCities": ["CDMX", "Bogotá", "Buenos Aires"],
  "targetAgeMin": 25,
  "targetAgeMax": 45,
  "targetGender": "all",
  "targetInterests": ["playa", "aventura", "lujo"],

  // Pricing (según billingType de la campaña)
  "cpcBid": 0.50,
  "cpmBid": 5.00
}
```

**Response:**
```json
{
  "id": "uuid",
  "campaignId": "uuid",
  "experienceId": "uuid",
  "name": "Banner Tours Caribe",
  "format": "feed",
  "status": "draft",
  "targetCountries": ["MX", "CO", "AR"],
  "targetAgeMin": 25,
  "targetAgeMax": 45,
  "targetGender": "all",
  "cpcBid": "0.50",
  "cpmBid": "5.00",
  ...
}
```

### GET /ads/ads/my-ads
Obtener mis anuncios con filtros.

**Auth:** JWT (AGENCIA, ADMIN)

**Query Params:**
- `campaignId`: filtrar por campaña
- `status`: draft | active | paused | completed
- `format`: feed | story | featured | banner
- `page`: número de página
- `limit`: resultados por página

### GET /ads/ads/:id
Obtener anuncio por ID.

**Auth:** JWT (AGENCIA, ADMIN)

### PATCH /ads/ads/:id
Actualizar anuncio.

**Auth:** JWT (AGENCIA, ADMIN)

### DELETE /ads/ads/:id
Eliminar anuncio.

**Auth:** JWT (AGENCIA, ADMIN)

**Response:** 204 No Content

### GET /ads/ads/:id/metrics
Obtener métricas de un anuncio específico.

**Auth:** JWT (AGENCIA, ADMIN)

**Query Params:**
- `startDate`: fecha inicio (ISO 8601)
- `endDate`: fecha fin (ISO 8601)

**Response:**
```json
{
  "adId": "uuid",
  "adName": "Banner Tours Caribe",
  "totalImpressions": 8500,
  "totalClicks": 310,
  "totalConversions": 28,
  "totalSpent": "155.00",
  "ctr": "3.65",
  "conversionRate": "9.03",
  "avgCpc": "0.50",
  "avgCpm": "18.24",
  "dailyMetrics": [
    {
      "date": "2024-06-01",
      "impressions": 420,
      "clicks": 15,
      "conversions": 2,
      "spent": "7.50",
      "ctr": "3.57",
      "conversionRate": "13.33"
    }
  ]
}
```

## Endpoints de Tracking

Estos endpoints son públicos y se llaman desde el frontend cuando los usuarios ven/interactúan con anuncios.

### POST /ads/track/impression
Registrar que un anuncio fue visto.

**Auth:** Público (no requiere autenticación)

**Body:**
```json
{
  "adId": "uuid",
  "userId": "uuid",
  "sessionId": "session-xyz",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "referer": "https://viajero-conectado.com/explore"
}
```

**Response:** 204 No Content

**Lógica de facturación:**
- Si la campaña es CPM: cobra `cpmBid / 1000` al presupuesto
- Actualiza `spentBudget` de la campaña
- Si `spentBudget >= totalBudget`: marca campaña como `completed`
- Crea/actualiza AdMetrics del día

### POST /ads/track/click
Registrar que un usuario hizo clic en un anuncio.

**Auth:** Público (no requiere autenticación)

**Body:**
```json
{
  "adId": "uuid",
  "userId": "uuid",
  "sessionId": "session-xyz",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "destinationUrl": "https://viajero-conectado.com/experiences/123"
}
```

**Response:** 204 No Content

**Lógica de facturación:**
- Si la campaña es CPC: cobra `cpcBid` al presupuesto
- Actualiza `spentBudget` de la campaña
- Si `spentBudget >= totalBudget`: marca campaña como `completed`
- Incrementa contador de clics en AdMetrics

### POST /ads/track/conversion
Registrar que un usuario completó una conversión (ej: reserva).

**Auth:** JWT requerido

**Body:**
```json
{
  "adId": "uuid",
  "bookingId": "uuid",
  "conversionValue": 299.99
}
```

**Response:** 204 No Content

**Lógica:**
- Incrementa contador de conversiones
- No cobra nada adicional (ya se cobró en impresión/clic)
- Permite calcular ROI de la campaña

## Endpoints de Admin

### GET /ads/admin/campaigns/pending
Listar campañas pendientes de aprobación.

**Auth:** JWT (ADMIN)

**Response:**
```json
{
  "items": [/* campañas con status: pending_approval */],
  "total": 5
}
```

### POST /ads/admin/campaigns/:id/approve
Aprobar campaña.

**Auth:** JWT (ADMIN)

**Response:**
```json
{
  "id": "uuid",
  "status": "active",
  "approvedBy": "admin-uuid",
  "approvedAt": "2024-05-16T12:00:00.000Z",
  ...
}
```

### POST /ads/admin/campaigns/:id/reject
Rechazar campaña.

**Auth:** JWT (ADMIN)

**Body:**
```json
{
  "reason": "El contenido del anuncio no cumple con las políticas de la plataforma"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "rejected",
  "rejectionReason": "El contenido del anuncio no cumple con las políticas de la plataforma",
  ...
}
```

### GET /ads/admin/campaigns
Listar todas las campañas (admin).

**Auth:** JWT (ADMIN)

**Query Params:**
- `status`, `page`, `limit`

### POST /ads/admin/check-budgets
Verificar presupuestos diarios (cron job).

**Auth:** JWT (ADMIN)

**Response:**
```json
{
  "checked": 25,
  "paused": 3,
  "message": "Presupuestos verificados. 3 campañas pausadas por exceder presupuesto diario"
}
```

**Uso:**
Este endpoint debe ejecutarse mediante un cron job cada día a las 00:00:
```bash
0 0 * * * curl -X POST https://api.viajero-conectado.com/ads/admin/check-budgets \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Ejemplos de Uso

### Flujo completo de campaña CPC

#### 1. Agencia crea campaña
```bash
POST /ads/campaigns
{
  "name": "Promo Tours Caribe",
  "totalBudget": 500,
  "dailyBudget": 25,
  "billingType": "cpc",
  "startDate": "2024-06-01",
  "endDate": "2024-06-30"
}
# Status: draft
```

#### 2. Agencia crea anuncio
```bash
POST /ads/ads
{
  "campaignId": "campaign-uuid",
  "experienceId": "exp-uuid",
  "name": "Banner Cancún",
  "format": "feed",
  "targetCountries": ["MX"],
  "targetAgeMin": 25,
  "targetAgeMax": 55,
  "cpcBid": 0.50
}
# Status: draft
```

#### 3. Agencia envía a aprobación
```bash
POST /ads/campaigns/{id}/submit
# Status: pending_approval
```

#### 4. Admin aprueba
```bash
POST /ads/admin/campaigns/{id}/approve
# Status: active
# El anuncio comienza a mostrarse a usuarios
```

#### 5. Usuario ve el anuncio (frontend)
```bash
POST /ads/track/impression
{
  "adId": "ad-uuid",
  "userId": "user-123",
  "sessionId": "sess-xyz"
}
# Impresión registrada, NO se cobra (es CPC)
```

#### 6. Usuario hace clic (frontend)
```bash
POST /ads/track/click
{
  "adId": "ad-uuid",
  "userId": "user-123"
}
# Clic registrado, SE COBRA $0.50
# spentBudget: $0.00 → $0.50
```

#### 7. Usuario reserva (backend)
```bash
POST /ads/track/conversion
{
  "adId": "ad-uuid",
  "bookingId": "booking-uuid",
  "conversionValue": 299.99
}
# Conversión registrada, NO se cobra extra
# Métricas: CTR y conversion rate actualizados
```

#### 8. Agencia revisa métricas
```bash
GET /ads/campaigns/{id}/metrics
# Respuesta:
{
  "totalImpressions": 2500,
  "totalClicks": 85,
  "totalConversions": 12,
  "totalSpent": "42.50",
  "ctr": "3.40",
  "conversionRate": "14.12",
  "avgCpc": "0.50"
}
```

#### 9. Presupuesto diario excedido
```bash
POST /ads/admin/check-budgets
# Detecta que spentBudget del día = $25.50 > dailyBudget ($25)
# Status: active → paused
```

#### 10. Siguiente día se reanuda
```bash
POST /ads/campaigns/{id}/toggle
# Status: paused → active
```

#### 11. Presupuesto total gastado
```bash
# Cuando spentBudget >= totalBudget ($500)
# Status: active → completed
# No se pueden hacer más clics/impresiones facturables
```

### Flujo de campaña CPM

Similar al CPC pero:
- **Cada impresión** cobra `cpmBid / 1000`
- **Los clics** son gratis
- Ideal para awareness de marca

```bash
POST /ads/campaigns
{
  "billingType": "cpm",
  "cpmBid": 5.00  # $5 por 1000 impresiones
}

# 1 impresión = $0.005
# 1000 impresiones = $5.00
# 10,000 impresiones = $50.00
```

## Enums

### CampaignStatus
```typescript
enum CampaignStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}
```

### AdFormat
```typescript
enum AdFormat {
  FEED = 'feed',           // En el feed principal
  STORY = 'story',         // Formato stories
  FEATURED = 'featured',   // Destacado en home
  BANNER = 'banner',       // Banner tradicional
}
```

### AdStatus
```typescript
enum AdStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}
```

### BillingType
```typescript
enum BillingType {
  CPC = 'cpc',                 // Cost per click
  CPM = 'cpm',                 // Cost per thousand impressions
  DAILY_BUDGET = 'daily_budget',
}
```

### AudienceGender
```typescript
enum AudienceGender {
  ALL = 'all',
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
```

## Estructura de Base de Datos

### campaigns
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  agency_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_budget DECIMAL(10,2) NOT NULL,
  spent_budget DECIMAL(10,2) DEFAULT 0,
  daily_budget DECIMAL(10,2),
  billing_type campaign_billing_type NOT NULL,
  status campaign_status DEFAULT 'draft',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  approved_by UUID,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (agency_id) REFERENCES user_profiles(id)
);
```

### ads
```sql
CREATE TABLE ads (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL,
  experience_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  format ad_format NOT NULL,
  image_url VARCHAR(500),
  cta_text VARCHAR(100),
  cta_url VARCHAR(500),

  -- Targeting
  target_countries TEXT[],
  target_cities TEXT[],
  target_age_min INTEGER,
  target_age_max INTEGER,
  target_gender audience_gender DEFAULT 'all',
  target_interests TEXT[],

  -- Pricing
  cpc_bid DECIMAL(10,2),
  cpm_bid DECIMAL(10,2),

  status ad_status DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (experience_id) REFERENCES experiences(id)
);
```

### ad_metrics
```sql
CREATE TABLE ad_metrics (
  id UUID PRIMARY KEY,
  ad_id UUID NOT NULL,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  UNIQUE(ad_id, date)
);
```

## Consideraciones de Seguridad

1. **Validación de presupuesto**: El sistema valida que `spentBudget` nunca exceda `totalBudget`
2. **Rate limiting**: Los endpoints de tracking tienen rate limiting para prevenir fraude
3. **Ownership**: Las agencias solo pueden modificar sus propias campañas
4. **Admin approval**: Campañas deben ser aprobadas antes de activarse
5. **IP tracking**: Se registra IP para detectar clics/impresiones fraudulentas
6. **Daily budget**: Protección automática contra gastos excesivos

## Performance

1. **Índices**:
   - `(ad_id, date)` en ad_metrics para queries rápidas
   - `agency_id` en campaigns para filtrado
   - `status` en campaigns para admin queries

2. **Caching**: Considerar cachear métricas agregadas que no cambian frecuentemente

3. **Batch processing**: El tracking de eventos puede procesarse en batch para mejor performance

## Próximas Mejoras

- [ ] A/B Testing de anuncios
- [ ] Retargeting de usuarios
- [ ] Lookalike audiences
- [ ] Programmatic bidding
- [ ] Video ads
- [ ] Reportes PDF descargables
- [ ] Webhooks para eventos de campaña
- [ ] API de terceros (Facebook Ads, Google Ads sync)
