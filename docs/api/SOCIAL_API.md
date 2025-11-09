# API Social - Viajero Conectado

Documentación de los endpoints para red social (posts, comentarios, likes, follows).

## Base URL

```
http://localhost:4000/api/v1/social
```

---

## Endpoints de Posts

### 1. Crear Post

**Endpoint:** `POST /social/posts`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "content": "¡Increíble experiencia en Cartagena! 🌴",
  "mediaUrls": [
    "https://cdn.example.com/photo1.jpg",
    "https://cdn.example.com/photo2.jpg"
  ],
  "tags": ["cartagena", "tour", "playa"],
  "locationName": "Cartagena, Colombia",
  "locationLat": 10.3910485,
  "locationLng": -75.4794257,
  "experienceId": "uuid-experiencia",
  "bookingId": "uuid-reserva",
  "isPublic": true
}
```

**Respuesta exitosa (201):**
```json
{
  "_id": "mongodb-id",
  "userId": "uuid",
  "content": "¡Increíble experiencia en Cartagena! 🌴",
  "mediaUrls": [
    "https://cdn.example.com/photo1.jpg",
    "https://cdn.example.com/photo2.jpg"
  ],
  "tags": ["cartagena", "tour", "playa"],
  "locationName": "Cartagena, Colombia",
  "locationLat": 10.3910485,
  "locationLng": -75.4794257,
  "experienceId": "uuid-experiencia",
  "bookingId": "uuid-reserva",
  "likesCount": 0,
  "commentsCount": 0,
  "sharesCount": 0,
  "isPublic": true,
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

---

### 2. Obtener Posts Públicos

**Endpoint:** `GET /social/posts`

**Query Parameters:**
- `userId` (string, opcional): Filtrar posts de un usuario específico
- `experienceId` (string, opcional): Filtrar posts relacionados a una experiencia
- `tag` (string, opcional): Filtrar por etiqueta
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Ejemplo:**
```
GET /social/posts?tag=cartagena&page=1&limit=20
```

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "_id": "mongodb-id",
      "userId": "uuid",
      "content": "¡Increíble experiencia en Cartagena! 🌴",
      "mediaUrls": [...],
      "tags": ["cartagena", "tour", "playa"],
      "likesCount": 25,
      "commentsCount": 10,
      "createdAt": "2025-11-09T10:00:00.000Z",
      "updatedAt": "2025-11-09T10:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

### 3. Obtener Mi Feed

Feed personalizado con posts de usuarios que sigo.

**Endpoint:** `GET /social/posts/feed`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Ejemplo:**
```
GET /social/posts/feed?page=1&limit=20
```

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "_id": "mongodb-id",
      "userId": "uuid",
      "content": "Post de alguien que sigo...",
      "mediaUrls": [...],
      "likesCount": 15,
      "commentsCount": 5,
      "createdAt": "2025-11-09T10:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### 4. Obtener Post por ID

**Endpoint:** `GET /social/posts/:id`

**Respuesta exitosa (200):**
```json
{
  "_id": "mongodb-id",
  "userId": "uuid",
  "content": "¡Increíble experiencia en Cartagena! 🌴",
  "mediaUrls": [...],
  "tags": ["cartagena", "tour", "playa"],
  "locationName": "Cartagena, Colombia",
  "locationLat": 10.3910485,
  "locationLng": -75.4794257,
  "experienceId": "uuid",
  "bookingId": "uuid",
  "likesCount": 25,
  "commentsCount": 10,
  "sharesCount": 2,
  "isPublic": true,
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

**Errores:**
- `404 Not Found`: Post no encontrado

---

### 5. Actualizar Post

**Endpoint:** `PATCH /social/posts/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:** (campos opcionales)
```json
{
  "content": "Contenido actualizado",
  "tags": ["nuevotag"]
}
```

**Respuesta exitosa (200):**
```json
{
  "_id": "mongodb-id",
  "content": "Contenido actualizado",
  ...
}
```

**Errores:**
- `403 Forbidden`: No eres dueño del post

---

### 6. Eliminar Post

**Endpoint:** `DELETE /social/posts/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (204):** No content

**Errores:**
- `403 Forbidden`: No eres dueño del post

---

## Endpoints de Comentarios

### 7. Agregar Comentario

**Endpoint:** `POST /social/posts/:id/comments`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "content": "¡Qué bonito lugar!",
  "parentCommentId": "mongodb-id-opcional"
}
```

**Respuesta exitosa (201):**
```json
{
  "_id": "mongodb-id",
  "postId": "mongodb-post-id",
  "userId": "uuid",
  "content": "¡Qué bonito lugar!",
  "parentCommentId": null,
  "likesCount": 0,
  "createdAt": "2025-11-09T10:30:00.000Z",
  "updatedAt": "2025-11-09T10:30:00.000Z"
}
```

---

### 8. Obtener Comentarios de un Post

**Endpoint:** `GET /social/posts/:id/comments`

**Query Parameters:**
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Ejemplo:**
```
GET /social/posts/mongodb-post-id/comments?page=1&limit=20
```

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "_id": "mongodb-id",
      "postId": "mongodb-post-id",
      "userId": "uuid",
      "content": "¡Qué bonito lugar!",
      "likesCount": 5,
      "createdAt": "2025-11-09T10:30:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 9. Eliminar Comentario

**Endpoint:** `DELETE /social/posts/comments/:commentId`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (204):** No content

**Errores:**
- `403 Forbidden`: No eres dueño del comentario
- `404 Not Found`: Comentario no encontrado

---

## Endpoints de Likes

### 10. Dar Like a un Post

**Endpoint:** `POST /social/posts/:id/like`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (201):**
```json
{
  "_id": "mongodb-id",
  "userId": "uuid",
  "likeableId": "mongodb-post-id",
  "likeableType": "Post",
  "createdAt": "2025-11-09T11:00:00.000Z",
  "updatedAt": "2025-11-09T11:00:00.000Z"
}
```

**Nota:** Si ya existe el like, retorna el mismo sin crear duplicado.

---

### 11. Quitar Like de un Post

**Endpoint:** `DELETE /social/posts/:id/like`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (204):** No content

**Errores:**
- `404 Not Found`: No has dado like a este post

---

### 12. Obtener Likes de un Post

**Endpoint:** `GET /social/posts/:id/likes`

**Query Parameters:**
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "_id": "mongodb-id",
      "userId": "uuid",
      "likeableId": "mongodb-post-id",
      "likeableType": "Post",
      "createdAt": "2025-11-09T11:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

### 13. Dar Like a un Comentario

**Endpoint:** `POST /social/posts/comments/:commentId/like`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (201):** Similar al like de post

---

### 14. Quitar Like de un Comentario

**Endpoint:** `DELETE /social/posts/comments/:commentId/like`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (204):** No content

---

## Endpoints de Follows

### 15. Seguir a un Usuario

**Endpoint:** `POST /social/follows/:userId`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (201):**
```json
{
  "_id": "mongodb-id",
  "followerId": "uuid-mi-usuario",
  "followingId": "uuid-usuario-a-seguir",
  "createdAt": "2025-11-09T12:00:00.000Z",
  "updatedAt": "2025-11-09T12:00:00.000Z"
}
```

**Errores:**
- `400 Bad Request`: No puedes seguirte a ti mismo

---

### 16. Dejar de Seguir

**Endpoint:** `DELETE /social/follows/:userId`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (204):** No content

**Errores:**
- `404 Not Found`: No estás siguiendo a este usuario

---

### 17. Obtener Usuarios que Sigo

**Endpoint:** `GET /social/follows/following`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "_id": "mongodb-id",
      "followerId": "uuid-mi-usuario",
      "followingId": "uuid-usuario-seguido",
      "createdAt": "2025-11-09T12:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### 18. Obtener Mis Seguidores

**Endpoint:** `GET /social/follows/followers`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "_id": "mongodb-id",
      "followerId": "uuid-seguidor",
      "followingId": "uuid-mi-usuario",
      "createdAt": "2025-11-09T12:00:00.000Z"
    }
  ],
  "total": 125,
  "page": 1,
  "limit": 20,
  "totalPages": 7
}
```

---

### 19. Obtener Contadores

**Endpoint:** `GET /social/follows/counts`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "following": 50,
  "followers": 125
}
```

---

### 20. Verificar si Sigo a un Usuario

**Endpoint:** `GET /social/follows/is-following/:userId`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
true
```

o

```json
false
```

---

## Ejemplos de Uso

### JavaScript (Fetch)

```javascript
// Crear post
const createPost = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/social/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

const post = await createPost({
  content: '¡Increíble experiencia en Cartagena! 🌴',
  mediaUrls: ['https://cdn.example.com/photo1.jpg'],
  tags: ['cartagena', 'tour'],
  locationName: 'Cartagena, Colombia',
});

// Obtener feed
const getFeed = async (page = 1) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:4000/api/v1/social/posts/feed?page=${page}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.json();
};

const feed = await getFeed(1);

// Dar like
const likePost = async (postId) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:4000/api/v1/social/posts/${postId}/like`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.json();
};

await likePost('mongodb-post-id');

// Seguir usuario
const followUser = async (userId) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:4000/api/v1/social/follows/${userId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.json();
};

await followUser('uuid-usuario');

// Agregar comentario
const addComment = async (postId, content) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:4000/api/v1/social/posts/${postId}/comments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }
  );
  return response.json();
};

await addComment('mongodb-post-id', '¡Qué bonito!');
```

### cURL

```bash
# Crear post
curl -X POST http://localhost:4000/api/v1/social/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "¡Increíble experiencia en Cartagena! 🌴",
    "mediaUrls": ["https://cdn.example.com/photo1.jpg"],
    "tags": ["cartagena", "tour"],
    "locationName": "Cartagena, Colombia"
  }'

# Obtener feed
curl -X GET "http://localhost:4000/api/v1/social/posts/feed?page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Dar like a post
curl -X POST http://localhost:4000/api/v1/social/posts/mongodb-post-id/like \
  -H "Authorization: Bearer YOUR_TOKEN"

# Seguir usuario
curl -X POST http://localhost:4000/api/v1/social/follows/uuid-usuario \
  -H "Authorization: Bearer YOUR_TOKEN"

# Agregar comentario
curl -X POST http://localhost:4000/api/v1/social/posts/mongodb-post-id/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "¡Qué bonito lugar!"
  }'

# Obtener seguidores
curl -X GET "http://localhost:4000/api/v1/social/follows/followers?page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Características del Módulo Social

### Posts
- Publicar contenido con texto, fotos y videos
- Etiquetar ubicaciones y experiencias
- Tags/hashtags para categorización
- Contador de likes, comentarios y compartidos
- Posts públicos y privados

### Comentarios
- Comentarios en posts
- Comentarios anidados (respuestas)
- Likes en comentarios

### Likes
- Likes en posts y comentarios
- Contador automático
- Sistema anti-duplicados

### Sistema de Follows
- Seguir/dejar de seguir usuarios
- Feed personalizado basado en seguidos
- Contadores de seguidores/seguidos
- Verificar estado de follow

---

## Notas Importantes

1. **Base de datos:** MongoDB - Ideal para datos sociales flexibles y en tiempo real
2. **IDs:** MongoDB ObjectId para posts/comentarios/likes, UUID para usuarios
3. **Contadores:** Se actualizan automáticamente al crear/eliminar likes y comentarios
4. **Feed:** Optimizado con índices en MongoDB para queries rápidas
5. **Privacidad:** Posts pueden ser públicos o privados
6. **Indices:** Optimizados para búsquedas por usuario, tags, fecha, experiencia

---

**Última actualización:** 2025-11-09
