# Users API Documentation

## Descripción General

El módulo de usuarios proporciona endpoints para gestionar perfiles de usuario, información personal y configuraciones. Incluye operaciones CRUD completas con permisos basados en roles y campos de gamificación integrados.

**Base URL:** `/api/v1/users`

---

## Características Principales

- ✅ Gestión completa de perfiles de usuario
- ✅ Soporte multi-rol (viajero, agencia, hotel, guía, conductor, admin, moderador)
- ✅ Perfiles enriquecidos con información social
- ✅ Sistema de gamificación integrado (puntos, niveles, badges)
- ✅ Verificación de email y teléfono
- ✅ Control de acceso basado en roles
- ✅ Actualización de perfil propio y administración de usuarios

---

## Estructura de Usuario

### User Entity

```typescript
{
  "id": "uuid",
  "email": "string",
  "role": "traveler" | "agency" | "hotel" | "guide" | "driver" | "admin" | "moderator",
  "status": "active" | "inactive" | "suspended" | "banned",
  "phone": "string",
  "emailVerified": boolean,
  "emailVerifiedAt": "timestamp",
  "phoneVerified": boolean,
  "phoneVerifiedAt": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastLoginAt": "timestamp",
  "profile": UserProfile
}
```

### UserProfile Entity

```typescript
{
  "userId": "uuid",
  "displayName": "string",
  "bio": "string",
  "avatarUrl": "string",
  "coverUrl": "string",
  "countryCode": "string (ISO 3166-1 alpha-2)",
  "city": "string",
  "languages": ["string"],
  "dateOfBirth": "date",
  "gender": "male" | "female" | "other" | "prefer_not_to_say",

  // Gamification
  "currentPoints": number,
  "totalPointsEarned": number,
  "currentLevel": number,
  "badges": ["badge_code"],

  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Endpoints

### 1. Obtener Perfil Actual

Retorna el perfil completo del usuario autenticado.

**Endpoint:** `GET /users/me`
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
  "phone": "+57 300 123 4567",
  "emailVerified": true,
  "emailVerifiedAt": "2025-01-15T10:30:00Z",
  "phoneVerified": false,
  "phoneVerifiedAt": null,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:22:00Z",
  "lastLoginAt": "2025-01-25T09:15:00Z",
  "profile": {
    "userId": "uuid-123",
    "displayName": "Juan Pérez",
    "bio": "Amante de los viajes y la aventura. Explorando Colombia 🇨🇴",
    "avatarUrl": "https://cdn.viajeroconectado.com/avatars/uuid-123.jpg",
    "coverUrl": "https://cdn.viajeroconectado.com/covers/uuid-123.jpg",
    "countryCode": "CO",
    "city": "Bogotá",
    "languages": ["es", "en"],
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "currentPoints": 2450,
    "totalPointsEarned": 3200,
    "currentLevel": 3,
    "badges": ["early_bird", "explorer", "social_butterfly"],
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-20T14:22:00Z"
  }
}
```

#### Errores

- `401 Unauthorized` - Token inválido o expirado

---

### 2. Actualizar Perfil Actual

Permite al usuario actualizar su propio perfil.

**Endpoint:** `PATCH /users/me`
**Autenticación:** Bearer Token
**Rol requerido:** Cualquier usuario autenticado

#### Headers

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body

Todos los campos son opcionales. Solo enviar los campos que se desean actualizar.

```json
{
  "displayName": "Juan Pérez Viajero",
  "bio": "Aventurero profesional | 30+ países visitados | Fotógrafo de viajes",
  "avatarUrl": "https://cdn.viajeroconectado.com/avatars/new-avatar.jpg",
  "coverUrl": "https://cdn.viajeroconectado.com/covers/new-cover.jpg",
  "countryCode": "CO",
  "city": "Medellín",
  "languages": ["es", "en", "pt"],
  "dateOfBirth": "1990-05-15",
  "gender": "male"
}
```

#### Campos Actualizables

- **displayName:** Nombre para mostrar (max 100 caracteres)
- **bio:** Biografía del usuario (texto largo)
- **avatarUrl:** URL de la foto de perfil (max 500 caracteres)
- **coverUrl:** URL de la foto de portada (max 500 caracteres)
- **countryCode:** Código de país ISO 3166-1 alpha-2 (ej: "CO", "US", "MX")
- **city:** Ciudad de residencia (max 100 caracteres)
- **languages:** Array de códigos de idioma ISO 639-1 (ej: ["es", "en"])
- **dateOfBirth:** Fecha de nacimiento (formato: YYYY-MM-DD)
- **gender:** Género ("male", "female", "other", "prefer_not_to_say")

**Nota:** Los campos de gamificación (puntos, nivel, badges) NO pueden ser actualizados directamente por el usuario. Solo el sistema puede modificarlos.

#### Response (200 OK)

```json
{
  "id": "uuid-123",
  "email": "juan@example.com",
  "role": "traveler",
  "status": "active",
  "profile": {
    "userId": "uuid-123",
    "displayName": "Juan Pérez Viajero",
    "bio": "Aventurero profesional | 30+ países visitados | Fotógrafo de viajes",
    "avatarUrl": "https://cdn.viajeroconectado.com/avatars/new-avatar.jpg",
    "coverUrl": "https://cdn.viajeroconectado.com/covers/new-cover.jpg",
    "countryCode": "CO",
    "city": "Medellín",
    "languages": ["es", "en", "pt"],
    "currentPoints": 2450,
    "currentLevel": 3,
    "updatedAt": "2025-01-25T10:30:00Z"
  }
}
```

#### Errores

- `400 Bad Request` - Datos de entrada inválidos
- `401 Unauthorized` - Token inválido o expirado

---

### 3. Obtener Usuario por ID

Retorna la información pública de un usuario específico.

**Endpoint:** `GET /users/:id`
**Autenticación:** Bearer Token
**Rol requerido:** Cualquier usuario autenticado

#### Parameters

- **id** (path, required): UUID del usuario

#### Headers

```
Authorization: Bearer {access_token}
```

#### Response (200 OK)

```json
{
  "id": "uuid-456",
  "email": "maria@example.com",
  "role": "agency",
  "status": "active",
  "emailVerified": true,
  "createdAt": "2024-12-01T10:00:00Z",
  "profile": {
    "userId": "uuid-456",
    "displayName": "Viajes Colombia Tours",
    "bio": "Agencia de viajes especializada en turismo sostenible y experiencias auténticas",
    "avatarUrl": "https://cdn.viajeroconectado.com/avatars/uuid-456.jpg",
    "countryCode": "CO",
    "city": "Cartagena",
    "currentLevel": 5,
    "badges": ["verified_agency", "top_rated", "eco_friendly"]
  }
}
```

**Nota:** Algunos campos sensibles como teléfono no se exponen en perfiles públicos.

#### Errores

- `401 Unauthorized` - Token inválido o expirado
- `404 Not Found` - Usuario no encontrado

---

### 4. Listar Todos los Usuarios (Admin)

Retorna la lista completa de usuarios del sistema.

**Endpoint:** `GET /users`
**Autenticación:** Bearer Token
**Rol requerido:** Admin

#### Headers

```
Authorization: Bearer {access_token}
```

#### Response (200 OK)

```json
[
  {
    "id": "uuid-123",
    "email": "juan@example.com",
    "role": "traveler",
    "status": "active",
    "emailVerified": true,
    "phoneVerified": false,
    "createdAt": "2025-01-15T10:30:00Z",
    "lastLoginAt": "2025-01-25T09:15:00Z",
    "profile": {
      "displayName": "Juan Pérez",
      "currentLevel": 3,
      "currentPoints": 2450
    }
  },
  {
    "id": "uuid-456",
    "email": "maria@example.com",
    "role": "agency",
    "status": "active",
    "emailVerified": true,
    "phoneVerified": true,
    "createdAt": "2024-12-01T10:00:00Z",
    "lastLoginAt": "2025-01-24T14:30:00Z",
    "profile": {
      "displayName": "Viajes Colombia Tours",
      "currentLevel": 5,
      "currentPoints": 8900
    }
  }
]
```

#### Errores

- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - Usuario no tiene rol de admin

---

### 5. Actualizar Usuario (Admin)

Permite a un administrador actualizar cualquier campo de cualquier usuario.

**Endpoint:** `PATCH /users/:id`
**Autenticación:** Bearer Token
**Rol requerido:** Admin

#### Parameters

- **id** (path, required): UUID del usuario

#### Headers

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body

Todos los campos son opcionales.

```json
{
  "email": "nuevo-email@example.com",
  "role": "guide",
  "status": "suspended",
  "displayName": "Nuevo Nombre",
  "bio": "Nueva biografía"
}
```

#### Campos Actualizables por Admin

Además de los campos de perfil, los admins pueden actualizar:

- **email:** Email del usuario
- **role:** Cambiar rol del usuario
- **status:** Cambiar estado (active, inactive, suspended, banned)
- **emailVerified:** Marcar email como verificado
- **phoneVerified:** Marcar teléfono como verificado

#### Response (200 OK)

```json
{
  "id": "uuid-123",
  "email": "nuevo-email@example.com",
  "role": "guide",
  "status": "suspended",
  "profile": {
    "displayName": "Nuevo Nombre",
    "bio": "Nueva biografía",
    "updatedAt": "2025-01-25T10:30:00Z"
  }
}
```

#### Errores

- `400 Bad Request` - Datos de entrada inválidos
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - Usuario no tiene rol de admin
- `404 Not Found` - Usuario no encontrado

---

### 6. Eliminar Usuario (Admin)

Elimina permanentemente un usuario del sistema.

**Endpoint:** `DELETE /users/:id`
**Autenticación:** Bearer Token
**Rol requerido:** Admin

#### Parameters

- **id** (path, required): UUID del usuario

#### Headers

```
Authorization: Bearer {access_token}
```

#### Response (200 OK)

```json
{
  "message": "Usuario eliminado exitosamente",
  "id": "uuid-123"
}
```

**Nota:** Esta operación es irreversible y elimina en cascada todos los datos relacionados del usuario.

#### Errores

- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - Usuario no tiene rol de admin
- `404 Not Found` - Usuario no encontrado

---

## Roles de Usuario

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

## Estados de Usuario

```typescript
enum UserStatus {
  ACTIVE = 'active',                // Usuario activo
  INACTIVE = 'inactive',            // Usuario inactivo (temporal)
  SUSPENDED = 'suspended',          // Usuario suspendido (moderación)
  BANNED = 'banned',                // Usuario baneado (permanente)
}
```

## Género

```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}
```

---

## Sistema de Gamificación

Los perfiles de usuario incluyen campos de gamificación:

### Puntos

- **currentPoints:** Puntos actuales disponibles para canjear
- **totalPointsEarned:** Total de puntos ganados históricos

### Niveles

Los usuarios avanzan por 5 niveles según puntos totales:

1. **Nivel 1 - Explorador Novato** (0-999 puntos)
2. **Nivel 2 - Viajero Entusiasta** (1,000-2,499 puntos)
3. **Nivel 3 - Aventurero Experto** (2,500-4,999 puntos)
4. **Nivel 4 - Trotamundos Elite** (5,000-9,999 puntos)
5. **Nivel 5 - Leyenda Viajera** (10,000+ puntos)

### Badges (Insignias)

Algunos badges disponibles:

- `early_bird` - Primeros usuarios
- `explorer` - 10+ destinos visitados
- `social_butterfly` - 50+ conexiones
- `reviewer` - 25+ reseñas escritas
- `verified_agency` - Agencia verificada
- `top_rated` - Calificación 4.8+
- `eco_friendly` - Enfoque en turismo sostenible

---

## Ejemplos de Uso

### Ejemplo 1: Obtener Mi Perfil

```bash
curl -X GET http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Ejemplo 2: Actualizar Mi Perfil

```bash
curl -X PATCH http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Juan el Viajero",
    "bio": "Explorando el mundo 🌍",
    "city": "Medellín",
    "languages": ["es", "en", "pt"]
  }'
```

### Ejemplo 3: Ver Perfil de Otro Usuario

```bash
curl -X GET http://localhost:4000/api/v1/users/uuid-456 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Ejemplo 4: Admin - Listar Todos los Usuarios

```bash
curl -X GET http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```

### Ejemplo 5: Admin - Suspender Usuario

```bash
curl -X PATCH http://localhost:4000/api/v1/users/uuid-123 \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended"
  }'
```

### Ejemplo 6: Admin - Eliminar Usuario

```bash
curl -X DELETE http://localhost:4000/api/v1/users/uuid-123 \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```

---

## Integración Frontend

### User Service (TypeScript)

```typescript
class UserService {
  async getMyProfile() {
    const response = await fetch('/api/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
    return response.json();
  }

  async updateProfile(data: Partial<UserProfile>) {
    const response = await fetch('/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async getUserById(userId: string) {
    const response = await fetch(`/api/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
    return response.json();
  }

  private getToken(): string {
    return localStorage.getItem('accessToken') || '';
  }
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, updateProfile };
}
```

---

## Códigos de Estado HTTP

- `200 OK` - Operación exitosa
- `400 Bad Request` - Datos de entrada inválidos
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - Permisos insuficientes
- `404 Not Found` - Usuario no encontrado
- `500 Internal Server Error` - Error del servidor

---

## Mejores Prácticas

### 1. Actualización de Avatar/Cover

```typescript
// Subir imagen primero, luego actualizar URL
const uploadAvatar = async (file: File) => {
  // 1. Upload to storage service (S3/R2)
  const formData = new FormData();
  formData.append('file', file);

  const uploadResponse = await fetch('/api/v1/upload', {
    method: 'POST',
    body: formData,
  });

  const { url } = await uploadResponse.json();

  // 2. Update profile with new URL
  await fetch('/api/v1/users/me', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ avatarUrl: url }),
  });
};
```

### 2. Validación de Datos

```typescript
// Validar antes de enviar
const validateProfile = (data: Partial<UserProfile>) => {
  const errors = [];

  if (data.displayName && data.displayName.length > 100) {
    errors.push('Display name too long');
  }

  if (data.countryCode && !/^[A-Z]{2}$/.test(data.countryCode)) {
    errors.push('Invalid country code');
  }

  if (data.languages && !Array.isArray(data.languages)) {
    errors.push('Languages must be an array');
  }

  return errors;
};
```

### 3. Cache de Perfil

```typescript
// Usar caché para evitar requests repetidos
class UserProfileCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutos

  async getProfile(userId: string) {
    const cached = this.cache.get(userId);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const response = await fetch(`/api/v1/users/${userId}`);
    const data = await response.json();

    this.cache.set(userId, { data, timestamp: now });
    return data;
  }

  invalidate(userId: string) {
    this.cache.delete(userId);
  }
}
```

---

## Troubleshooting

### Error: "Forbidden"

**Causa:** Intentando acceder a endpoint de admin sin permisos
**Solución:** Verificar que el usuario tenga rol de admin

### Error: "User not found"

**Causa:** El UUID del usuario no existe
**Solución:** Verificar que el ID sea correcto

### Error: "Invalid country code"

**Causa:** Código de país no es ISO 3166-1 alpha-2
**Solución:** Usar códigos de 2 letras (ej: "CO", "US", "MX")

---

## Versión

**API Version:** 1.0
**Última actualización:** Enero 2025
**Endpoint base:** `/api/v1/users`
