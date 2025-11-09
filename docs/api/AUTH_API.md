# Auth API Documentation

## Descripción General

El módulo de autenticación proporciona endpoints para registro de usuarios, inicio de sesión, gestión de tokens JWT y recuperación de contraseñas. Implementa autenticación segura con JWT, soporte multi-rol y funcionalidades completas de gestión de sesiones.

**Base URL:** `/api/v1/auth`

---

## Características Principales

- ✅ Registro de usuarios con validación de email
- ✅ Autenticación JWT con access y refresh tokens
- ✅ Recuperación de contraseña con tokens temporales
- ✅ Cambio de contraseña para usuarios autenticados
- ✅ Verificación de email
- ✅ Soporte multi-rol (7 roles)
- ✅ Rate limiting para prevenir ataques
- ✅ Hashing seguro de contraseñas con bcrypt

---

## Roles Disponibles

```typescript
enum UserRole {
  TRAVELER = 'traveler',           // Viajero
  AGENCY = 'agency',                // Agencia de viajes
  HOTEL = 'hotel',                  // Hotel/Alojamiento
  GUIDE = 'guide',                  // Guía turístico
  DRIVER = 'driver',                // Conductor/Transporte
  ADMIN = 'admin',                  // Administrador
  MODERATOR = 'moderator',          // Moderador
}
```

---

## Endpoints

### 1. Registrar Usuario

Crea una nueva cuenta de usuario en la plataforma.

**Endpoint:** `POST /auth/register`
**Autenticación:** No requerida
**Rol requerido:** Público

#### Request Body

```json
{
  "email": "juan@example.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "traveler",
  "phoneNumber": "+57 300 123 4567"
}
```

#### Validaciones

- **email:** Debe ser un email válido, único en el sistema
- **password:** Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números
- **firstName:** Requerido, 2-50 caracteres
- **lastName:** Requerido, 2-50 caracteres
- **role:** Debe ser uno de los roles válidos (default: 'traveler')
- **phoneNumber:** Opcional, formato internacional

#### Response (201 Created)

```json
{
  "user": {
    "id": "uuid-123",
    "email": "juan@example.com",
    "role": "traveler",
    "status": "active",
    "emailVerified": false,
    "profile": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "phoneNumber": "+57 300 123 4567"
    }
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### Errores

- `400 Bad Request` - Datos de entrada inválidos
- `409 Conflict` - Email ya registrado

---

### 2. Iniciar Sesión

Autentica un usuario y retorna tokens JWT.

**Endpoint:** `POST /auth/login`
**Autenticación:** No requerida
**Rol requerido:** Público

#### Request Body

```json
{
  "email": "juan@example.com",
  "password": "SecurePass123!"
}
```

#### Response (200 OK)

```json
{
  "user": {
    "id": "uuid-123",
    "email": "juan@example.com",
    "role": "traveler",
    "status": "active",
    "emailVerified": true,
    "profile": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "avatar": "https://cdn.example.com/avatars/uuid-123.jpg"
    }
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### Errores

- `400 Bad Request` - Email o contraseña faltantes
- `401 Unauthorized` - Credenciales inválidas
- `403 Forbidden` - Cuenta suspendida o inactiva

---

### 3. Obtener Usuario Actual

Retorna la información del usuario autenticado.

**Endpoint:** `GET /auth/me`
**Autenticación:** Bearer Token
**Rol requerido:** Cualquier usuario autenticado

#### Headers

```
Authorization: Bearer {access_token}
```

#### Response (200 OK)

```json
{
  "id": "uuid-123",
  "email": "juan@example.com",
  "role": "traveler",
  "status": "active",
  "emailVerified": true,
  "profile": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "phoneNumber": "+57 300 123 4567",
    "avatar": "https://cdn.example.com/avatars/uuid-123.jpg",
    "bio": "Amante de los viajes y la aventura"
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:22:00Z"
}
```

#### Errores

- `401 Unauthorized` - Token inválido o expirado

---

### 4. Refrescar Token

Genera un nuevo access token usando el refresh token.

**Endpoint:** `POST /auth/refresh`
**Autenticación:** Refresh Token
**Rol requerido:** Público

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

#### Errores

- `400 Bad Request` - Refresh token faltante
- `401 Unauthorized` - Refresh token inválido o expirado

---

### 5. Solicitar Recuperación de Contraseña

Envía un email con un token para resetear la contraseña.

**Endpoint:** `POST /auth/forgot-password`
**Autenticación:** No requerida
**Rol requerido:** Público

#### Request Body

```json
{
  "email": "juan@example.com"
}
```

#### Response (200 OK)

```json
{
  "message": "Si el email existe en nuestro sistema, recibirás un enlace para resetear tu contraseña"
}
```

**Nota:** Por seguridad, siempre retorna 200 OK incluso si el email no existe.

#### Email Enviado

El usuario recibe un email con:
- Token de recuperación válido por 1 hora
- Enlace: `https://app.viajeroconectado.com/reset-password?token={reset_token}`

---

### 6. Resetear Contraseña

Establece una nueva contraseña usando el token de recuperación.

**Endpoint:** `POST /auth/reset-password`
**Autenticación:** No requerida
**Rol requerido:** Público

#### Request Body

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

#### Validaciones

- **token:** Requerido, debe ser válido y no expirado
- **newPassword:** Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números

#### Response (200 OK)

```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

#### Errores

- `400 Bad Request` - Token inválido o datos faltantes
- `401 Unauthorized` - Token expirado
- `404 Not Found` - Token no encontrado

---

### 7. Cambiar Contraseña

Permite al usuario autenticado cambiar su contraseña.

**Endpoint:** `POST /auth/change-password`
**Autenticación:** Bearer Token
**Rol requerido:** Cualquier usuario autenticado

#### Headers

```
Authorization: Bearer {access_token}
```

#### Request Body

```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

#### Validaciones

- **currentPassword:** Debe coincidir con la contraseña actual
- **newPassword:** Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números, debe ser diferente a la actual

#### Response (200 OK)

```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

#### Errores

- `400 Bad Request` - Contraseña actual incorrecta
- `401 Unauthorized` - Token inválido

---

## Flujos Completos

### Flujo de Registro y Login

```
1. Usuario se registra
   POST /auth/register
   → Recibe tokens JWT
   → Email de verificación enviado

2. Usuario verifica email (opcional)
   Click en enlace del email
   → emailVerified = true

3. Usuario inicia sesión
   POST /auth/login
   → Recibe tokens JWT

4. Usuario accede a recursos protegidos
   GET /auth/me
   Authorization: Bearer {access_token}
```

### Flujo de Recuperación de Contraseña

```
1. Usuario olvida contraseña
   POST /auth/forgot-password
   { "email": "juan@example.com" }
   → Email enviado con token

2. Usuario recibe email
   Click en enlace con token
   → Redirige a formulario

3. Usuario establece nueva contraseña
   POST /auth/reset-password
   { "token": "...", "newPassword": "..." }
   → Contraseña actualizada

4. Usuario inicia sesión con nueva contraseña
   POST /auth/login
```

### Flujo de Refresh Token

```
1. Access token expira
   GET /auth/me
   → 401 Unauthorized

2. Frontend usa refresh token
   POST /auth/refresh
   { "refreshToken": "..." }
   → Nuevos tokens generados

3. Retry request original
   GET /auth/me
   Authorization: Bearer {new_access_token}
   → 200 OK
```

---

## Ejemplos de Uso

### Ejemplo 1: Registro de Viajero

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "SecurePass123!",
    "firstName": "María",
    "lastName": "García",
    "role": "traveler",
    "phoneNumber": "+57 301 234 5678"
  }'
```

### Ejemplo 2: Login y Acceso a Perfil

```bash
# 1. Login
ACCESS_TOKEN=$(curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "SecurePass123!"
  }' | jq -r '.tokens.accessToken')

# 2. Obtener perfil
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Ejemplo 3: Recuperación de Contraseña

```bash
# 1. Solicitar reset
curl -X POST http://localhost:4000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com"
  }'

# 2. Resetear con token del email
curl -X POST http://localhost:4000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "NewSecurePass456!"
  }'
```

### Ejemplo 4: Cambiar Contraseña

```bash
curl -X POST http://localhost:4000/api/v1/auth/change-password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

### Ejemplo 5: Refresh Token

```bash
# Access token expirado, usar refresh token
NEW_ACCESS_TOKEN=$(curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }' | jq -r '.accessToken')

# Usar nuevo access token
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN"
```

---

## Integración Frontend

### Auth Service (TypeScript)

```typescript
class AuthService {
  async register(data: RegisterDto) {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    this.setTokens(result.tokens);
    return result.user;
  }

  async login(email: string, password: string) {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    this.setTokens(result.tokens);
    return result.user;
  }

  setTokens(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const result = await response.json();
    this.setTokens(result);
    return result.accessToken;
  }
}
```

### Axios Interceptor para Auto-Refresh

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/v1/auth/refresh', {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## Seguridad

### Tokens JWT

- **Access Token:** Válido por 1 hora (3600 segundos)
- **Refresh Token:** Válido por 7 días (604800 segundos)
- **Algoritmo:** HS256
- **Claims incluidos:** `sub` (userId), `email`, `role`

### Contraseñas

- **Hashing:** bcrypt con 10 rounds
- **Requisitos:**
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Caracteres especiales recomendados

### Reset Tokens

- **Validez:** 1 hora
- **Uso único:** Token invalidado después del primer uso
- **Generación:** Crypto-secure random token

### Rate Limiting

Para prevenir ataques de fuerza bruta:

- **Login:** Máximo 5 intentos por IP cada 15 minutos
- **Register:** Máximo 3 registros por IP cada hora
- **Forgot Password:** Máximo 3 solicitudes por email cada hora

---

## Códigos de Estado HTTP

- `200 OK` - Operación exitosa (login, refresh, cambio de contraseña)
- `201 Created` - Usuario registrado exitosamente
- `400 Bad Request` - Datos de entrada inválidos
- `401 Unauthorized` - Credenciales inválidas o token expirado
- `403 Forbidden` - Cuenta suspendida o inactiva
- `404 Not Found` - Usuario no encontrado
- `409 Conflict` - Email ya registrado
- `429 Too Many Requests` - Rate limit excedido
- `500 Internal Server Error` - Error del servidor

---

## Troubleshooting

### Error: "Email already registered"

**Causa:** El email ya existe en la base de datos
**Solución:** Usar otro email o iniciar sesión con credenciales existentes

### Error: "Invalid credentials"

**Causa:** Email o contraseña incorrectos
**Solución:** Verificar credenciales o usar "forgot password"

### Error: "Token expired"

**Causa:** El access token ha expirado (>1 hora)
**Solución:** Usar refresh token para obtener nuevo access token

### Error: "Account suspended"

**Causa:** La cuenta ha sido suspendida por un admin
**Solución:** Contactar soporte para reactivación

---

## Versión

**API Version:** 1.0
**Última actualización:** Enero 2025
**Endpoint base:** `/api/v1/auth`
