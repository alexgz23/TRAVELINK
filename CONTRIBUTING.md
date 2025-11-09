# Contribuyendo a Viajero Conectado

Gracias por tu interés en contribuir a Viajero Conectado. Este documento proporciona guías y mejores prácticas para contribuir al proyecto.

## Código de Conducta

Este proyecto se rige por un código de conducta. Al participar, se espera que respetes este código.

## Cómo Contribuir

### Reportar Bugs

Si encuentras un bug:

1. Verifica que no exista ya un issue similar
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (OS, navegador, versión)

### Sugerir Features

Para sugerir nuevas funcionalidades:

1. Verifica que no exista ya una sugerencia similar
2. Crea un issue con tag `enhancement`
3. Describe claramente:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas

### Pull Requests

1. **Fork** el repositorio
2. **Crea un branch** desde `develop`:
   ```bash
   git checkout -b feature/mi-nueva-feature
   ```
3. **Haz tus cambios** siguiendo las guías de estilo
4. **Escribe tests** para tu código
5. **Ejecuta los tests** y asegura que pasen:
   ```bash
   pnpm test
   ```
6. **Commitea** con mensajes claros (ver Convenciones de Commits)
7. **Push** tu branch:
   ```bash
   git push origin feature/mi-nueva-feature
   ```
8. **Abre un Pull Request** contra `develop`

## Guías de Estilo

### TypeScript

- Usa TypeScript estricto
- Define tipos explícitos
- Evita `any`, usa `unknown` si es necesario
- Documenta funciones públicas con JSDoc

```typescript
/**
 * Crea una nueva reserva
 * @param userId - ID del usuario
 * @param experienceId - ID de la experiencia
 * @returns Promise con la reserva creada
 */
async createBooking(userId: string, experienceId: string): Promise<Booking> {
  // ...
}
```

### React/Next.js

- Usa functional components con hooks
- Nombra componentes en PascalCase
- Archivos de componentes: `MyComponent.tsx`
- Usa Server Components por defecto (Next.js 14)
- Client Components solo cuando sea necesario

```tsx
// Server Component (default)
export default function ProductPage() {
  return <div>...</div>;
}

// Client Component
'use client';
export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### NestJS

- Un módulo por feature
- Controllers solo para routing
- Lógica en Services
- DTOs con class-validator
- Guards para autenticación/autorización

```typescript
// DTO con validación
export class CreateBookingDto {
  @IsUUID()
  experienceId: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  numAdults: number;
}

// Service
@Injectable()
export class BookingsService {
  async create(createDto: CreateBookingDto): Promise<Booking> {
    // lógica de negocio
  }
}

// Controller
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createDto: CreateBookingDto) {
    return this.bookingsService.create(createDto);
  }
}
```

### CSS/Tailwind

- Usa clases de Tailwind preferentemente
- Para estilos complejos, usa CSS Modules
- Responsive-first: mobile → desktop
- Usa las variables de tema definidas

```tsx
// Bueno
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">

// Evitar inline styles
<div style={{ display: 'flex', padding: '24px' }}>
```

### Bases de Datos

#### Migraciones (TypeORM)

```bash
# Crear migración
pnpm run migration:create -- NombreMigracion

# Ejecutar migraciones
pnpm run migration:run

# Revertir
pnpm run migration:revert
```

#### Naming Conventions

- Tablas: snake_case plural (`users`, `booking_travelers`)
- Columnas: snake_case (`first_name`, `created_at`)
- Índices: `idx_table_column` (`idx_users_email`)
- Foreign Keys: `fk_table_column` (`fk_bookings_user_id`)

## Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- `feat`: Nueva funcionalidad
- `fix`: Bug fix
- `docs`: Cambios en documentación
- `style`: Formateo, punto y coma faltante, etc.
- `refactor`: Refactorización de código
- `perf`: Mejoras de performance
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
feat(bookings): add cancellation flow

Implements the booking cancellation feature with refund calculation
based on cancellation policy.

Closes #123

---

fix(auth): correct token expiration validation

The JWT expiration was not being properly validated in refresh flow.

Fixes #456

---

docs(readme): update installation instructions

---

refactor(users): extract profile logic to separate service
```

## Testing

### Cobertura Mínima

- **Unit tests:** 80%+
- **Integration tests:** Para flujos críticos
- **E2E tests:** Para user journeys principales

### Estructura de Tests

```typescript
// ejemplo.spec.ts
describe('BookingsService', () => {
  let service: BookingsService;
  let repository: Repository<Booking>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BookingsService, /* mocks */],
    }).compile();

    service = module.get(BookingsService);
  });

  describe('create', () => {
    it('should create a booking successfully', async () => {
      // Arrange
      const dto = { /* ... */ };

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('pending');
    });

    it('should throw if experience not found', async () => {
      // ...
    });
  });
});
```

## Revisión de Código

Los Pull Requests serán revisados considerando:

1. **Funcionalidad:** ¿Hace lo que debe hacer?
2. **Tests:** ¿Tiene tests adecuados?
3. **Performance:** ¿Es eficiente?
4. **Seguridad:** ¿Introduce vulnerabilidades?
5. **Estilo:** ¿Sigue las guías de estilo?
6. **Documentación:** ¿Está documentado?

## Estructura de Branches

```
main           # Producción (protegida)
├── develop    # Desarrollo (protegida)
    ├── feature/nombre-feature
    ├── fix/nombre-bug
    └── hotfix/nombre-hotfix
```

### Flujo de Trabajo

1. Desarrollar en `feature/` o `fix/` desde `develop`
2. PR a `develop` para revisión
3. Merge a `develop` tras aprobación
4. Release: `develop` → `main`

## Comunicación

- **GitHub Issues:** Para bugs y features
- **Pull Requests:** Para revisión de código
- **Discussions:** Para preguntas y discusiones
- **Slack:** Para comunicación en tiempo real (interno)

## Recursos

- [Documentación técnica](./docs/)
- [Arquitectura](./docs/architecture/ARCHITECTURE.md)
- [Stack tecnológico](./TECH_STACK.md)
- [API Docs](http://localhost:4000/api/docs)

---

¡Gracias por contribuir a Viajero Conectado! 🚀
