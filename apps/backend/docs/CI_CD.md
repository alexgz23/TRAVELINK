# CI/CD Pipeline - Continuous Integration & Deployment

## Overview

Viajero Conectado backend utiliza **GitHub Actions** para automatizar el ciclo completo de desarrollo, pruebas y despliegue. El pipeline está diseñado para garantizar calidad de código, ejecutar pruebas exhaustivas y desplegar de forma segura a diferentes entornos.

## Arquitectura CI/CD

```
┌─────────────────────────────────────────────────────────────┐
│                     DEVELOPER WORKFLOW                       │
├─────────────────────────────────────────────────────────────┤
│  Push/PR  →  CI Pipeline  →  Tests  →  Build  →  Deploy    │
└─────────────────────────────────────────────────────────────┘

Fase 1: Continuous Integration (.github/workflows/ci.yml)
├── Lint & Code Quality
├── Unit Tests (Coverage)
├── E2E Tests (PostgreSQL, MongoDB, Redis)
├── Build Verification
├── Security Audit
└── Dependency Review

Fase 2: Continuous Deployment (.github/workflows/deploy.yml)
├── Build Docker Image
├── Push to Container Registry (GHCR)
├── Deploy to Staging
├── Deploy to Production
└── Rollback (Manual)
```

## Continuous Integration (CI)

### Workflow: `.github/workflows/ci.yml`

El workflow de CI se ejecuta automáticamente en:
- Push a ramas: `main`, `develop`, `feature/**`, `fix/**`
- Pull requests a: `main`, `develop`

### Jobs del CI Pipeline

#### 1. Lint & Code Quality
```yaml
runs-on: ubuntu-latest
steps:
  - ESLint (--fix)
  - Prettier (--check)
```

**Propósito**: Garantizar código consistente y seguir estándares de estilo.

**Scripts utilizados**:
- `pnpm run lint` - ESLint con autofix
- `pnpm run format:check` - Prettier sin modificar archivos

**Fallos comunes**:
- Variables no utilizadas
- Imports incorrectos
- Formato de código inconsistente

---

#### 2. Unit Tests
```yaml
runs-on: ubuntu-latest
steps:
  - Run unit tests with coverage
  - Upload coverage to Codecov
```

**Propósito**: Validar la lógica de negocio y componentes individuales.

**Scripts utilizados**:
- `pnpm run test:cov` - Jest con cobertura

**Cobertura de código**:
- Los resultados se suben a **Codecov** automáticamente
- Se genera reporte LCOV en `coverage/lcov.info`
- Badge de cobertura disponible en README

**Configuración de Jest**:
```json
{
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

---

#### 3. E2E Tests
```yaml
runs-on: ubuntu-latest
services:
  postgres: postgres:16-alpine
  mongodb: mongo:7-jammy
  redis: redis:7-alpine
steps:
  - Run E2E tests against real databases
```

**Propósito**: Validar flujos completos de la aplicación con bases de datos reales.

**Scripts utilizados**:
- `pnpm run test:e2e` - Jest E2E con Supertest

**Service Containers**:
El workflow levanta contenedores de:
- **PostgreSQL** (puerto 5432) - Base de datos relacional
- **MongoDB** (puerto 27017) - Base de datos NoSQL
- **Redis** (puerto 6379) - Caché y colas

**Variables de entorno**:
```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
MONGODB_URI=mongodb://localhost:27017/viajero-conectado-test
REDIS_HOST=localhost
JWT_SECRET=test-secret-key
```

**Tests E2E incluyen**:
- Authentication (login, registro, refresh tokens)
- CRUD operations (usuarios, experiencias, bookings)
- WebSocket connections (chat, notificaciones)
- File uploads
- Error handling

---

#### 4. Build Verification
```yaml
runs-on: ubuntu-latest
steps:
  - Build backend
  - Type checking
```

**Propósito**: Verificar que el código compila sin errores de TypeScript.

**Scripts utilizados**:
- `pnpm run build` - Compilar con NestJS CLI
- `pnpm run type-check` - TypeScript compiler (`tsc --noEmit`)

**Fallos comunes**:
- Errores de tipos
- Imports faltantes
- Configuración incorrecta de tsconfig

---

#### 5. Security Audit
```yaml
runs-on: ubuntu-latest
steps:
  - Run pnpm audit
```

**Propósito**: Detectar vulnerabilidades en dependencias.

**Scripts utilizados**:
- `pnpm audit --audit-level moderate`

**Configuración**:
- `continue-on-error: true` - No bloquea el pipeline
- Nivel mínimo: `moderate`
- Se recomienda revisar y actualizar dependencias regularmente

---

#### 6. Dependency Review (Solo PRs)
```yaml
runs-on: ubuntu-latest
if: github.event_name == 'pull_request'
steps:
  - Dependency Review Action
```

**Propósito**: Revisar nuevas dependencias en pull requests.

**Configuración**:
- `fail-on-severity: moderate` - Falla si hay vulnerabilidades moderadas o altas
- Solo se ejecuta en PRs

---

### Caching y Optimización

El pipeline utiliza caché de pnpm para acelerar instalaciones:

```yaml
- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

**Beneficios**:
- ⚡ Instalaciones 3-5x más rápidas
- 💰 Reduce uso de ancho de banda
- ⏱️ Pipeline completo en ~5-7 minutos

---

## Continuous Deployment (CD)

### Workflow: `.github/workflows/deploy.yml`

El workflow de CD se ejecuta en:
- Push a `main` (auto-deploy staging)
- Tags `v*.*.*` (auto-deploy production)
- Manual trigger con `workflow_dispatch`

### Jobs del CD Pipeline

#### 1. Build & Push Docker Image

**Container Registry**: GitHub Container Registry (GHCR)

```yaml
registry: ghcr.io
image: ghcr.io/<owner>/travelink/backend
```

**Tagging Strategy**:
- `latest` - Última versión de main
- `main` - Builds de rama main
- `v1.2.3` - Versiones semánticas
- `v1.2` - Major.minor
- `main-sha123abc` - SHA commit

**Multi-platform Builds**:
- `linux/amd64` - Servidores x86_64

**Build Caching**:
```yaml
cache-from: type=registry,ref=ghcr.io/.../backend:buildcache
cache-to: type=registry,ref=ghcr.io/.../backend:buildcache,mode=max
```

---

#### 2. Deploy to Staging

**Trigger**: Push a `develop` o manual

**Environment**: `staging`
- URL: https://staging.viajeroconectado.com
- Database: Staging PostgreSQL/MongoDB
- Redis: Staging instance

**Steps**:
1. Pull latest Docker image
2. Run database migrations
3. Update container with new image
4. Health check verification
5. Notify team (Slack/Discord)

**Ejemplo de deployment**:
```bash
# SSH deployment
ssh deploy@staging.viajeroconectado.com << 'EOF'
  cd /opt/viajero-conectado
  docker-compose pull backend
  docker-compose up -d backend
  docker-compose exec backend pnpm run migration:run
EOF
```

---

#### 3. Deploy to Production

**Trigger**: Tags `v*.*.*` o manual

**Environment**: `production`
- URL: https://viajeroconectado.com
- Database: Production PostgreSQL/MongoDB
- Redis: Production cluster

**Manual Approval**:
- Requiere aprobación manual en GitHub
- Configurado en Settings → Environments → production

**Steps**:
1. Pull versioned Docker image
2. Run database migrations (backup first!)
3. Blue-green deployment or rolling update
4. Health check verification
5. Create Sentry release
6. Notify team and stakeholders

**Zero-downtime deployment**:
```bash
# Blue-green deployment example
docker-compose -f docker-compose.blue.yml up -d
# Wait for health check
docker-compose -f docker-compose.green.yml down
```

---

#### 4. Rollback (Manual)

**Trigger**: Manual con `workflow_dispatch`

**Pasos para rollback**:
1. Identificar versión anterior estable
2. Ejecutar workflow de rollback
3. Revertir a imagen anterior
4. Verificar funcionalidad
5. Investigar causa del problema

**Ejemplo**:
```bash
# Rollback to previous image
docker-compose pull backend:v1.2.2
docker-compose up -d backend
```

---

## Docker Configuration

### Multi-stage Dockerfile

**Location**: `apps/backend/Dockerfile`

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
- Install pnpm
- Copy package files
- Install dependencies (all)
- Copy source code
- Build application

# Stage 2: Production
FROM node:20-alpine AS production
- Install pnpm
- Copy package files
- Install production dependencies only
- Copy built files from builder
- Create non-root user
- Set up health check
- Expose port 4000
```

**Optimizaciones**:
- ✅ Multi-stage build (reduce tamaño final ~70%)
- ✅ Alpine Linux (imagen base ligera)
- ✅ Layer caching (compilaciones rápidas)
- ✅ Non-root user (seguridad)
- ✅ Health checks (monitoreo)

**Build sizes**:
- Builder stage: ~500MB
- Production stage: ~180MB

---

### Docker Compose

#### Development: `docker-compose.dev.yml`

**Propósito**: Desarrollo local con hot reload

**Services**:
- PostgreSQL 16
- MongoDB 7
- Redis 7

**Usage**:
```bash
# Start databases only
docker-compose -f docker-compose.dev.yml up -d

# Run backend locally
cd apps/backend
pnpm run dev
```

---

#### Production: `docker-compose.yml`

**Propósito**: Orquestación completa en producción

**Services**:
- PostgreSQL 16 (persistent data)
- MongoDB 7 (persistent data)
- Redis 7 (persistent data)
- Typesense (search engine)
- MinIO (S3-compatible storage)
- Backend (NestJS API)
- Web (Next.js - future)
- Mailhog (email testing)

**Volumes**:
```yaml
volumes:
  postgres_data:
  mongodb_data:
  redis_data:
  typesense_data:
  minio_data:
```

**Networks**:
```yaml
networks:
  viajero_network:
    driver: bridge
```

**Usage**:
```bash
# Start full stack
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

---

## Environment Variables

### CI Environment Variables

Configuradas en GitHub Secrets:

```env
# Database
DB_USERNAME=postgres
DB_PASSWORD=<secret>
DB_NAME=viajero_conectado

# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=<secret>
MONGO_DB=viajero_conectado_social

# Redis
REDIS_PASSWORD=<secret>
REDIS_DB=0

# JWT
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>

# AWS/S3
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_S3_BUCKET=viajero-conectado

# External Services
TYPESENSE_API_KEY=<secret>
SENTRY_DSN=<secret>

# Deployment
DEPLOY_SSH_KEY=<secret>
DEPLOY_HOST=viajeroconectado.com
```

### Setting Secrets in GitHub

1. Ve a: `Settings → Secrets and variables → Actions`
2. Click: `New repository secret`
3. Agrega nombre y valor
4. Los secrets están encriptados y no se muestran en logs

---

## Database Migrations

### Estrategia de Migraciones

**TypeORM Migrations**:
```bash
# Generate migration from entity changes
pnpm run migration:generate -- -n MigrationName

# Create empty migration
pnpm run migration:create -- -n MigrationName

# Run migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert
```

### En CI/CD

**Pre-deployment**:
1. ✅ Backup database
2. ✅ Run migrations in transaction
3. ✅ Verify migration success
4. ❌ Auto-rollback on failure

**Ejemplo en workflow**:
```yaml
- name: Run Database Migrations
  run: |
    docker-compose exec -T backend pnpm run migration:run
```

---

## Monitoring & Notifications

### Health Checks

**Endpoint**: `GET /api/v1/health`

**Response**:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "mongodb": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

**Docker Health Check**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

---

### Sentry Integration

**Error Tracking**:
- Todos los errores se reportan a Sentry
- Releases se crean automáticamente en deployment
- Source maps para debugging

**Create Release**:
```bash
sentry-cli releases new ${{ github.ref_name }}
sentry-cli releases set-commits ${{ github.ref_name }} --auto
sentry-cli releases finalize ${{ github.ref_name }}
```

---

### Notifications (TODO)

**Integraciones planeadas**:
- 📱 Slack - Notificaciones de deployment
- 💬 Discord - Status del pipeline
- 📧 Email - Fallos críticos
- 📊 Datadog/New Relic - APM

---

## Best Practices

### 1. Commits y PRs

✅ **DO**:
- Commits pequeños y atómicos
- Mensajes descriptivos con conventional commits
- Crear PR con descripción detallada
- Solicitar code review antes de merge

❌ **DON'T**:
- Commits gigantes con muchos cambios
- Mensajes vagos ("fix", "update", "wip")
- Merge sin review
- Push directo a main

---

### 2. Testing

✅ **DO**:
- Escribir tests para nuevas features
- Mantener cobertura >70%
- Ejecutar tests localmente antes de push
- Añadir E2E tests para flujos críticos

❌ **DON'T**:
- Skip tests con `--no-verify`
- Commitear código sin tests
- Ignorar fallos de tests
- Tests con dependencias externas (usar mocks)

---

### 3. Deployment

✅ **DO**:
- Deploy a staging primero
- Verificar funcionalidad en staging
- Crear tags semánticos (v1.2.3)
- Backup database antes de migrations
- Monitorear logs post-deployment

❌ **DON'T**:
- Deploy directo a production
- Saltarse staging
- Deploy sin migrations
- Deploy sin health checks
- Ignorar errores en logs

---

### 4. Security

✅ **DO**:
- Usar secrets para credenciales
- Rotar secrets periódicamente
- Revisar auditorías de dependencias
- Mantener dependencias actualizadas
- Usar non-root user en containers

❌ **DON'T**:
- Hardcodear secrets en código
- Commitear archivos .env
- Ignorar vulnerabilidades
- Usar latest tags en producción
- Ejecutar containers como root

---

## Troubleshooting

### CI Pipeline Failures

#### Lint Errors
```bash
# Fix locally
pnpm run lint
pnpm run format

# Check before commit
pnpm run lint:check
pnpm run format:check
```

#### Test Failures
```bash
# Run tests locally
pnpm run test

# Run specific test file
pnpm run test -- auth.service.spec.ts

# Run with coverage
pnpm run test:cov

# E2E tests (start databases first)
docker-compose -f docker-compose.dev.yml up -d
pnpm run test:e2e
```

#### Build Errors
```bash
# Type checking
pnpm run type-check

# Build locally
pnpm run build

# Clear cache and retry
rm -rf dist node_modules
pnpm install
pnpm run build
```

---

### Deployment Failures

#### Image not found
```bash
# Verify image was pushed
docker pull ghcr.io/owner/travelink/backend:latest

# Check GitHub Packages
# Go to: github.com/<owner>/travelink/packages
```

#### Migration failures
```bash
# Check migration files
ls -la src/migrations/

# Run migrations manually
docker-compose exec backend pnpm run migration:run

# Revert if needed
docker-compose exec backend pnpm run migration:revert
```

#### Health check failures
```bash
# Check application logs
docker-compose logs -f backend

# Test health endpoint
curl http://localhost:4000/api/v1/health

# Check database connectivity
docker-compose exec backend node -e "console.log(process.env.DB_HOST)"
```

---

## Performance Optimization

### Pipeline Speed

**Current**:
- Lint: ~1 min
- Unit tests: ~2 min
- E2E tests: ~3 min
- Build: ~2 min
- **Total**: ~8 min

**Optimizations**:
- ✅ pnpm caching
- ✅ Parallel jobs
- ✅ Layer caching en Docker
- 🔄 Matrix strategy (future)
- 🔄 Test sharding (future)

---

### Build Size

**Current**:
- Production image: ~180MB
- Compressed: ~65MB

**Optimizations**:
- ✅ Multi-stage builds
- ✅ Alpine base image
- ✅ Production dependencies only
- 🔄 Asset optimization (future)

---

## Future Enhancements

### Short-term
- [ ] Slack/Discord notifications
- [ ] Automatic PR labeling
- [ ] Deploy previews for PRs
- [ ] Sentry release automation
- [ ] Load testing in CI

### Long-term
- [ ] Kubernetes deployment
- [ ] Auto-scaling configuration
- [ ] Multi-region deployment
- [ ] A/B testing infrastructure
- [ ] Canary deployments

---

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [NestJS Deployment](https://docs.nestjs.com/faq/deployment)

### Monitoring
- [Codecov Dashboard](https://codecov.io/)
- [Sentry Dashboard](https://sentry.io/)
- [GitHub Container Registry](https://github.com/features/packages)

---

## Support

Para problemas con CI/CD:
1. Revisa los logs del workflow en GitHub Actions
2. Verifica que todas las secrets estén configuradas
3. Ejecuta los comandos localmente para reproducir
4. Consulta esta documentación
5. Contacta al equipo DevOps

**GitHub Actions Logs**: `Actions → CI/CD → <workflow-run>`
