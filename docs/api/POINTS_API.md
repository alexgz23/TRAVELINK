# API de Puntos y Gamificación - Viajero Conectado

Sistema de puntos, niveles y recompensas para fidelización de usuarios.

## Base URL

```
http://localhost:4000/api/v1/points
```

---

## Sistema de Niveles

| Nivel | Nombre | Puntos Mínimos |
|-------|--------|----------------|
| 1 | Explorador | 0 |
| 2 | Caminante | 500 |
| 3 | Viajero Activo | 2,000 |
| 4 | Viajero Experto | 5,000 |
| 5 | Embajador | 10,000 |

## Acciones que Generan Puntos

| Acción | Puntos |
|--------|--------|
| Reserva completada | 100 |
| Reseña con foto | 50 |
| Reseña con video | 75 |
| Post publicado | 20 |
| Referido que reserva | 200 |
| Perfil completado | 50 |
| Compartir experiencia | 10 |

---

## Endpoints de Viajero

### 1. Obtener Mi Balance de Puntos

**Endpoint:** `GET /points/balance`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "currentPoints": 1250,
  "totalPointsEarned": 3450,
  "currentLevel": 3,
  "currentLevelName": "Viajero Activo",
  "nextLevel": 4,
  "nextLevelName": "Viajero Experto",
  "pointsToNextLevel": 1550,
  "badges": ["first_trip", "adventurer", "super_reviewer"]
}
```

---

### 2. Obtener Mi Historial de Transacciones

**Endpoint:** `GET /points/transactions`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `type` (enum, opcional): `earned`, `redeemed`, `expired`, `adjusted`
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": 100,
      "type": "earned",
      "reason": "booking_completed",
      "description": null,
      "relatedEntityId": "uuid-booking",
      "relatedEntityType": "Booking",
      "expiresAt": "2026-11-09",
      "isExpired": false,
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

### 3. Obtener Recompensas Disponibles

**Endpoint:** `GET /points/rewards`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": "uuid",
    "name": "Descuento 10% en próximo viaje",
    "description": "Obtén un descuento del 10% en tu próxima reserva",
    "type": "discount",
    "pointsCost": 500,
    "imageUrl": "https://cdn.example.com/reward1.jpg",
    "status": "active",
    "stock": 100,
    "minLevel": 2,
    "canAfford": true,
    "meetsLevelRequirement": true,
    "validFrom": null,
    "validUntil": null
  },
  {
    "id": "uuid2",
    "name": "Experiencia VIP en Cartagena",
    "description": "Tour privado exclusivo para embajadores",
    "type": "experience",
    "pointsCost": 5000,
    "imageUrl": "https://cdn.example.com/reward2.jpg",
    "status": "active",
    "stock": 10,
    "minLevel": 5,
    "canAfford": false,
    "meetsLevelRequirement": false,
    "validFrom": "2025-12-01",
    "validUntil": "2026-03-31"
  }
]
```

---

### 4. Canjear Recompensa

**Endpoint:** `POST /points/redeem`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "rewardId": "uuid-recompensa",
  "deliveryNotes": "Enviar al email principal"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "rewardId": "uuid-recompensa",
  "pointsSpent": 500,
  "status": "pending",
  "deliveryNotes": "Enviar al email principal",
  "createdAt": "2025-11-09T12:00:00.000Z"
}
```

**Errores:**
- `400 Bad Request`: Puntos insuficientes o recompensa no disponible
- `403 Forbidden`: No cumples el nivel mínimo requerido
- `404 Not Found`: Recompensa no encontrada

---

### 5. Obtener Mis Canjes

**Endpoint:** `GET /points/my-redemptions`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, opcional): Página
- `limit` (number, opcional): Items por página

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "userId": "uuid",
      "rewardId": "uuid",
      "pointsSpent": 500,
      "status": "completed",
      "deliveryNotes": "Enviado por email",
      "processedAt": "2025-11-09T13:00:00.000Z",
      "completedAt": "2025-11-09T14:00:00.000Z",
      "reward": {
        "id": "uuid",
        "name": "Descuento 10%",
        "type": "discount"
      },
      "createdAt": "2025-11-09T12:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

## Endpoints Administrativos

**Requieren:**
- Rol: `admin`
- Header: `Authorization: Bearer {accessToken}`

### 6. Ajustar Puntos Manualmente

**Endpoint:** `POST /points/admin/adjust/:userId`

**Body:**
```json
{
  "amount": 100,
  "reason": "Compensación por error",
  "description": "Ajuste por problema técnico en reserva #123"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "userId": "uuid-usuario",
  "amount": 100,
  "type": "adjusted",
  "reason": "Compensación por error",
  "description": "Ajuste por problema técnico en reserva #123",
  "createdAt": "2025-11-09T15:00:00.000Z"
}
```

---

### 7. Crear Recompensa

**Endpoint:** `POST /points/admin/rewards`

**Body:**
```json
{
  "name": "Descuento 15% Black Friday",
  "description": "Descuento especial por Black Friday",
  "type": "discount",
  "pointsCost": 300,
  "imageUrl": "https://cdn.example.com/blackfriday.jpg",
  "status": "active",
  "stock": 500,
  "minLevel": 1,
  "metadata": {
    "discountCode": "BF2025",
    "discountPercentage": 15
  },
  "validFrom": "2025-11-25",
  "validUntil": "2025-11-30"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "name": "Descuento 15% Black Friday",
  "type": "discount",
  "pointsCost": 300,
  "status": "active",
  "createdAt": "2025-11-09T10:00:00.000Z"
}
```

---

### 8. Listar Todas las Recompensas

**Endpoint:** `GET /points/admin/rewards`

**Respuesta (200):** Lista completa de todas las recompensas

---

### 9. Actualizar Recompensa

**Endpoint:** `PATCH /points/admin/rewards/:id`

**Body:** (campos opcionales)
```json
{
  "stock": 450,
  "status": "active"
}
```

---

### 10. Eliminar Recompensa

**Endpoint:** `DELETE /points/admin/rewards/:id`

**Respuesta (204):** No content

---

### 11. Listar Todos los Canjes

**Endpoint:** `GET /points/admin/redemptions`

**Query Parameters:**
- `userId` (uuid, opcional): Filtrar por usuario
- `page`, `limit`: Paginación

**Respuesta (200):** Lista de todos los canjes con detalles de usuario y recompensa

---

### 12. Procesar Canje

**Endpoint:** `PATCH /points/admin/redemptions/:id/process`

**Body:**
```json
{
  "status": "completed"
}
```

**Valores de status:**
- `pending` - Pendiente
- `processing` - En proceso
- `completed` - Completado
- `cancelled` - Cancelado (reembolsa puntos)

---

### 13. Procesar Puntos Expirados

**Endpoint:** `POST /points/admin/process-expired`

Cron job para procesar puntos que expiraron (12 meses).

**Respuesta (200):**
```json
{
  "processedTransactions": 45
}
```

---

## Ejemplos de Uso

### JavaScript (Fetch)

```javascript
// Obtener mi balance
const getBalance = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/points/balance', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

// Canjear recompensa
const redeemReward = async (rewardId, notes) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/points/redeem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      rewardId,
      deliveryNotes: notes,
    }),
  });
  return response.json();
};

// Admin: Ajustar puntos
const adjustPoints = async (userId, amount, reason) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:4000/api/v1/points/admin/adjust/${userId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, reason }),
    }
  );
  return response.json();
};
```

---

## Flujo de Gamificación

### Ganar Puntos:
1. Usuario completa una acción (reserva, reseña, post)
2. Sistema llama automáticamente `earnPoints()`
3. Se crea transacción de puntos
4. Se actualiza balance del usuario
5. Se verifica y actualiza nivel si corresponde

### Canjear Recompensas:
1. Usuario ve recompensas disponibles
2. Sistema verifica: puntos, nivel, stock, vigencia
3. Se descuentan puntos y se crea canje
4. Admin procesa el canje
5. Usuario recibe su recompensa

### Expiración:
1. Puntos tienen validez de 12 meses
2. Cron job ejecuta `processExpiredPoints()`
3. Puntos vencidos se marcan y se descuentan

---

## Notas Importantes

1. **Puntos:** Se acumulan por acciones valiosas para el ecosistema
2. **Niveles:** Se calculan basados en `totalPointsEarned` (puntos históricos)
3. **Balance:** `currentPoints` son los disponibles para canjear
4. **Expiración:** Los puntos ganados expiran en 12 meses
5. **Reembolsos:** Al cancelar un canje, se reembolsan los puntos
6. **Stock:** Las recompensas pueden tener stock limitado
7. **Niveles:** Algunas recompensas requieren nivel mínimo

---

**Última actualización:** 2025-11-09
