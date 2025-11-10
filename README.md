# Viajero Conectado

**Red social + marketplace de viajes + ecosistema B2B**

Plataforma que conecta viajeros, agencias, hoteles, guías y conductores en un ecosistema completo de turismo.

## 📊 Estado del Proyecto

| Componente | Estado | Progreso |
|------------|--------|----------|
| **Backend Core** | ✅ Completo | 11/11 módulos (100%) |
| **API Docs** | ✅ Completo | 11/11 APIs (100%) |
| **Endpoints** | ✅ Completo | 169+ endpoints REST |
| **Swagger/OpenAPI** | ✅ Completo | Documentación interactiva |
| **Frontend Web** | ✅ Completo | Next.js 14 (100%) |
| **Testing** | ✅ Completo | Unit + E2E (100%) |
| **DevOps/CI-CD** | ✅ Completo | Docker + K8s + Actions (100%) |
| **Mobile** | ⏳ Pendiente | 0% |

**Ver detalles:** [PROJECT_SUMMARY.md](./docs/PROJECT_SUMMARY.md) | [PLATFORM_OVERVIEW.md](./docs/PLATFORM_OVERVIEW.md)

---

## Qué es Viajero Conectado

Una plataforma integral que combina:

- **Marketplace multivendedor:** Tours, paquetes, hoteles, guías, transporte y productos
- **Red social de viajes:** Feed, stories, chat, rutas compartidas, reseñas
- **Mapa y diario de viaje:** "Capturado en Ruta" - recuerdos, fotos y videos por viaje
- **Programa de puntos y niveles:** Sistema de fidelización gamificado
- **Alianzas B2B:** Agencias, hoteles, guías y conductores trabajando entre sí

### Storytelling

> "No es solo una web de tours. Es una red social de viajes donde cada historia, reseña, foto y reserva conecta viajeros, agencias y proveedores en un mismo ecosistema."

**Origen:** Nace en Colombia, aprovechando la diversidad de destinos y culturas, pero pensado desde el inicio para Latinoamérica y el mundo.

---

## Stack Tecnológico

### Backend
- **Framework:** NestJS 10+ con TypeScript
- **Bases de datos:**
  - PostgreSQL (relacional)
  - MongoDB (social)
  - Redis (caché)
- **Búsqueda:** Typesense
- **Storage:** AWS S3 / Cloudflare R2
- **Pagos:** Stripe + Mercado Pago

### Frontend Web
- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5+
- **Estilos:** TailwindCSS 3+
- **Estado:** Zustand + TanStack Query

### Mobile
- **Framework:** React Native + Expo SDK 50
- **Navegación:** Expo Router
- **Estilos:** NativeWind

### Infraestructura & DevOps
- **Containerización:** Docker + Docker Compose
- **Orquestación:** Kubernetes
- **CI/CD:** GitHub Actions
- **Reverse Proxy:** Nginx
- **Monitoring:** Prometheus + Grafana
- **Monorepo:** Turborepo
- **Package Manager:** pnpm / npm

Ver [TECH_STACK.md](./TECH_STACK.md) para más detalles.

---

## Estructura del Proyecto

```
viajero-conectado/
├── apps/
│   ├── backend/           # API NestJS
│   ├── web/               # Frontend Next.js
│   └── mobile/            # App React Native
├── packages/
│   ├── shared/            # Código compartido
│   ├── types/             # TypeScript types
│   ├── config/            # Configuraciones
│   └── ui/                # Componentes UI compartidos
├── docs/
│   ├── architecture/      # Documentación de arquitectura
│   ├── api/               # Documentación de API
│   └── user-guides/       # Guías de usuario
├── infrastructure/
│   ├── docker/            # Dockerfiles
│   └── scripts/           # Scripts de utilidad
└── .github/
    └── workflows/         # CI/CD
```

---

## Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))

### Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-org/viajero-conectado.git
cd viajero-conectado
```

2. **Ejecutar setup automático**

```bash
chmod +x infrastructure/scripts/dev-setup.sh
./infrastructure/scripts/dev-setup.sh
```

Este script:
- Verifica Docker
- Instala pnpm si es necesario
- Copia archivos `.env`
- Instala dependencias
- Levanta servicios de Docker

3. **Iniciar servicios**

```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Frontend Web
cd apps/web
pnpm dev

# Terminal 3 - Mobile (opcional)
cd apps/mobile
pnpm start
```

4. **Acceder a la aplicación**

- **Frontend Web:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api/docs
- **MinIO Console:** http://localhost:9001
- **Mailhog (emails):** http://localhost:8025

---

## Desarrollo

### Comandos Útiles

```bash
# Instalar dependencias
pnpm install

# Desarrollo (todos los proyectos)
pnpm dev

# Build (todos los proyectos)
pnpm build

# Tests
pnpm test

# Linting
pnpm lint

# Format
pnpm format

# Clean
pnpm clean
```

### Servicios Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (datos)
docker-compose down -v

# Ver estado
docker-compose ps
```

### Base de Datos

```bash
# Ejecutar migraciones
cd apps/backend
pnpm run migration:run

# Crear nueva migración
pnpm run migration:create -- nombre-migracion

# Revertir última migración
pnpm run migration:revert

# Seed de datos de prueba
pnpm run seed
```

---

## Arquitectura

El proyecto usa una arquitectura **monolito modular** para el backend, preparada para escalar a microservicios.

### Módulos Principales

1. ✅ **Auth Module** - Autenticación y autorización JWT
2. ✅ **Users Module** - Gestión de usuarios y perfiles multi-rol
3. ✅ **Experiences Module** - Tours y experiencias turísticas
4. ✅ **Bookings Module** - Sistema de reservas con estados completos
5. ✅ **Payments Module** - Procesamiento de pagos multi-método
6. ✅ **Social Module** - Red social con posts, comentarios, likes, follows
7. ✅ **Points Module** - Sistema de puntos y gamificación con 5 niveles
8. ✅ **Ads Module** - Plataforma publicitaria tipo Facebook Ads (CPC/CPM)
9. ✅ **B2B Module** - Alianzas estratégicas con contratos y comisiones
10. ✅ **Notifications Module** - Notificaciones multi-canal (In-App, Email, Push, SMS)
11. ✅ **Reviews Module** - Reseñas y calificaciones con moderación
12. ⏳ **Chat Module** - Mensajería real-time (pendiente)
13. ⏳ **Media Module** - Gestión de multimedia (pendiente)
14. ⏳ **Search Module** - Búsqueda con Typesense (pendiente)

Ver [docs/PLATFORM_OVERVIEW.md](./docs/PLATFORM_OVERVIEW.md) para documentación completa.

---

## Roles de Usuario

La plataforma soporta múltiples tipos de usuarios:

### Viajero
- Buscar y reservar experiencias
- Red social de viajes
- Sistema de puntos
- "Capturado en Ruta" (galería)

### Agencia de Viajes
- Gestión de productos turísticos
- Calendario y cupos
- Ventas B2C y B2B
- Reportes financieros

### Hotel / Alojamiento
- Inventario de habitaciones
- Tarifas dinámicas
- Reservas directas y B2B
- Reputación

### Guía Turístico
- Perfil profesional
- Agenda de servicios
- Alianzas B2B con agencias
- Reseñas

### Conductor / Transporte
- Gestión de flota
- Rutas y servicios
- Alianzas B2B
- Seguimiento

Ver documentación completa en [docs/](./docs/).

---

## Testing

```bash
# Backend (Jest)
cd apps/backend
pnpm test
pnpm test:e2e
pnpm test:cov

# Frontend Web (Vitest)
cd apps/web
pnpm test
pnpm test:ui

# Mobile (Jest)
cd apps/mobile
pnpm test
```

---

## Despliegue

### Docker Compose (Desarrollo Local)

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend frontend

# Detener
docker-compose down
```

### Docker Compose (Producción)

```bash
# Build y deploy
docker-compose -f docker-compose.prod.yml up -d

# Escalar servicios
docker-compose -f docker-compose.prod.yml up -d --scale backend=3 --scale frontend=3
```

### Kubernetes

```bash
# Aplicar todos los manifests
kubectl apply -f infrastructure/kubernetes/

# Ver estado
kubectl get pods -n viajero-conectado
kubectl get services -n viajero-conectado
kubectl get ingress -n viajero-conectado
```

Ver [infrastructure/kubernetes/README.md](infrastructure/kubernetes/README.md) para más detalles.

### CI/CD (GitHub Actions)

El proyecto incluye workflows automatizados:

- **backend-ci.yml**: Lint, test, build, Docker push
- **frontend-ci.yml**: Lint, test, E2E, build, deploy Vercel
- **deploy-production.yml**: Deployment a Kubernetes/Swarm
- **code-quality.yml**: Security scans, CodeQL, SonarCloud

### Desarrollo
- **Backend:** Railway / Render / Docker
- **Frontend:** Vercel / Netlify
- **Bases de datos:** Docker local / Railway

### Producción
- **Backend:** Kubernetes / AWS ECS / Docker Swarm
- **Frontend:** Vercel (Edge) / Netlify
- **Bases de datos:** AWS RDS + MongoDB Atlas
- **Storage:** AWS S3 + CloudFront CDN
- **Search:** Elasticsearch Cloud

Ver [apps/web/DEPLOYMENT.md](apps/web/DEPLOYMENT.md) para guías detalladas.

---

## Variables de Entorno

Cada aplicación tiene su archivo `.env.example`:

- `apps/backend/.env.example`
- `apps/web/.env.example`
- `apps/mobile/.env.example`

**Importante:** Nunca commitear archivos `.env` reales.

---

## 📊 Monitoring y Observabilidad

### Prometheus (Métricas)

Acceder a: `http://localhost:9090`

Métricas disponibles:
- HTTP request duration & total
- Database connection pool metrics
- Redis operations & cache hit/miss ratio
- Application-specific business metrics

### Grafana (Visualización)

Acceder a: `http://localhost:3001`
- **Usuario**: admin
- **Password**: admin (cambiar en producción)

Dashboards incluidos:
- **Application Overview**: Estado general del sistema
- **API Performance**: Latencias y throughput
- **Database Metrics**: Pool connections, query performance
- **System Resources**: CPU, memoria, disco, red

### Logs

```bash
# Logs de Docker Compose
docker-compose logs -f [service-name]

# Logs de Kubernetes
kubectl logs -f deployment/viajero-backend -n viajero-conectado
kubectl logs -f deployment/viajero-frontend -n viajero-conectado
```

### Health Checks

```bash
# Backend health
curl http://localhost:4000/api/v1/health

# Frontend health
curl http://localhost:3000/api/health

# Nginx status
curl http://localhost:8080/nginx_status
```

---

## Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para más detalles.

---

## Roadmap

### Fase 1 - Backend Core (✅ COMPLETADA)
- [x] Arquitectura base modular NestJS
- [x] Módulos core (Auth, Users, Experiences, Bookings, Payments)
- [x] Red social completa (posts, comentarios, likes, follows)
- [x] Sistema de puntos y gamificación (5 niveles)
- [x] Plataforma publicitaria (CPC/CPM)
- [x] Alianzas B2B con contratos y comisiones
- [x] Sistema de notificaciones multi-canal (In-App, Email, Push, SMS)
- [x] Reseñas y calificaciones con moderación
- [x] Documentación completa de 11 APIs (169+ endpoints)
- [x] Swagger/OpenAPI interactivo
- [x] Sistema de seguridad (JWT, RBAC, Rate Limiting)

### Fase 2 - Frontend & Testing (✅ COMPLETADA)
- [x] Tests unitarios backend (Jest)
- [x] Tests E2E backend
- [x] Frontend web Next.js 14 con App Router
- [x] Tests unitarios frontend (Vitest)
- [x] Tests E2E frontend (Playwright - 27 tests)
- [x] UI/UX Design System con Tailwind CSS
- [x] Integración pagos (Wompi - Card + PSE)
- [x] SEO optimizations (meta tags, sitemap, structured data)
- [x] PWA configuration
- [x] Performance optimizations (Web Vitals tracking)
- [x] DevOps: Docker, Kubernetes, CI/CD
- [ ] App móvil React Native (Pendiente)

### Fase 3 - Expansión LATAM (Q2-Q3 2025)
- [ ] Multi-idioma (ES, EN, PT)
- [ ] Multi-moneda
- [ ] B2B completo
- [ ] Apps para guías y conductores
- [ ] Analytics avanzado
- [ ] Marketing automation

### Fase 4 - Global (Q4 2025+)
- [ ] Internacionalización completa
- [ ] Machine Learning (recomendaciones)
- [ ] API pública para partners
- [ ] Programa de afiliados
- [ ] White-label para agencias

---

## Documentación

### General
- [Resumen de la Plataforma](./docs/PLATFORM_OVERVIEW.md) - Visión general completa
- [Stack Tecnológico](./TECH_STACK.md) - Tecnologías utilizadas
- [Arquitectura](./docs/architecture/ARCHITECTURE.md) - Diseño del sistema
- [Esquema de DB](./docs/architecture/DATABASE_SCHEMA.md) - Estructura de datos

### APIs Documentadas (100% Completas)

**Core APIs:**
- [Auth API](./docs/api/AUTH_API.md) - Autenticación JWT y gestión de sesiones (7 endpoints)
- [Users API](./docs/api/USERS_API.md) - Gestión de usuarios y perfiles (6 endpoints)
- [Experiences API](./docs/api/EXPERIENCES_API.md) - Marketplace de tours (17 endpoints)
- [Bookings API](./docs/api/BOOKINGS_API.md) - Sistema de reservas (13 endpoints)
- [Payments API](./docs/api/PAYMENTS_API.md) - Procesamiento de pagos (9 endpoints)

**Ecosystem APIs:**
- [Social API](./docs/api/SOCIAL_API.md) - Red social de viajes (20+ endpoints)
- [Points API](./docs/api/POINTS_API.md) - Sistema de puntos y gamificación (15+ endpoints)
- [Ads API](./docs/api/ADS_API.md) - Plataforma publicitaria CPC/CPM (23+ endpoints)
- [B2B API](./docs/api/B2B_API.md) - Alianzas estratégicas (20+ endpoints)
- [Notifications API](./docs/api/NOTIFICATIONS_API.md) - Notificaciones multi-canal (18+ endpoints)
- [Reviews API](./docs/api/REVIEWS_API.md) - Reseñas y calificaciones (16+ endpoints)

**Total:** 169+ endpoints REST documentados

**Swagger/OpenAPI:**
- [API Docs Interactivos](http://localhost:4000/api/docs) - Documentación completa con Try-it-out

---

## Licencia

Propietario - Todos los derechos reservados

---

## Contacto

- **Website:** https://viajeroconectado.com
- **Email:** contact@viajeroconectado.com
- **Twitter:** [@viajeroconectado](https://twitter.com/viajeroconectado)

---

**¡Construyamos juntos la red social de viajes más completa del mundo!** 🌍✈️
