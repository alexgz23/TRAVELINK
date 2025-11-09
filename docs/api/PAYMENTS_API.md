# API de Pagos - Viajero Conectado

Documentación de los endpoints para gestión de pagos.

## Base URL

```
http://localhost:4000/api/v1/payments
```

---

## Endpoints de Viajero (Autenticados)

**Requieren:**
- Header: `Authorization: Bearer {accessToken}`
- Rol: `viajero` o `admin`

### 1. Crear Pago

**Endpoint:** `POST /payments`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "bookingId": "uuid-de-reserva",
  "amount": 450000,
  "currency": "COP",
  "provider": "stripe",
  "paymentMethod": "credit_card",
  "metadata": {
    "customField": "value"
  }
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "amount": 450000,
  "currency": "COP",
  "status": "pending",
  "provider": "stripe",
  "paymentMethod": "credit_card",
  "metadata": {
    "customField": "value"
  },
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos o la reserva ya tiene un pago completado
- `403 Forbidden`: No tienes permisos para crear un pago para esta reserva
- `404 Not Found`: Reserva no encontrada

---

### 2. Procesar/Confirmar Pago

Endpoint para confirmar un pago después de que el procesador de pagos (Stripe, Mercado Pago, etc.) lo haya procesado exitosamente.

**Endpoint:** `POST /payments/:id/process`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "providerPaymentId": "pi_1234567890abcdef",
  "providerCustomerId": "cus_1234567890",
  "metadata": {
    "paymentIntent": "pi_1234567890abcdef",
    "chargeId": "ch_1234567890abcdef"
  }
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "amount": 450000,
  "currency": "COP",
  "status": "completed",
  "provider": "stripe",
  "providerPaymentId": "pi_1234567890abcdef",
  "providerCustomerId": "cus_1234567890",
  "paymentMethod": "credit_card",
  "metadata": {
    "customField": "value",
    "paymentIntent": "pi_1234567890abcdef",
    "chargeId": "ch_1234567890abcdef"
  },
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:05:00.000Z"
}
```

**Errores:**
- `400 Bad Request`: Solo se pueden procesar pagos pendientes

**Nota:** Al procesar un pago exitosamente, la reserva asociada se confirma automáticamente.

---

### 3. Reembolsar Pago

**Endpoint:** `POST /payments/:id/refund`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:** (opcional)
```json
{
  "amount": 450000,
  "reason": "Cliente canceló el viaje"
}
```

Si no se especifica `amount`, se reembolsa el monto total.

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "amount": 450000,
  "currency": "COP",
  "status": "refunded",
  "refundAmount": 450000,
  "refundedAt": "2025-11-09T14:00:00.000Z",
  "provider": "stripe",
  "providerPaymentId": "pi_1234567890abcdef",
  "metadata": {
    "customField": "value",
    "refundReason": "Cliente canceló el viaje"
  },
  ...
}
```

**Errores:**
- `400 Bad Request`: Solo se pueden reembolsar pagos completados
- `403 Forbidden`: No tienes permisos para reembolsar este pago

**Nota:** Al reembolsar un pago, la reserva asociada se cancela automáticamente.

---

### 4. Obtener Mis Pagos

**Endpoint:** `GET /payments/my-payments`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (string, opcional): Estado (`pending`, `completed`, `failed`, `refunded`)
- `provider` (string, opcional): Proveedor (`stripe`, `mercadopago`, `paypal`)
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Ejemplo:**
```
GET /payments/my-payments?status=completed&page=1&limit=20
```

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "bookingId": "uuid",
      "amount": 450000,
      "currency": "COP",
      "status": "completed",
      "provider": "stripe",
      "paymentMethod": "credit_card",
      "booking": {
        "id": "uuid",
        "bookingNumber": "BK12345678901",
        "bookingDate": "2025-12-15",
        "experience": {
          "id": "uuid",
          "title": "Tour por Cartagena",
          "agency": {
            "id": "uuid",
            "profile": {
              "displayName": "Agencia XYZ"
            }
          }
        }
      },
      "createdAt": "2025-11-09T10:00:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 5. Obtener Pagos de una Reserva

**Endpoint:** `GET /payments/booking/:bookingId`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": "uuid",
    "bookingId": "uuid",
    "amount": 450000,
    "currency": "COP",
    "status": "completed",
    "provider": "stripe",
    "providerPaymentId": "pi_1234567890abcdef",
    "paymentMethod": "credit_card",
    "createdAt": "2025-11-09T10:00:00.000Z",
    "updatedAt": "2025-11-09T10:05:00.000Z"
  }
]
```

---

### 6. Obtener Pago por ID

**Endpoint:** `GET /payments/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "amount": 450000,
  "currency": "COP",
  "status": "completed",
  "provider": "stripe",
  "providerPaymentId": "pi_1234567890abcdef",
  "providerCustomerId": "cus_1234567890",
  "paymentMethod": "credit_card",
  "feeAmount": 45000,
  "netAmount": 405000,
  "metadata": {...},
  "booking": {
    "id": "uuid",
    "bookingNumber": "BK12345678901",
    "user": {
      "id": "uuid",
      "profile": {
        "displayName": "Juan Pérez",
        "email": "juan@example.com"
      }
    },
    "experience": {
      "id": "uuid",
      "title": "Tour por Cartagena",
      "agency": {
        "id": "uuid",
        "profile": {
          "displayName": "Agencia XYZ"
        }
      }
    }
  },
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:05:00.000Z"
}
```

**Errores:**
- `404 Not Found`: Pago no encontrado

---

## Endpoints de Agencia (Autenticados)

**Requieren:**
- Header: `Authorization: Bearer {accessToken}`
- Rol: `agencia` o `admin`

### 7. Obtener Pagos de Mi Agencia

**Endpoint:** `GET /payments/agency/my-payments`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (string, opcional): Estado del pago
- `provider` (string, opcional): Proveedor
- `bookingId` (string, opcional): Filtrar por reserva
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Ejemplo:**
```
GET /payments/agency/my-payments?status=completed&page=1
```

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "bookingId": "uuid",
      "amount": 450000,
      "currency": "COP",
      "status": "completed",
      "provider": "stripe",
      "feeAmount": 45000,
      "netAmount": 405000,
      "booking": {
        "id": "uuid",
        "bookingNumber": "BK12345678901",
        "user": {
          "id": "uuid",
          "profile": {
            "displayName": "Juan Pérez",
            "email": "juan@example.com",
            "phone": "+57 300 123 4567"
          }
        },
        "experience": {
          "id": "uuid",
          "title": "Tour por Cartagena"
        }
      },
      "createdAt": "2025-11-09T10:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

## Endpoints Administrativos

**Requieren:**
- Header: `Authorization: Bearer {accessToken}`
- Rol: `admin`

### 8. Marcar Pago como Fallido

**Endpoint:** `POST /payments/:id/mark-failed`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:** (opcional)
```json
{
  "reason": "Tarjeta rechazada por el banco"
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "amount": 450000,
  "status": "failed",
  "metadata": {
    "failureReason": "Tarjeta rechazada por el banco"
  },
  ...
}
```

**Errores:**
- `400 Bad Request`: Solo se pueden marcar como fallidos los pagos pendientes

---

### 9. Listar Todos los Pagos

**Endpoint:** `GET /payments`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (string, opcional): Estado
- `provider` (string, opcional): Proveedor
- `bookingId` (string, opcional): ID de reserva
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Respuesta exitosa (200):**
```json
{
  "items": [...],
  "total": 500,
  "page": 1,
  "limit": 20,
  "totalPages": 25
}
```

---

## Ejemplos de Uso

### JavaScript (Fetch)

```javascript
// Crear pago
const createPayment = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

const payment = await createPayment({
  bookingId: 'uuid-reserva',
  amount: 450000,
  currency: 'COP',
  provider: 'stripe',
  paymentMethod: 'credit_card',
});

// Procesar pago (después de que Stripe lo procese)
const processPayment = async (paymentId, stripeData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:4000/api/v1/payments/${paymentId}/process`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        providerPaymentId: stripeData.id,
        providerCustomerId: stripeData.customer,
      }),
    }
  );
  return response.json();
};

// Obtener mis pagos
const getMyPayments = async (filters = {}) => {
  const token = localStorage.getItem('accessToken');
  const queryString = new URLSearchParams(filters).toString();
  const response = await fetch(
    `http://localhost:4000/api/v1/payments/my-payments?${queryString}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.json();
};

const myPayments = await getMyPayments({ status: 'completed', page: 1 });

// Reembolsar pago
const refundPayment = async (paymentId, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:4000/api/v1/payments/${paymentId}/refund`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
};

await refundPayment('uuid-pago', {
  amount: 450000,
  reason: 'Cliente canceló',
});
```

### cURL

```bash
# Crear pago
curl -X POST http://localhost:4000/api/v1/payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "uuid-reserva",
    "amount": 450000,
    "currency": "COP",
    "provider": "stripe",
    "paymentMethod": "credit_card"
  }'

# Procesar pago
curl -X POST http://localhost:4000/api/v1/payments/uuid-pago/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerPaymentId": "pi_1234567890abcdef",
    "providerCustomerId": "cus_1234567890"
  }'

# Obtener mis pagos
curl -X GET "http://localhost:4000/api/v1/payments/my-payments?status=completed" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Reembolsar pago
curl -X POST http://localhost:4000/api/v1/payments/uuid-pago/refund \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 450000,
    "reason": "Cliente canceló el viaje"
  }'

# Pagos de agencia
curl -X GET "http://localhost:4000/api/v1/payments/agency/my-payments" \
  -H "Authorization: Bearer YOUR_AGENCY_TOKEN"
```

---

## Estados de Pago

- `pending` - Pendiente de procesamiento
- `completed` - Completado exitosamente
- `failed` - Fallido
- `refunded` - Reembolsado

---

## Proveedores de Pago

- `stripe` - Stripe
- `mercadopago` - Mercado Pago
- `paypal` - PayPal

---

## Métodos de Pago

- `credit_card` - Tarjeta de crédito
- `debit_card` - Tarjeta débito
- `pse` - PSE (Colombia)
- `efecty` - Efecty (Colombia)
- `bank_transfer` - Transferencia bancaria
- `cash` - Efectivo

---

## Flujo de Pago

### Flujo Típico con Stripe

1. **Viajero crea el pago** → Estado: `pending`
   ```
   POST /payments
   ```

2. **Frontend procesa con Stripe**
   ```javascript
   const stripe = Stripe('pk_test_...');
   const result = await stripe.confirmCardPayment(clientSecret, {...});
   ```

3. **Viajero confirma el pago** → Estado: `completed`
   ```
   POST /payments/:id/process
   ```

4. **Reserva se confirma automáticamente** → Estado de booking: `confirmed`

### Flujo de Reembolso

1. **Usuario o agencia solicita reembolso**
   ```
   POST /payments/:id/refund
   ```

2. **Pago se marca como reembolsado** → Estado: `refunded`

3. **Reserva se cancela automáticamente** → Estado de booking: `cancelled`

---

## Comisiones de la Plataforma

La plataforma cobra una comisión del **10%** sobre cada transacción:

- **Monto total**: $450,000 COP
- **Comisión (10%)**: $45,000 COP
- **Monto neto para agencia**: $405,000 COP

Estos valores se calculan y almacenan en los campos:
- `amount` - Monto total
- `feeAmount` - Comisión de la plataforma
- `netAmount` - Monto neto para la agencia

---

## Notas Importantes

1. **Integración con procesadores:**
   - El frontend debe integrar directamente con Stripe/Mercado Pago
   - Usar webhooks para confirmaciones automáticas
   - Nunca enviar información de tarjetas al backend

2. **Seguridad:**
   - Solo el dueño de la reserva puede crear pagos
   - Solo el dueño o la agencia pueden reembolsar
   - Usar HTTPS en producción siempre

3. **Automaciones:**
   - Al completar un pago → Se confirma la reserva
   - Al reembolsar un pago → Se cancela la reserva

4. **Reembolsos:**
   - Pueden ser totales o parciales
   - Se registra la razón del reembolso
   - La responsabilidad del reembolso en el procesador es del frontend

5. **Metadata:**
   - Campo flexible para guardar datos adicionales del procesador
   - Útil para IDs de transacciones, customer IDs, etc.

---

## Integración con Stripe (Ejemplo)

### Frontend

```javascript
// 1. Crear pago en backend
const payment = await createPayment({
  bookingId: bookingId,
  amount: 450000,
  currency: 'COP',
  provider: 'stripe',
  paymentMethod: 'credit_card',
});

// 2. Crear PaymentIntent en Stripe
const stripe = Stripe('pk_test_...');
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: { name: 'Juan Pérez' },
    },
  }
);

// 3. Si exitoso, procesar pago en backend
if (paymentIntent.status === 'succeeded') {
  await processPayment(payment.id, {
    providerPaymentId: paymentIntent.id,
    providerCustomerId: paymentIntent.customer,
    metadata: {
      chargeId: paymentIntent.charges.data[0].id,
    },
  });
}
```

---

**Última actualización:** 2025-11-09
