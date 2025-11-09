# API de Experiencias - Viajero Conectado

Documentación de los endpoints para gestión de experiencias (tours, actividades, paquetes).

## Base URL

```
http://localhost:4000/api/v1/experiences
```

---

## Endpoints Públicos

### 1. Listar Experiencias

Obtiene un listado paginado de experiencias con filtros.

**Endpoint:** `GET /experiences`

**Query Parameters:**
- `category` (string, opcional): Categoría (`tour`, `activity`, `transport`, `package`, `accommodation`)
- `country` (string, opcional): Código de país (ej: `CO`)
- `city` (string, opcional): Ciudad
- `difficultyLevel` (string, opcional): `easy`, `moderate`, `hard`, `expert`
- `minPrice` (number, opcional): Precio mínimo
- `maxPrice` (number, opcional): Precio máximo
- `currency` (string, opcional): Moneda (`COP`, `USD`, `EUR`)
- `language` (string, opcional): Idioma disponible (`es`, `en`, `pt`)
- `search` (string, opcional): Búsqueda en título y descripción
- `featured` (boolean, opcional): Solo destacados
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20, max: 100)
- `sortBy` (string, opcional): Campo para ordenar (default: `createdAt`)
- `sortOrder` (string, opcional): `ASC` o `DESC` (default: `DESC`)

**Ejemplo:**
```
GET /experiences?country=CO&city=Cartagena&category=tour&page=1&limit=20
```

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Tour por el Centro Histórico de Cartagena",
      "slug": "tour-por-el-centro-historico-de-cartagena",
      "description": "Descubre la historia colonial...",
      "shortDescription": "Tour guiado por las calles...",
      "category": "tour",
      "locationCountry": "CO",
      "locationCity": "Cartagena",
      "priceFrom": 150000,
      "currency": "COP",
      "featured": true,
      "agency": {
        "id": "uuid",
        "profile": {
          "displayName": "Agencia XYZ"
        }
      },
      "media": [
        {
          "id": "uuid",
          "type": "image",
          "url": "https://cdn.example.com/image.jpg",
          "displayOrder": 0
        }
      ],
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

### 2. Obtener Experiencia por Slug

**Endpoint:** `GET /experiences/slug/:slug`

**Parámetros:**
- `slug` (string): Slug único de la experiencia

**Ejemplo:**
```
GET /experiences/slug/tour-por-el-centro-historico-de-cartagena
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "title": "Tour por el Centro Histórico de Cartagena",
  "slug": "tour-por-el-centro-historico-de-cartagena",
  "description": "Descripción completa...",
  "shortDescription": "Descripción corta...",
  "category": "tour",
  "subcategory": "city-tour",
  "locationCountry": "CO",
  "locationCity": "Cartagena",
  "locationAddress": "Plaza de Bolívar",
  "locationLat": 10.3910485,
  "locationLng": -75.4794257,
  "durationHours": 4,
  "difficultyLevel": "easy",
  "minAge": 5,
  "maxGroupSize": 15,
  "languages": ["es", "en"],
  "priceFrom": 150000,
  "currency": "COP",
  "status": "published",
  "featured": false,
  "agency": {
    "id": "uuid",
    "profile": {
      "displayName": "Agencia XYZ",
      "avatarUrl": "https://..."
    }
  },
  "variants": [
    {
      "id": "uuid",
      "name": "Tour Grupal",
      "description": "Grupo de hasta 15 personas",
      "price": 150000,
      "maxPeople": 15,
      "includes": ["Guía", "Transporte", "Entradas"],
      "excludes": ["Comidas", "Propinas"],
      "isDefault": true
    },
    {
      "id": "uuid",
      "name": "Tour Privado",
      "description": "Experiencia exclusiva",
      "price": 350000,
      "maxPeople": 6,
      "includes": ["Guía privado", "Transporte privado", "Entradas"],
      "excludes": ["Comidas"],
      "isDefault": false
    }
  ],
  "media": [
    {
      "id": "uuid",
      "type": "image",
      "url": "https://cdn.example.com/image1.jpg",
      "thumbnailUrl": "https://cdn.example.com/thumb1.jpg",
      "caption": "Vista del mar Caribe",
      "displayOrder": 0
    }
  ],
  "itineraries": [
    {
      "id": "uuid",
      "dayNumber": 1,
      "title": "Centro Histórico",
      "description": "Recorrido por las calles coloniales...",
      "location": "Plaza de Bolívar",
      "meals": ["breakfast"]
    }
  ],
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

**Errores:**
- `404 Not Found`: Experiencia no encontrada

---

### 3. Obtener Experiencia por ID

**Endpoint:** `GET /experiences/:id`

Similar al endpoint anterior pero usando ID en lugar de slug.

---

## Endpoints de Agencia (Autenticados)

**Requieren:**
- Header: `Authorization: Bearer {accessToken}`
- Rol: `agencia` o `admin`

### 4. Crear Experiencia

**Endpoint:** `POST /experiences`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Tour por el Centro Histórico de Cartagena",
  "description": "Descubre la historia colonial de Cartagena en un recorrido guiado por expertos...",
  "shortDescription": "Tour guiado por las calles más emblemáticas de Cartagena",
  "category": "tour",
  "subcategory": "city-tour",
  "location": {
    "country": "CO",
    "city": "Cartagena",
    "address": "Plaza de Bolívar",
    "latitude": 10.3910485,
    "longitude": -75.4794257
  },
  "durationHours": 4,
  "difficultyLevel": "easy",
  "minAge": 5,
  "maxGroupSize": 15,
  "languages": ["es", "en"],
  "priceFrom": 150000,
  "currency": "COP"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "title": "Tour por el Centro Histórico de Cartagena",
  "slug": "tour-por-el-centro-historico-de-cartagena",
  "agencyId": "uuid",
  "status": "draft",
  ...
}
```

**Errores:**
- `403 Forbidden`: Solo agencias pueden crear experiencias
- `400 Bad Request`: Datos inválidos

---

### 5. Obtener Mis Experiencias

**Endpoint:** `GET /experiences/agency/my-experiences`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": "uuid",
    "title": "Tour por el Centro Histórico",
    "slug": "tour-por-el-centro-historico",
    "status": "published",
    "priceFrom": 150000,
    "variants": [...],
    "media": [...],
    "createdAt": "2025-11-09T10:00:00.000Z"
  }
]
```

---

### 6. Actualizar Experiencia

**Endpoint:** `PATCH /experiences/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:** (campos opcionales)
```json
{
  "title": "Nuevo título",
  "description": "Nueva descripción",
  "priceFrom": 180000
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "title": "Nuevo título",
  ...
}
```

**Errores:**
- `403 Forbidden`: No eres dueño de esta experiencia
- `404 Not Found`: Experiencia no encontrada

---

### 7. Eliminar Experiencia

**Endpoint:** `DELETE /experiences/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (204):** No content

**Errores:**
- `403 Forbidden`: No eres dueño de esta experiencia

---

### 8. Publicar Experiencia

Cambia el status de `draft` a `published`.

**Endpoint:** `POST /experiences/:id/publish`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Validaciones:**
- Debe tener al menos una variante
- Debe tener al menos una imagen

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "status": "published",
  ...
}
```

**Errores:**
- `400 Bad Request`: Faltan variantes o imágenes
- `403 Forbidden`: No eres dueño

---

### 9. Pausar Experiencia

Cambia el status a `paused` (no visible para viajeros).

**Endpoint:** `POST /experiences/:id/pause`

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "status": "paused",
  ...
}
```

---

## Gestión de Variantes

### 10. Agregar Variante

**Endpoint:** `POST /experiences/:id/variants`

**Body:**
```json
{
  "name": "Tour Privado",
  "description": "Experiencia exclusiva con guía privado",
  "price": 350000,
  "maxPeople": 6,
  "includes": ["Guía privado", "Transporte", "Entradas"],
  "excludes": ["Comidas"],
  "isDefault": false
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "experienceId": "uuid",
  "name": "Tour Privado",
  ...
}
```

---

### 11. Actualizar Variante

**Endpoint:** `PATCH /experiences/variants/:variantId`

**Body:** (campos opcionales)
```json
{
  "name": "Tour Privado Premium",
  "price": 400000
}
```

---

### 12. Eliminar Variante

**Endpoint:** `DELETE /experiences/variants/:variantId`

**Respuesta exitosa (204):** No content

---

## Gestión de Media

### 13. Agregar Foto/Video

**Endpoint:** `POST /experiences/:id/media`

**Body:**
```json
{
  "type": "image",
  "url": "https://cdn.example.com/cartagena-tour-1.jpg",
  "thumbnailUrl": "https://cdn.example.com/thumb-cartagena-tour-1.jpg",
  "caption": "Vista panorámica de la ciudad amurallada",
  "displayOrder": 0
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "experienceId": "uuid",
  "type": "image",
  "url": "https://...",
  ...
}
```

---

### 14. Eliminar Media

**Endpoint:** `DELETE /experiences/media/:mediaId`

**Respuesta exitosa (204):** No content

---

## Gestión de Itinerario

### 15. Agregar Día al Itinerario

**Endpoint:** `POST /experiences/:id/itinerary`

**Body:**
```json
{
  "dayNumber": 1,
  "title": "Centro Histórico de Cartagena",
  "description": "Recorrido por las principales plazas y monumentos...",
  "location": "Plaza de Bolívar",
  "meals": ["breakfast", "lunch"]
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "experienceId": "uuid",
  "dayNumber": 1,
  ...
}
```

---

### 16. Actualizar Itinerario

**Endpoint:** `PATCH /experiences/itinerary/:itineraryId`

**Body:** (campos opcionales)
```json
{
  "title": "Nuevo título del día",
  "description": "Nueva descripción"
}
```

---

### 17. Eliminar Día del Itinerario

**Endpoint:** `DELETE /experiences/itinerary/:itineraryId`

**Respuesta exitosa (204):** No content

---

## Ejemplos de Uso

### JavaScript (Fetch)

```javascript
// Listar experiencias
const getExperiences = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  const response = await fetch(`http://localhost:4000/api/v1/experiences?${queryString}`);
  return response.json();
};

// Buscar por ciudad
const experiences = await getExperiences({
  country: 'CO',
  city: 'Cartagena',
  category: 'tour',
  page: 1,
  limit: 20,
});

// Obtener experiencia por slug
const getBySlug = async (slug) => {
  const response = await fetch(`http://localhost:4000/api/v1/experiences/slug/${slug}`);
  return response.json();
};

// Crear experiencia (requiere autenticación)
const createExperience = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/experiences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

### cURL

```bash
# Listar experiencias
curl -X GET "http://localhost:4000/api/v1/experiences?country=CO&city=Cartagena&page=1"

# Obtener por slug
curl -X GET http://localhost:4000/api/v1/experiences/slug/tour-cartagena

# Crear experiencia
curl -X POST http://localhost:4000/api/v1/experiences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tour por Cartagena",
    "description": "...",
    "category": "tour",
    "location": {
      "country": "CO",
      "city": "Cartagena"
    },
    "priceFrom": 150000,
    "currency": "COP"
  }'
```

---

## Estados de Experiencia

- `draft` - Borrador (no visible)
- `published` - Publicado (visible para todos)
- `paused` - Pausado (no visible temporalmente)
- `archived` - Archivado

---

## Notas Importantes

1. **Slugs únicos:** Se generan automáticamente desde el título
2. **Publicación:** Requiere al menos 1 variante y 1 imagen
3. **Precio mínimo:** Se actualiza automáticamente al agregar variantes
4. **Búsqueda:** Full-text search en título y descripción
5. **Filtros:** Todos los filtros son opcionales y combinables
6. **Paginación:** Máximo 100 items por página

---

**Última actualización:** 2025-11-09
