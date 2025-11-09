# API de Reservas - Viajero Conectado

Documentación de los endpoints para gestión de reservas (bookings).

## Base URL

```
http://localhost:4000/api/v1/bookings
```

---

## Endpoints de Viajero (Autenticados)

**Requieren:**
- Header: `Authorization: Bearer {accessToken}`
- Rol: `viajero` o `admin`

### 1. Crear Reserva

**Endpoint:** `POST /bookings`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "experienceId": "uuid-de-experiencia",
  "variantId": "uuid-de-variante",
  "bookingDate": "2025-12-15",
  "bookingTime": "09:00",
  "numAdults": 2,
  "numChildren": 1,
  "totalAmount": 450000,
  "currency": "COP"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "bookingNumber": "BK12345678901",
  "userId": "uuid",
  "experienceId": "uuid",
  "variantId": "uuid",
  "bookingDate": "2025-12-15",
  "bookingTime": "09:00",
  "numAdults": 2,
  "numChildren": 1,
  "totalAmount": 450000,
  "currency": "COP",
  "status": "pending",
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos o experiencia no disponible
- `404 Not Found`: Experiencia no encontrada

---

### 2. Obtener Mis Reservas

**Endpoint:** `GET /bookings/my-bookings`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (string, opcional): Estado (`pending`, `confirmed`, `completed`, `cancelled`)
- `startDate` (string, opcional): Fecha inicio (YYYY-MM-DD)
- `endDate` (string, opcional): Fecha fin (YYYY-MM-DD)
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Ejemplo:**
```
GET /bookings/my-bookings?status=confirmed&page=1&limit=20
```

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "bookingNumber": "BK12345678901",
      "bookingDate": "2025-12-15",
      "bookingTime": "09:00",
      "numAdults": 2,
      "numChildren": 1,
      "totalAmount": 450000,
      "currency": "COP",
      "status": "confirmed",
      "confirmedAt": "2025-11-09T11:00:00.000Z",
      "experience": {
        "id": "uuid",
        "title": "Tour por Cartagena",
        "slug": "tour-por-cartagena",
        "media": [
          {
            "id": "uuid",
            "type": "image",
            "url": "https://cdn.example.com/image.jpg"
          }
        ],
        "agency": {
          "id": "uuid",
          "profile": {
            "displayName": "Agencia XYZ"
          }
        }
      },
      "travelers": [
        {
          "id": "uuid",
          "type": "adult",
          "firstName": "Juan",
          "lastName": "Pérez"
        }
      ],
      "createdAt": "2025-11-09T10:00:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 3. Obtener Reserva por ID

**Endpoint:** `GET /bookings/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "bookingNumber": "BK12345678901",
  "userId": "uuid",
  "experienceId": "uuid",
  "bookingDate": "2025-12-15",
  "bookingTime": "09:00",
  "numAdults": 2,
  "numChildren": 1,
  "totalAmount": 450000,
  "currency": "COP",
  "status": "confirmed",
  "confirmedAt": "2025-11-09T11:00:00.000Z",
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
    },
    "variants": [...]
  },
  "travelers": [...],
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

**Errores:**
- `404 Not Found`: Reserva no encontrada

---

### 4. Obtener Reserva por Número

**Endpoint:** `GET /bookings/number/:bookingNumber`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Ejemplo:**
```
GET /bookings/number/BK12345678901
```

**Respuesta:** Similar al endpoint anterior

---

### 5. Actualizar Reserva

**Endpoint:** `PATCH /bookings/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:** (campos opcionales)
```json
{
  "bookingDate": "2025-12-16",
  "bookingTime": "10:00",
  "numAdults": 3
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "bookingNumber": "BK12345678901",
  ...
}
```

**Errores:**
- `403 Forbidden`: No eres dueño de esta reserva
- `400 Bad Request`: No puedes actualizar reservas confirmadas o completadas

**Nota:** Solo se pueden actualizar reservas en estado `pending`

---

### 6. Cancelar Reserva

**Endpoint:** `POST /bookings/:id/cancel`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:** (opcional)
```json
{
  "reason": "Cambio de planes de viaje"
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "bookingNumber": "BK12345678901",
  "status": "cancelled",
  "cancellationReason": "Cambio de planes de viaje",
  "cancelledAt": "2025-11-09T12:00:00.000Z",
  ...
}
```

**Errores:**
- `403 Forbidden`: No tienes permisos
- `400 Bad Request`: No puedes cancelar reservas completadas

---

### 7. Eliminar Reserva

**Endpoint:** `DELETE /bookings/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (204):** No content

**Errores:**
- `403 Forbidden`: No eres dueño de esta reserva
- `400 Bad Request`: Solo puedes eliminar reservas pendientes o canceladas

---

## Gestión de Viajeros

### 8. Agregar Viajero a Reserva

**Endpoint:** `POST /bookings/:id/travelers`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "type": "adult",
  "firstName": "Juan",
  "lastName": "Pérez",
  "documentType": "cc",
  "documentNumber": "1234567890",
  "dateOfBirth": "1990-05-15",
  "nationality": "CO"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "type": "adult",
  "firstName": "Juan",
  "lastName": "Pérez",
  "documentType": "cc",
  "documentNumber": "1234567890",
  "dateOfBirth": "1990-05-15",
  "nationality": "CO",
  "createdAt": "2025-11-09T10:00:00.000Z"
}
```

---

### 9. Obtener Viajeros de Reserva

**Endpoint:** `GET /bookings/:id/travelers`

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
    "type": "adult",
    "firstName": "Juan",
    "lastName": "Pérez",
    "documentType": "cc",
    "documentNumber": "1234567890",
    "dateOfBirth": "1990-05-15",
    "nationality": "CO",
    "createdAt": "2025-11-09T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "bookingId": "uuid",
    "type": "child",
    "firstName": "María",
    "lastName": "Pérez",
    "dateOfBirth": "2015-03-20",
    "nationality": "CO",
    "createdAt": "2025-11-09T10:05:00.000Z"
  }
]
```

---

### 10. Eliminar Viajero

**Endpoint:** `DELETE /bookings/travelers/:travelerId`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (204):** No content

**Errores:**
- `404 Not Found`: Viajero no encontrado

---

## Endpoints de Agencia (Autenticados)

**Requieren:**
- Header: `Authorization: Bearer {accessToken}`
- Rol: `agencia` o `admin`

### 11. Obtener Reservas de Mi Agencia

**Endpoint:** `GET /bookings/agency/my-bookings`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (string, opcional): Estado
- `experienceId` (string, opcional): Filtrar por experiencia
- `startDate` (string, opcional): Fecha inicio (YYYY-MM-DD)
- `endDate` (string, opcional): Fecha fin (YYYY-MM-DD)
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Ejemplo:**
```
GET /bookings/agency/my-bookings?status=pending&startDate=2025-12-01&endDate=2025-12-31
```

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "bookingNumber": "BK12345678901",
      "bookingDate": "2025-12-15",
      "numAdults": 2,
      "numChildren": 1,
      "totalAmount": 450000,
      "status": "pending",
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
      },
      "travelers": [...],
      "createdAt": "2025-11-09T10:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### 12. Confirmar Reserva

**Endpoint:** `POST /bookings/:id/confirm`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "bookingNumber": "BK12345678901",
  "status": "confirmed",
  "confirmedAt": "2025-11-09T11:00:00.000Z",
  ...
}
```

**Errores:**
- `403 Forbidden`: La experiencia no pertenece a tu agencia
- `400 Bad Request`: Solo se pueden confirmar reservas pendientes

---

### 13. Completar Reserva

**Endpoint:** `POST /bookings/:id/complete`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "bookingNumber": "BK12345678901",
  "status": "completed",
  "completedAt": "2025-12-15T18:00:00.000Z",
  ...
}
```

**Errores:**
- `403 Forbidden`: La experiencia no pertenece a tu agencia
- `400 Bad Request`: Solo se pueden completar reservas confirmadas

---

## Ejemplos de Uso

### JavaScript (Fetch)

```javascript
// Crear reserva
const createBooking = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Ejemplo de uso
const booking = await createBooking({
  experienceId: 'uuid-experiencia',
  variantId: 'uuid-variante',
  bookingDate: '2025-12-15',
  bookingTime: '09:00',
  numAdults: 2,
  numChildren: 1,
  totalAmount: 450000,
  currency: 'COP',
});

// Obtener mis reservas
const getMyBookings = async (filters = {}) => {
  const token = localStorage.getItem('accessToken');
  const queryString = new URLSearchParams(filters).toString();
  const response = await fetch(
    `http://localhost:4000/api/v1/bookings/my-bookings?${queryString}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.json();
};

const myBookings = await getMyBookings({ status: 'confirmed', page: 1 });

// Cancelar reserva
const cancelBooking = async (bookingId, reason) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:4000/api/v1/bookings/${bookingId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    }
  );
  return response.json();
};

// Agregar viajero
const addTraveler = async (bookingId, travelerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:4000/api/v1/bookings/${bookingId}/travelers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(travelerData),
    }
  );
  return response.json();
};
```

### cURL

```bash
# Crear reserva
curl -X POST http://localhost:4000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "experienceId": "uuid-experiencia",
    "variantId": "uuid-variante",
    "bookingDate": "2025-12-15",
    "bookingTime": "09:00",
    "numAdults": 2,
    "numChildren": 1,
    "totalAmount": 450000,
    "currency": "COP"
  }'

# Obtener mis reservas
curl -X GET "http://localhost:4000/api/v1/bookings/my-bookings?status=confirmed" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Cancelar reserva
curl -X POST http://localhost:4000/api/v1/bookings/uuid-reserva/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Cambio de planes"}'

# Confirmar reserva (agencia)
curl -X POST http://localhost:4000/api/v1/bookings/uuid-reserva/confirm \
  -H "Authorization: Bearer YOUR_AGENCY_TOKEN"

# Agregar viajero
curl -X POST http://localhost:4000/api/v1/bookings/uuid-reserva/travelers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "adult",
    "firstName": "Juan",
    "lastName": "Pérez",
    "documentType": "cc",
    "documentNumber": "1234567890",
    "dateOfBirth": "1990-05-15",
    "nationality": "CO"
  }'
```

---

## Estados de Reserva

- `pending` - Pendiente de confirmación por la agencia
- `confirmed` - Confirmada por la agencia
- `completed` - Completada (servicio prestado)
- `cancelled` - Cancelada

---

## Flujo de Reserva

1. **Viajero crea reserva** → Estado: `pending`
2. **Viajero agrega viajeros** (opcional)
3. **Agencia confirma reserva** → Estado: `confirmed`
4. **Servicio se presta**
5. **Agencia completa reserva** → Estado: `completed`

### Cancelación

- Puede ser cancelada por el **viajero** o la **agencia** en cualquier momento antes de completarse
- Estado: `cancelled`
- Se registra la razón y fecha de cancelación

---

## Tipos de Viajero

- `adult` - Adulto
- `child` - Niño
- `infant` - Infante

## Tipos de Documento

- `cc` - Cédula de Ciudadanía
- `ce` - Cédula de Extranjería
- `passport` - Pasaporte
- `ti` - Tarjeta de Identidad

---

## Notas Importantes

1. **Número de reserva único:** Se genera automáticamente (formato: `BK` + timestamp + random)
2. **Validaciones:**
   - La experiencia debe estar publicada
   - Solo se pueden actualizar reservas pendientes
   - Solo se pueden eliminar reservas pendientes o canceladas
   - Solo la agencia puede confirmar/completar reservas
3. **Permisos:**
   - Viajeros solo pueden ver/modificar sus propias reservas
   - Agencias solo pueden ver/gestionar reservas de sus experiencias
4. **Viajeros:** Información opcional pero recomendada para mejores reservas

---

**Última actualización:** 2025-11-09
