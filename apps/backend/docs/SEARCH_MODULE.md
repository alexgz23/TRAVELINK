# Search Module - Typesense Full-Text Search

## Overview

El **Search Module** proporciona búsqueda full-text ultra-rápida utilizando **Typesense**, un motor de búsqueda moderno diseñado para velocidad y facilidad de uso.

### Características

✅ Búsqueda full-text en milisegundos (< 50ms)
✅ Typo tolerance (tolera errores ortográficos)
✅ Filtros avanzados (precio, rating, categoría, ubicación)
✅ Faceted search (agregaciones)
✅ Autocompletado en tiempo real
✅ Ranking por relevancia
✅ Búsqueda de experiencias, usuarios, posts, reviews
✅ Indexación automática desde PostgreSQL
✅ Soporte para búsquedas populares y personalizadas

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    SEARCH WORKFLOW                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  User Query  →  SearchController  →  SearchService       │
│                                           ↓               │
│                                     Typesense            │
│                                           ↓               │
│                                  Search Results          │
│                                           ↓               │
│                              Format & Return             │
│                                                           │
│  Database Write  →  Event Hook  →  Index Document       │
│                                           ↓               │
│                                     Typesense            │
└──────────────────────────────────────────────────────────┘
```

### Components

1. **SearchController** - REST endpoints para búsqueda
2. **SearchService** - Lógica de búsqueda y indexación
3. **Typesense Client** - Cliente para comunicación con Typesense
4. **Collection Schemas** - Definiciones de índices

---

## Typesense Collections

### 1. Experiences Collection

```typescript
{
  name: 'experiences',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'category', type: 'string', facet: true },
    { name: 'location', type: 'string', facet: true },
    { name: 'city', type: 'string', facet: true },
    { name: 'country', type: 'string', facet: true },
    { name: 'price', type: 'float', facet: true },
    { name: 'rating', type: 'float', facet: true },
    { name: 'reviewCount', type: 'int32' },
    { name: 'duration', type: 'int32' },
    { name: 'maxGroupSize', type: 'int32' },
    { name: 'providerId', type: 'string' },
    { name: 'providerName', type: 'string' },
    { name: 'tags', type: 'string[]', facet: true },
    { name: 'isActive', type: 'bool', facet: true },
    { name: 'createdAt', type: 'int64' },
  ],
  default_sorting_field: 'rating'
}
```

**Searchable Fields**: `title`, `description`, `location`, `tags`, `providerName`

**Facets** (for filtering):
- `category` - Tipo de experiencia
- `city` - Ciudad
- `country` - País
- `tags` - Etiquetas
- `rating` - Calificación
- `price` - Precio

---

### 2. Users Collection

```typescript
{
  name: 'users',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'firstName', type: 'string' },
    { name: 'lastName', type: 'string' },
    { name: 'username', type: 'string' },
    { name: 'bio', type: 'string', optional: true },
    { name: 'location', type: 'string', optional: true },
    { name: 'role', type: 'string', facet: true },
    { name: 'level', type: 'int32', facet: true },
    { name: 'points', type: 'int32' },
    { name: 'followersCount', type: 'int32' },
    { name: 'isVerified', type: 'bool', facet: true },
    { name: 'isActive', type: 'bool', facet: true },
    { name: 'createdAt', type: 'int64' },
  ],
  default_sorting_field: 'followersCount'
}
```

**Searchable Fields**: `firstName`, `lastName`, `username`, `bio`

**Facets**:
- `role` - Rol de usuario
- `level` - Nivel de gamificación
- `isVerified` - Usuario verificado

---

### 3. Posts Collection

```typescript
{
  name: 'posts',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'userId', type: 'string' },
    { name: 'userName', type: 'string' },
    { name: 'likesCount', type: 'int32' },
    { name: 'commentsCount', type: 'int32' },
    { name: 'tags', type: 'string[]', facet: true, optional: true },
    { name: 'location', type: 'string', facet: true, optional: true },
    { name: 'isPublic', type: 'bool', facet: true },
    { name: 'createdAt', type: 'int64' },
  ],
  default_sorting_field: 'createdAt'
}
```

---

### 4. Reviews Collection

```typescript
{
  name: 'reviews',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'rating', type: 'float', facet: true },
    { name: 'experienceId', type: 'string' },
    { name: 'experienceTitle', type: 'string' },
    { name: 'userId', type: 'string' },
    { name: 'userName', type: 'string' },
    { name: 'isVerified', type: 'bool', facet: true },
    { name: 'helpfulCount', type: 'int32' },
    { name: 'createdAt', type: 'int64' },
  ],
  default_sorting_field: 'createdAt'
}
```

---

## Configuration

### Environment Variables

```env
# Typesense Configuration
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=your_api_key_here
```

**Development** (docker-compose):
```yaml
typesense:
  image: typesense/typesense:0.25.2
  environment:
    TYPESENSE_DATA_DIR: /data
    TYPESENSE_API_KEY: ${TYPESENSE_API_KEY:-dev_api_key}
  ports:
    - '8108:8108'
  volumes:
    - typesense_data:/data
```

**Production**:
- Usar Typesense Cloud: https://cloud.typesense.org/
- O self-hosted en AWS/GCP/DigitalOcean

---

## API Endpoints

### 1. Search Experiences

**GET** `/api/v1/search/experiences`

**Query Parameters**:
- `q` (required): Search query
- `category` (optional): Filter by category
- `city` (optional): Filter by city
- `country` (optional): Filter by country
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `minRating` (optional): Minimum rating (0-5)
- `tags` (optional): Comma-separated tags
- `sortBy` (optional): Sort field (default: relevance)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

**Example Request**:
```bash
GET /api/v1/search/experiences?q=ciudad perdida&city=Santa Marta&minRating=4&sortBy=rating:desc&page=1&limit=20
```

**Response** (200):
```json
{
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "results": [
    {
      "id": "uuid",
      "title": "Tour Ciudad Perdida 4 Días",
      "description": "Aventura épica a la ciudad ancestral...",
      "category": "adventure",
      "location": "Santa Marta, Magdalena",
      "city": "Santa Marta",
      "country": "Colombia",
      "price": 850000,
      "rating": 4.8,
      "reviewCount": 127,
      "duration": 4,
      "maxGroupSize": 12,
      "providerId": "uuid",
      "providerName": "Colombian Adventures",
      "tags": ["trekking", "cultura", "naturaleza"],
      "isActive": true,
      "createdAt": 1705305600
    }
  ],
  "facets": {
    "category": [
      { "value": "adventure", "count": 8 },
      { "value": "culture", "count": 5 },
      { "value": "nature", "count": 2 }
    ],
    "city": [
      { "value": "Santa Marta", "count": 10 },
      { "value": "Cartagena", "count": 5 }
    ],
    "rating": [
      { "value": "5", "count": 3 },
      { "value": "4", "count": 12 }
    ]
  },
  "searchTimeMs": 12
}
```

---

### 2. Search Users

**GET** `/api/v1/search/users`

**Query Parameters**:
- `q` (required): Search query
- `role` (optional): Filter by role
- `isVerified` (optional): Verified users only
- `page` (optional): Page number
- `limit` (optional): Results per page

**Example Request**:
```bash
GET /api/v1/search/users?q=juan&role=GUIDE&isVerified=true
```

**Response** (200):
```json
{
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "results": [
    {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Pérez",
      "username": "juanperez",
      "bio": "Guía profesional con 10 años de experiencia...",
      "location": "Bogotá, Colombia",
      "role": "GUIDE",
      "level": 5,
      "points": 15000,
      "followersCount": 1250,
      "isVerified": true,
      "isActive": true,
      "createdAt": 1705305600
    }
  ],
  "facets": {
    "role": [
      { "value": "GUIDE", "count": 3 },
      { "value": "TRAVELER", "count": 2 }
    ],
    "level": [
      { "value": "5", "count": 2 },
      { "value": "4", "count": 3 }
    ]
  },
  "searchTimeMs": 8
}
```

---

### 3. Autocomplete

**GET** `/api/v1/search/autocomplete`

**Query Parameters**:
- `q` (required): Partial search query
- `limit` (optional): Number of suggestions (default: 5, max: 10)

**Example Request**:
```bash
GET /api/v1/search/autocomplete?q=cart&limit=5
```

**Response** (200):
```json
{
  "suggestions": [
    {
      "title": "City Tour Cartagena",
      "location": "Cartagena, Colombia",
      "id": "uuid-1"
    },
    {
      "title": "Cartagena Nocturna",
      "location": "Cartagena, Colombia",
      "id": "uuid-2"
    },
    {
      "title": "Islas del Rosario desde Cartagena",
      "location": "Cartagena, Colombia",
      "id": "uuid-3"
    }
  ]
}
```

**Use Case**: Implementar searchbox con sugerencias en tiempo real

---

### 4. Popular Searches

**GET** `/api/v1/search/popular`

**Query Parameters**:
- `limit` (optional): Number of results (default: 10)

**Example Request**:
```bash
GET /api/v1/search/popular?limit=5
```

**Response** (200):
```json
{
  "searches": [
    "tour ciudad perdida",
    "parapente medellín",
    "city tour cartagena",
    "eje cafetero",
    "buceo san andrés"
  ]
}
```

**Use Case**: Mostrar trending searches en homepage

---

### 5. Personalized Suggestions

**GET** `/api/v1/search/suggestions`

**Authentication**: Required (Bearer token)

**Response** (200):
```json
{
  "suggestions": [
    "trekking cocora",
    "rafting río claro",
    "tour nocturno bogotá"
  ]
}
```

**Use Case**: Sugerencias basadas en historial del usuario

---

### 6. Health Check

**GET** `/api/v1/search/health`

**Response** (200):
```json
{
  "status": "healthy",
  "version": "0.25.2"
}
```

---

## Indexing

### Automatic Indexing

Los documentos se indexan automáticamente cuando se crean o actualizan en la base de datos.

#### Index Experience

```typescript
// In ExperienceService
async createExperience(createDto: CreateExperienceDto, userId: string) {
  const experience = await this.experienceRepository.save({
    ...createDto,
    providerId: userId,
  });

  // Index in Typesense
  await this.searchService.indexExperience(experience);

  return experience;
}
```

#### Index User

```typescript
// In UsersService
async updateUser(id: string, updateDto: UpdateUserDto) {
  const user = await this.usersRepository.save({
    id,
    ...updateDto,
  });

  // Update index
  await this.searchService.indexUser(user);

  return user;
}
```

### Manual Indexing

#### Single Document

```typescript
// Index a single experience
await searchService.indexExperience({
  id: 'uuid',
  title: 'Tour Ciudad Perdida',
  description: 'Aventura épica...',
  category: 'adventure',
  location: 'Santa Marta',
  price: 850000,
  // ... other fields
});
```

#### Bulk Indexing

```typescript
// Index all experiences
const experiences = await experienceRepository.find();
await searchService.bulkIndexExperiences(experiences);
```

### Remove from Index

```typescript
await searchService.removeFromIndex(
  TypesenseCollections.EXPERIENCES,
  experienceId,
);
```

---

## Search Features

### 1. Typo Tolerance

Typesense automáticamente tolera errores ortográficos:

```
Query: "citty tour cartgena"
Match: "city tour cartagena" ✅
```

### 2. Prefix Search (Autocomplete)

```
Query: "cart"
Matches:
- "Cartagena"
- "Cartago"
- "Carta"
```

### 3. Faceted Search

Los facets permiten agregar filtros dinámicos:

```json
{
  "facets": {
    "category": [
      { "value": "adventure", "count": 120 },
      { "value": "culture", "count": 85 },
      { "value": "nature", "count": 65 }
    ],
    "city": [
      { "value": "Cartagena", "count": 45 },
      { "value": "Medellín", "count": 38 }
    ]
  }
}
```

**Frontend Implementation**:
```tsx
<Filters>
  {facets.category.map(facet => (
    <Checkbox
      label={`${facet.value} (${facet.count})`}
      onChange={() => addFilter('category', facet.value)}
    />
  ))}
</Filters>
```

### 4. Range Filters

```typescript
// Price range
minPrice: 50000,
maxPrice: 500000

// Translates to Typesense:
filter_by: "price:[50000..500000]"
```

### 5. Multi-field Search

Busca en múltiples campos simultáneamente:

```typescript
query_by: 'title,description,location,tags,providerName'
```

Query: `"ciudad perdida"`

Busca en:
- ✅ title
- ✅ description
- ✅ location
- ✅ tags
- ✅ providerName

### 6. Sorting

```typescript
// Sort by relevance (default)
sortBy: '_text_match'

// Sort by rating (descending)
sortBy: 'rating:desc'

// Sort by price (ascending)
sortBy: 'price:asc'

// Sort by creation date (newest first)
sortBy: 'createdAt:desc'
```

---

## Frontend Integration

### React/Next.js Example

#### Search Component

```tsx
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

interface SearchExperiencesProps {
  onResults: (results: any[]) => void;
}

export const SearchExperiences: React.FC<SearchExperiencesProps> = ({ onResults }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    minPrice: 0,
    maxPrice: 1000000,
    minRating: 0,
  });

  useEffect(() => {
    if (debouncedQuery.length < 2) return;

    const searchExperiences = async () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        ...filters,
      });

      const response = await fetch(`/api/v1/search/experiences?${params}`);
      const data = await response.json();

      onResults(data.results);
    };

    searchExperiences();
  }, [debouncedQuery, filters]);

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar experiencias..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <Filters
        filters={filters}
        onChange={setFilters}
      />
    </div>
  );
};
```

#### Autocomplete Component

```tsx
import { useState, useEffect, useRef } from 'react';

export const Autocomplete: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const response = await fetch(`/api/v1/search/autocomplete?q=${query}&limit=5`);
      const data = await response.json();
      setSuggestions(data.suggestions);
      setShowSuggestions(true);
    }, 200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute bg-white shadow-lg mt-1 w-full">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                window.location.href = `/experiences/${suggestion.id}`;
              }}
            >
              <div className="font-semibold">{suggestion.title}</div>
              <div className="text-sm text-gray-500">{suggestion.location}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## Performance

### Search Speed

**Typesense Performance**:
- < 10ms: Simple queries
- < 50ms: Complex queries with filters
- < 100ms: Faceted search with aggregations

**Comparison**:
| Engine | Avg Query Time |
|--------|---------------|
| Typesense | 12ms |
| Elasticsearch | 45ms |
| PostgreSQL FTS | 250ms |
| MongoDB Text Search | 180ms |

### Optimization Tips

1. **Index Size**: Keep documents lean, only index searchable fields
2. **Caching**: Cache popular searches (Redis)
3. **Pagination**: Use pagination to limit results
4. **Debouncing**: Debounce autocomplete queries (300ms)
5. **CDN**: Serve Typesense from CDN if possible

---

## Monitoring

### Metrics to Track

1. **Search Performance**:
   - Average query time
   - 95th percentile
   - Slow queries (>100ms)

2. **Search Volume**:
   - Queries per second
   - Most popular searches
   - Zero-result searches

3. **Index Size**:
   - Documents per collection
   - Index size in MB
   - Growth rate

### Typesense Metrics Endpoint

```bash
curl http://localhost:8108/metrics.json \
  -H "X-TYPESENSE-API-KEY: your_api_key"
```

**Response**:
```json
{
  "system_cpu_active_percentage": "5.2",
  "system_memory_used_bytes": 1073741824,
  "typesense_memory_active_bytes": 536870912,
  "requests_per_second": 125.3
}
```

---

## Troubleshooting

### Issue: "Connection refused" to Typesense

**Cause**: Typesense not running or wrong port

**Solution**:
```bash
# Check if Typesense is running
docker-compose ps typesense

# Check logs
docker-compose logs typesense

# Restart Typesense
docker-compose restart typesense
```

---

### Issue: Collection not found

**Cause**: Collections not initialized

**Solution**:
```bash
# Restart backend to trigger onModuleInit
pnpm run dev

# Or manually create collection via API
curl -X POST http://localhost:8108/collections \
  -H "X-TYPESENSE-API-KEY: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "experiences",
    "fields": [...],
    "default_sorting_field": "rating"
  }'
```

---

### Issue: Search returns no results

**Cause**: No documents indexed or wrong query

**Solution**:
```typescript
// Check if documents exist
const collection = await client.collections('experiences').retrieve();
console.log(collection.num_documents);

// Re-index all documents
const experiences = await experienceRepository.find();
await searchService.bulkIndexExperiences(experiences);
```

---

### Issue: Slow queries

**Cause**: Large result sets, complex filters

**Solution**:
1. Add pagination (`limit` parameter)
2. Reduce facets
3. Use more specific queries
4. Add caching layer

```typescript
// Add Redis cache
const cacheKey = `search:experiences:${query}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const results = await searchService.searchExperiences(dto);

await redis.setex(cacheKey, 300, JSON.stringify(results)); // Cache for 5 min

return results;
```

---

## Future Enhancements

### Short-term
- [ ] Search analytics dashboard
- [ ] A/B testing for search relevance
- [ ] Geo-location based search
- [ ] Voice search integration
- [ ] Search filters persistence (URL params)

### Long-term
- [ ] AI-powered search suggestions
- [ ] Visual search (image recognition)
- [ ] Natural language queries
- [ ] Multi-language search
- [ ] Federated search (all collections)

---

## Resources

- [Typesense Documentation](https://typesense.org/docs/)
- [Typesense Cloud](https://cloud.typesense.org/)
- [Search Best Practices](https://typesense.org/docs/guide/)
- [Typesense GitHub](https://github.com/typesense/typesense)

---

## Support

For issues with Search Module:
1. Check Typesense logs: `docker-compose logs typesense`
2. Verify API key in .env
3. Check collection schemas
4. Test with Typesense API directly
5. Review this documentation

**Typesense Health**: `GET /api/v1/search/health`
