# API de Autenticación - Viajero Conectado

Documentación de los endpoints de autenticación.

## Base URL

```
http://localhost:4000/api/v1/auth
```

---

## Endpoints

### 1. Registrar Usuario

Crea una nueva cuenta de usuario.

**Endpoint:** `POST /auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "role": "viajero",
  "displayName": "Juan Pérez"
}
```

**Campos:**
- `email` (string, requerido): Email único del usuario
- `password` (string, requerido): Contraseña (mínimo 8 caracteres)
- `role` (string, opcional): Rol del usuario. Valores: `viajero`, `agencia`, `hotel`, `guia`, `conductor`. Default: `viajero`
- `displayName` (string, opcional): Nombre para mostrar

**Respuesta exitosa (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "viajero",
    "status": "active",
    "displayName": "Juan Pérez",
    "avatarUrl": null
  },
  "expiresIn": 604800
}
```

**Errores:**
- `409 Conflict`: Email ya registrado
- `400 Bad Request`: Datos de validación incorrectos

---

### 2. Iniciar Sesión

Autentica un usuario existente.

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Respuesta exitosa (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "viajero",
    "status": "active",
    "displayName": "Juan Pérez",
    "avatarUrl": null
  },
  "expiresIn": 604800
}
```

**Errores:**
- `401 Unauthorized`: Credenciales inválidas

---

### 3. Obtener Usuario Actual

Obtiene la información del usuario autenticado.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "viajero",
  "status": "active",
  "emailVerified": false,
  "profile": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "displayName": "Juan Pérez",
    "bio": null,
    "avatarUrl": null,
    "coverUrl": null,
    "countryCode": null,
    "city": null,
    "languages": null,
    "dateOfBirth": null,
    "gender": null,
    "createdAt": "2025-11-09T10:30:00.000Z",
    "updatedAt": "2025-11-09T10:30:00.000Z"
  }
}
```

**Errores:**
- `401 Unauthorized`: Token inválido o expirado

---

### 4. Refrescar Token

Obtiene un nuevo access token usando el refresh token.

**Endpoint:** `POST /auth/refresh`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "viajero",
    "status": "active",
    "displayName": "Juan Pérez",
    "avatarUrl": null
  },
  "expiresIn": 604800
}
```

---

### 5. Solicitar Reset de Contraseña

Envía un email con instrucciones para resetear la contraseña.

**Endpoint:** `POST /auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Si el email existe, recibirás instrucciones para resetear tu contraseña"
}
```

**Nota:** Por seguridad, siempre devuelve el mismo mensaje, exista o no el email.

---

### 6. Resetear Contraseña

Resetea la contraseña usando el token recibido por email.

**Endpoint:** `POST /auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123!"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores:**
- `400 Bad Request`: Token inválido o expirado

---

### 7. Cambiar Contraseña

Cambia la contraseña del usuario autenticado.

**Endpoint:** `POST /auth/change-password`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores:**
- `401 Unauthorized`: Contraseña actual incorrecta

---

## Ejemplos de Uso

### cURL

**Registrar usuario:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "displayName": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Obtener usuario actual:**
```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript (Fetch)

```javascript
// Registrar
const register = async () => {
  const response = await fetch('http://localhost:4000/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test123!',
      displayName: 'Test User',
    }),
  });

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
};

// Request con autenticación
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
};
```

---

## Tokens JWT

### Access Token

- **Duración:** 7 días (configurable)
- **Uso:** Incluir en header `Authorization: Bearer {token}` en todas las requests autenticadas
- **Payload:**
  ```json
  {
    "sub": "user-id",
    "email": "user@example.com",
    "role": "viajero",
    "iat": 1699520000,
    "exp": 1700124800
  }
  ```

### Refresh Token

- **Duración:** 30 días (configurable)
- **Uso:** Solicitar nuevo access token cuando expire
- **Endpoint:** `POST /auth/refresh`

---

## Roles de Usuario

Los siguientes roles están disponibles:

- `viajero` - Usuario viajero (default)
- `agencia` - Agencia de viajes
- `hotel` - Hotel o alojamiento
- `guia` - Guía turístico
- `conductor` - Conductor / transporte
- `admin` - Administrador del sistema

Cada rol tiene permisos específicos en diferentes endpoints.

---

## Seguridad

### Contraseñas

- Mínimo 8 caracteres
- Hash con bcrypt (12 rounds)
- No se almacena en texto plano

### Rate Limiting

- 100 requests por minuto por IP
- Endpoints de auth pueden tener límites más estrictos

### HTTPS

En producción, todas las comunicaciones deben ser por HTTPS.

---

## Próximas Implementaciones

- [ ] Verificación de email por código
- [ ] Autenticación con Google OAuth
- [ ] Autenticación con Facebook OAuth
- [ ] Autenticación con Apple
- [ ] 2FA (Two-Factor Authentication)
- [ ] Sessions management
- [ ] Login history

---

**Última actualización:** 2025-11-09
