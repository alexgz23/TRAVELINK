# API de Alianzas B2B

Sistema completo de alianzas estratégicas B2B para que las agencias puedan asociarse con hoteles, guías turísticos y conductores/transportes.

## Índice

- [Características](#características)
- [Flujo de Alianzas](#flujo-de-alianzas)
- [Endpoints de Alianzas](#endpoints-de-alianzas)
- [Endpoints de Contratos](#endpoints-de-contratos)
- [Endpoints de Transacciones](#endpoints-de-transacciones)
- [Ejemplos de Uso](#ejemplos-de-uso)

## Características

### Alianzas Estratégicas
- ✅ Solicitudes de alianza entre agencias y proveedores
- ✅ Tipos: Hoteles, Guías, Transporte/Conductores
- ✅ Estados: Pendiente, Aceptada, Rechazada, Suspendida, Terminada
- ✅ Comisiones personalizables (porcentaje o fijo)
- ✅ Metadata flexible para servicios, zonas de exclusividad, etc.
- ✅ Socios preferentes

### Contratos
- ✅ Contratos formales con términos y condiciones
- ✅ Múltiples tipos de comisión: Porcentaje, Fijo, Híbrido
- ✅ Duraciones: 3 meses, 6 meses, 1 año, 2 años, Indefinido
- ✅ Auto-renovación configurable
- ✅ Firmas digitales de ambas partes
- ✅ Objetivos y bonificaciones por cumplimiento de metas
- ✅ Niveles de servicio (SLA)

### Transacciones
- ✅ Registro de comisiones por reservas
- ✅ Cálculo automático de comisiones
- ✅ Gestión de impuestos
- ✅ Estados: Pendiente, Pagado, Cancelado, En disputa
- ✅ Referencias de pago
- ✅ Vinculación con reservas

### Analytics
- ✅ Métricas por alianza
- ✅ Total de transacciones
- ✅ Comisiones totales, pendientes y pagadas
- ✅ Promedio de comisión

## Flujo de Alianzas

### 1. Solicitud
```
Agencia → Crea solicitud de alianza → Proveedor recibe notificación
Estado: PENDING
```

### 2. Respuesta del Proveedor
```
Proveedor → Acepta/Rechaza → Agencia recibe notificación
Estado: ACCEPTED | REJECTED
```

### 3. Creación de Contrato
```
Ambas partes → Negocian términos → Crean contrato formal
```

### 4. Firma de Contrato
```
Agencia firma → Proveedor firma → Contrato activado
```

### 5. Operación
```
Reservas generadas → Transacciones de comisión → Pagos
```

### 6. Finalización (opcional)
```
Cualquier parte → Suspende/Termina alianza
Estado: SUSPENDED | TERMINATED
```

## Endpoints de Alianzas

### POST /b2b/alliances
Crear nueva solicitud de alianza.

**Auth:** JWT (AGENCIA, ADMIN)

**Body:**
```json
{
  "providerId": "uuid",
  "type": "hotel",
  "name": "Alianza con Hotel Paraíso",
  "description": "Alianza estratégica para paquetes todo incluido",
  "defaultCommissionRate": 15.00,
  "defaultFixedCommission": null,
  "metadata": {
    "services": ["alojamiento", "desayuno", "spa"],
    "exclusivityZones": ["Cancún", "Playa del Carmen"],
    "minimumBookings": 10,
    "preferredPartner": true
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "agencyId": "uuid",
  "providerId": "uuid",
  "type": "hotel",
  "status": "pending",
  "name": "Alianza con Hotel Paraíso",
  "description": "Alianza estratégica para paquetes todo incluido",
  "defaultCommissionRate": "15.00",
  "defaultFixedCommission": null,
  "metadata": {
    "services": ["alojamiento", "desayuno", "spa"],
    "exclusivityZones": ["Cancún", "Playa del Carmen"],
    "minimumBookings": 10,
    "preferredPartner": true
  },
  "createdAt": "2024-06-01T10:00:00.000Z",
  "updatedAt": "2024-06-01T10:00:00.000Z"
}
```

### GET /b2b/alliances
Obtener todas las alianzas (admin only).

**Auth:** JWT (ADMIN)

**Query Params:**
- `type`: hotel | guide | transport
- `status`: pending | accepted | rejected | suspended | terminated
- `providerId`: UUID del proveedor
- `agencyId`: UUID de la agencia
- `page`: número de página (default: 1)
- `limit`: resultados por página (default: 10)

**Response:**
```json
{
  "items": [/* array de alianzas */],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### GET /b2b/alliances/my-alliances
Obtener mis alianzas (como agencia o proveedor).

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Query Params:** Igual que GET /b2b/alliances

**Response:** Igual que GET /b2b/alliances

### GET /b2b/alliances/:id
Obtener alianza por ID.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Response:**
```json
{
  "id": "uuid",
  "agencyId": "uuid",
  "providerId": "uuid",
  "type": "hotel",
  "status": "accepted",
  "name": "Alianza con Hotel Paraíso",
  "agency": {
    "id": "uuid",
    "businessName": "Viajes Caribe Tours"
  },
  "provider": {
    "id": "uuid",
    "businessName": "Hotel Paraíso"
  },
  "contracts": [/* contratos asociados */],
  "transactions": [/* transacciones asociadas */],
  "acceptedAt": "2024-06-02T14:30:00.000Z",
  "createdAt": "2024-06-01T10:00:00.000Z"
}
```

### PATCH /b2b/alliances/:id
Actualizar alianza.

**Auth:** JWT (AGENCIA, ADMIN)

**Body:**
```json
{
  "name": "Nuevo nombre",
  "defaultCommissionRate": 18.00,
  "status": "suspended",
  "terminationReason": "Cambio en política comercial"
}
```

**Note:** Solo la agencia puede actualizar. No se pueden modificar alianzas aceptadas excepto para suspender o terminar.

### DELETE /b2b/alliances/:id
Eliminar alianza.

**Auth:** JWT (AGENCIA, ADMIN)

**Response:**
```json
{
  "message": "Alianza eliminada exitosamente"
}
```

**Note:** Solo se pueden eliminar alianzas en estado PENDING o REJECTED.

### POST /b2b/alliances/:id/accept
Aceptar solicitud de alianza.

**Auth:** JWT (HOTEL, GUIA, CONDUCTOR, ADMIN)

**Response:**
```json
{
  "id": "uuid",
  "status": "accepted",
  "acceptedAt": "2024-06-02T14:30:00.000Z",
  ...
}
```

**Note:** Solo el proveedor puede aceptar la alianza.

### POST /b2b/alliances/:id/reject
Rechazar solicitud de alianza.

**Auth:** JWT (HOTEL, GUIA, CONDUCTOR, ADMIN)

**Body:**
```json
{
  "reason": "No cumple con nuestros requisitos mínimos de volumen"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "rejected",
  "rejectionReason": "No cumple con nuestros requisitos mínimos de volumen",
  "rejectedAt": "2024-06-02T15:00:00.000Z",
  ...
}
```

### GET /b2b/alliances/:id/metrics
Obtener métricas de una alianza.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Response:**
```json
{
  "totalTransactions": 156,
  "totalCommissions": 23450.50,
  "pendingCommissions": 3200.00,
  "paidCommissions": 20250.50,
  "averageCommission": 150.32
}
```

## Endpoints de Contratos

### POST /b2b/contracts
Crear nuevo contrato para una alianza.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Body:**
```json
{
  "allianceId": "uuid",
  "contractNumber": "CNT-2024-001",
  "commissionType": "percentage",
  "commissionPercentage": 15.00,
  "fixedCommission": null,
  "minimumCommission": 50.00,
  "maximumCommission": null,
  "duration": "1_year",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2025-05-31T23:59:59Z",
  "autoRenew": true,
  "terms": "Términos y condiciones del contrato...",
  "serviceLevels": {
    "responseTime": 24,
    "availabilityRate": 95,
    "cancellationPolicy": "Cancelación gratuita hasta 48h antes",
    "paymentTerms": "NET 30"
  },
  "monthlyBookingTarget": 15,
  "bonusCommissionRate": 3.00
}
```

**Response:**
```json
{
  "id": "uuid",
  "allianceId": "uuid",
  "contractNumber": "CNT-2024-001",
  "commissionType": "percentage",
  "commissionPercentage": "15.00",
  "isActive": true,
  "duration": "1_year",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2025-05-31T23:59:59.000Z",
  "autoRenew": true,
  "createdAt": "2024-06-01T10:00:00.000Z"
}
```

**Note:** Solo se pueden crear contratos para alianzas aceptadas.

### GET /b2b/alliances/:allianceId/contracts
Obtener contratos de una alianza.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Response:**
```json
[
  {
    "id": "uuid",
    "contractNumber": "CNT-2024-001",
    "isActive": true,
    "signedAt": "2024-06-02T10:00:00.000Z",
    ...
  }
]
```

### GET /b2b/contracts/:id
Obtener contrato por ID.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Response:** Objeto Contract completo con relación a Alliance

### PATCH /b2b/contracts/:id
Actualizar contrato.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Body:**
```json
{
  "commissionPercentage": 18.00,
  "monthlyBookingTarget": 20,
  "isActive": false
}
```

### POST /b2b/contracts/:id/sign
Firmar contrato.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Body:**
```json
{
  "signatureUrl": "https://storage.viajero.com/signatures/contract-uuid-agency.pdf"
}
```

**Response:**
```json
{
  "id": "uuid",
  "agencySignatureUrl": "https://storage.viajero.com/signatures/contract-uuid-agency.pdf",
  "providerSignatureUrl": null,
  "signedAt": null,
  ...
}
```

**Note:** Cuando ambas partes firman, se marca `signedAt` automáticamente.

## Endpoints de Transacciones

### POST /b2b/transactions
Crear nueva transacción de comisión.

**Auth:** JWT (AGENCIA, ADMIN)

**Body:**
```json
{
  "allianceId": "uuid",
  "bookingId": "uuid",
  "baseAmount": 1500.00,
  "commissionRate": 15.00,
  "commissionAmount": 225.00,
  "taxAmount": 36.00,
  "description": "Comisión reserva Hotel Paraíso - 3 noches",
  "notes": "Cliente VIP - paquete premium",
  "metadata": {
    "customerName": "Juan Pérez",
    "serviceName": "Suite Deluxe 3 noches",
    "serviceDate": "2024-07-15"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "allianceId": "uuid",
  "bookingId": "uuid",
  "baseAmount": "1500.00",
  "commissionRate": "15.00",
  "commissionAmount": "225.00",
  "taxAmount": "36.00",
  "totalAmount": "261.00",
  "status": "pending",
  "description": "Comisión reserva Hotel Paraíso - 3 noches",
  "createdAt": "2024-06-01T10:00:00.000Z"
}
```

**Cálculo automático:** `totalAmount = commissionAmount + taxAmount`

### GET /b2b/alliances/:allianceId/transactions
Obtener transacciones de una alianza.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Response:**
```json
[
  {
    "id": "uuid",
    "baseAmount": "1500.00",
    "commissionAmount": "225.00",
    "totalAmount": "261.00",
    "status": "pending",
    "createdAt": "2024-06-01T10:00:00.000Z"
  }
]
```

### GET /b2b/transactions/:id
Obtener transacción por ID.

**Auth:** JWT (AGENCIA, HOTEL, GUIA, CONDUCTOR, ADMIN)

**Response:** Objeto Transaction completo con relaciones

### POST /b2b/transactions/:id/pay
Marcar transacción como pagada.

**Auth:** JWT (AGENCIA, ADMIN)

**Body:**
```json
{
  "paymentReference": "TRF-20240601-12345"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "paid",
  "paidAt": "2024-06-15T16:30:00.000Z",
  "paymentReference": "TRF-20240601-12345",
  ...
}
```

### POST /b2b/transactions/:id/cancel
Cancelar transacción.

**Auth:** JWT (AGENCIA, ADMIN)

**Response:**
```json
{
  "id": "uuid",
  "status": "cancelled",
  ...
}
```

**Note:** No se pueden cancelar transacciones ya pagadas.

## Ejemplos de Uso

### Flujo completo de alianza

#### 1. Agencia solicita alianza con hotel
```bash
POST /b2b/alliances
{
  "providerId": "hotel-uuid",
  "type": "hotel",
  "name": "Alianza Hotel Paraíso",
  "defaultCommissionRate": 15.00,
  "metadata": {
    "services": ["alojamiento", "desayuno"],
    "minimumBookings": 10
  }
}
# Status: pending
```

#### 2. Hotel acepta la alianza
```bash
POST /b2b/alliances/{id}/accept
# Status: accepted
# acceptedAt: timestamp actual
```

#### 3. Agencia crea contrato formal
```bash
POST /b2b/contracts
{
  "allianceId": "alliance-uuid",
  "contractNumber": "CNT-2024-HTL-001",
  "commissionType": "percentage",
  "commissionPercentage": 15.00,
  "duration": "1_year",
  "startDate": "2024-06-01",
  "endDate": "2025-05-31",
  "monthlyBookingTarget": 15,
  "bonusCommissionRate": 3.00
}
```

#### 4. Ambas partes firman el contrato
```bash
# Agencia firma
POST /b2b/contracts/{id}/sign
{
  "signatureUrl": "https://.../signature-agency.pdf"
}

# Hotel firma
POST /b2b/contracts/{id}/sign
{
  "signatureUrl": "https://.../signature-hotel.pdf"
}
# signedAt: timestamp automático cuando ambas firman
```

#### 5. Cliente hace reserva a través de la agencia
```bash
# (Flujo de reservas normal)
POST /bookings
{
  "experienceId": "exp-uuid",
  "hotelId": "hotel-uuid",
  ...
}
```

#### 6. Sistema crea transacción de comisión automáticamente
```bash
POST /b2b/transactions
{
  "allianceId": "alliance-uuid",
  "bookingId": "booking-uuid",
  "baseAmount": 2000.00,
  "commissionRate": 15.00,
  "commissionAmount": 300.00,
  "taxAmount": 48.00,
  "description": "Comisión reserva 5 noches"
}
# Status: pending
# totalAmount: 348.00
```

#### 7. Agencia marca la comisión como pagada
```bash
POST /b2b/transactions/{id}/pay
{
  "paymentReference": "TRF-20240615-12345"
}
# Status: paid
# paidAt: timestamp actual
```

#### 8. Verificar métricas de la alianza
```bash
GET /b2b/alliances/{id}/metrics
# Response:
{
  "totalTransactions": 25,
  "totalCommissions": 7500.00,
  "pendingCommissions": 1200.00,
  "paidCommissions": 6300.00,
  "averageCommission": 300.00
}
```

### Ejemplo de alianza con guía turístico

```bash
# 1. Crear alianza
POST /b2b/alliances
{
  "providerId": "guide-uuid",
  "type": "guide",
  "name": "Alianza Guía Local Cancún",
  "defaultFixedCommission": 50.00,
  "metadata": {
    "services": ["tours históricos", "tours gastronómicos"],
    "exclusivityZones": ["Zona Hotelera Cancún"]
  }
}

# 2. Guía acepta
POST /b2b/alliances/{id}/accept

# 3. Contrato con comisión fija
POST /b2b/contracts
{
  "allianceId": "alliance-uuid",
  "contractNumber": "CNT-2024-GDE-001",
  "commissionType": "fixed",
  "fixedCommission": 50.00,
  "duration": "6_months",
  "startDate": "2024-06-01",
  "endDate": "2024-11-30"
}

# 4. Transacción por tour
POST /b2b/transactions
{
  "allianceId": "alliance-uuid",
  "bookingId": "booking-uuid",
  "baseAmount": 500.00,
  "commissionAmount": 50.00,
  "description": "Tour histórico centro de Cancún"
}
```

### Ejemplo de alianza híbrida (conductor)

```bash
# Contrato híbrido: comisión base + porcentaje
POST /b2b/contracts
{
  "allianceId": "alliance-uuid",
  "contractNumber": "CNT-2024-TRN-001",
  "commissionType": "hybrid",
  "fixedCommission": 30.00,
  "commissionPercentage": 10.00,
  "duration": "1_year",
  "startDate": "2024-06-01",
  "endDate": "2025-05-31"
}

# Transacción aplicando ambas comisiones
# Servicio de transporte: $200
# Comisión fija: $30
# Comisión variable: $200 * 10% = $20
# Total comisión: $50
POST /b2b/transactions
{
  "allianceId": "alliance-uuid",
  "bookingId": "booking-uuid",
  "baseAmount": 200.00,
  "commissionRate": 10.00,
  "commissionAmount": 50.00,
  "description": "Traslado aeropuerto-hotel (híbrido: $30 fijo + $20 variable)"
}
```

## Enums

### AllianceType
```typescript
enum AllianceType {
  HOTEL = 'hotel',
  GUIDE = 'guide',
  TRANSPORT = 'transport',
}
```

### AllianceStatus
```typescript
enum AllianceStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}
```

### CommissionType
```typescript
enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  HYBRID = 'hybrid',
}
```

### ContractDuration
```typescript
enum ContractDuration {
  THREE_MONTHS = '3_months',
  SIX_MONTHS = '6_months',
  ONE_YEAR = '1_year',
  TWO_YEARS = '2_years',
  INDEFINITE = 'indefinite',
}
```

### TransactionStatus
```typescript
enum TransactionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}
```

## Estructura de Base de Datos

### alliances
```sql
CREATE TABLE alliances (
  id UUID PRIMARY KEY,
  agency_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  type alliance_type NOT NULL,
  status alliance_status DEFAULT 'pending',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  default_commission_rate DECIMAL(5,2),
  default_fixed_commission DECIMAL(10,2),
  metadata JSONB,
  rejection_reason TEXT,
  termination_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  terminated_at TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES user_profiles(id),
  FOREIGN KEY (provider_id) REFERENCES user_profiles(id)
);
```

### alliance_contracts
```sql
CREATE TABLE alliance_contracts (
  id UUID PRIMARY KEY,
  alliance_id UUID NOT NULL,
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  commission_type commission_type DEFAULT 'percentage',
  commission_percentage DECIMAL(5,2),
  fixed_commission DECIMAL(10,2),
  minimum_commission DECIMAL(10,2),
  maximum_commission DECIMAL(10,2),
  duration contract_duration DEFAULT '1_year',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  terms TEXT,
  service_levels JSONB,
  monthly_booking_target INTEGER,
  bonus_commission_rate DECIMAL(5,2),
  agency_signature_url VARCHAR(500),
  provider_signature_url VARCHAR(500),
  signed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (alliance_id) REFERENCES alliances(id) ON DELETE CASCADE
);
```

### alliance_transactions
```sql
CREATE TABLE alliance_transactions (
  id UUID PRIMARY KEY,
  alliance_id UUID NOT NULL,
  booking_id UUID,
  base_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  paid_at TIMESTAMP,
  payment_reference VARCHAR(255),
  description VARCHAR(500) NOT NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (alliance_id) REFERENCES alliances(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
```

## Consideraciones de Seguridad

1. **Ownership**: Agencias solo pueden crear alianzas. Proveedores solo pueden aceptar/rechazar.
2. **Permissions**: Solo las partes involucradas pueden ver/modificar una alianza.
3. **State validation**: No se pueden modificar alianzas aceptadas excepto para suspender/terminar.
4. **Contract signing**: Requiere ambas firmas para activación.
5. **Transaction integrity**: Solo se pueden crear transacciones para alianzas activas.
6. **Payment tracking**: Referencias de pago obligatorias al marcar como pagado.

## Performance

1. **Índices**:
   - `(agency_id, provider_id)` en alliances para evitar duplicados
   - `alliance_id` en contracts y transactions para joins rápidos
   - `status` en alliances para filtrado
   - `contract_number` único en contracts

2. **Eager loading**: Incluir relaciones agency/provider para evitar N+1 queries

3. **Pagination**: Todas las listas están paginadas por defecto

## Próximas Mejoras

- [ ] Notificaciones push/email para cambios de estado
- [ ] Renovación automática de contratos
- [ ] Reportes de comisiones en PDF
- [ ] Dashboard de métricas B2B
- [ ] Sistema de disputas
- [ ] Ratings entre agencias y proveedores
- [ ] Chat integrado para negociaciones
- [ ] Templates de contratos predefinidos
- [ ] Integración con sistemas contables
- [ ] API webhooks para eventos B2B
