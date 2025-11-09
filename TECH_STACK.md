# Stack Tecnológico - Viajero Conectado

## Arquitectura General

**Tipo:** Monorepo con arquitectura modular
- Backend: Microservicios modulares (monolito modular inicial, preparado para microservicios)
- Frontend Web: Server-Side Rendering (SSR) + Static Generation
- Mobile: Aplicaciones nativas multiplataforma
- Infraestructura: Containerizada con Docker

---

## Backend

### Framework Principal
- **NestJS 10+** con TypeScript
  - Arquitectura modular y escalable
  - Dependency injection nativa
  - Soporte para microservicios
  - Excelente para APIs RESTful y GraphQL
  - Decoradores y guards para autenticación/autorización

### Bases de Datos

#### Relacional (Principal)
- **PostgreSQL 15+**
  - Usuarios, autenticación
  - Reservas y transacciones
  - Inventario (tours, hoteles, servicios)
  - Sistema de puntos y niveles
  - Relaciones B2B
  - Pagos y finanzas

#### NoSQL (Contenido Social)
- **MongoDB**
  - Feed social (posts, stories)
  - Comentarios y reacciones
  - Chat y mensajería
  - Notificaciones
  - Logs y analytics

#### Caché y Sesiones
- **Redis**
  - Sesiones de usuario
  - Caché de queries frecuentes
  - Rate limiting
  - Real-time features (presencia, typing indicators)
  - Cola de trabajos (Bull Queue)

### Storage y Multimedia
- **AWS S3** o **Cloudflare R2**
  - Fotos de usuarios y "Capturado en Ruta"
  - Videos (stories, reseñas)
  - Documentos (vouchers, PDFs)
  - Assets estáticos

- **Cloudinary** (alternativa/complemento)
  - Optimización automática de imágenes
  - Transformaciones on-the-fly
  - CDN integrado

### Búsqueda
- **Elasticsearch** o **Typesense**
  - Búsqueda de destinos, experiencias
  - Filtros avanzados
  - Autocompletado
  - Búsqueda en contenido social

### Pagos
- **Stripe**
  - Pagos internacionales
  - Split payments (marketplace)
  - Reembolsos automatizados
  - Webhooks para eventos

- **Mercado Pago** (Colombia/LATAM)
  - Métodos de pago locales
  - PSE, efectivo, cuotas

### Comunicaciones
- **SendGrid** o **AWS SES**
  - Emails transaccionales
  - Notificaciones de reservas
  - Newsletters

- **Twilio** o **AWS SNS**
  - SMS (verificación, alertas)
  - WhatsApp notifications (futuro)

### Real-time
- **Socket.io**
  - Chat en tiempo real
  - Notificaciones push web
  - Presencia de usuarios
  - Actualizaciones de disponibilidad

### Autenticación
- **Passport.js** con estrategias:
  - JWT para API
  - OAuth2 (Google, Facebook, Apple)
  - Local (email/password)

- **bcrypt** para hashing de passwords

### Validación y Transformación
- **class-validator** y **class-transformer**
  - Validación de DTOs
  - Sanitización de inputs
  - Prevención de inyecciones

---

## Frontend Web

### Framework
- **Next.js 14+** con App Router
  - React 18+
  - TypeScript 5+
  - Server Components
  - SSR y SSG para SEO
  - API Routes
  - Image optimization

### Estilos
- **TailwindCSS 3+**
  - Utility-first
  - Responsive design
  - Dark mode ready
  - Componentes custom

- **shadcn/ui**
  - Componentes accesibles
  - Customizables
  - Basados en Radix UI

### Estado Global
- **Zustand**
  - Ligero y simple
  - TypeScript friendly
  - DevTools

- **TanStack Query (React Query)**
  - Server state management
  - Caché inteligente
  - Optimistic updates
  - Infinite scrolling

### Formularios
- **React Hook Form**
  - Performance optimizado
  - Validación con Zod
  - Errores tipados

### Mapas
- **Mapbox GL JS** o **Google Maps API**
  - Mapas interactivos
  - Rutas animadas
  - Pins customizados
  - Geolocalización

### UI/UX
- **Framer Motion**
  - Animaciones fluidas
  - Transiciones de página
  - Gestos táctiles

- **date-fns** o **Day.js**
  - Manejo de fechas
  - i18n friendly

### Internacionalización
- **next-intl** o **next-i18next**
  - Múltiples idiomas
  - Rutas localizadas
  - Formato de fechas/monedas por región

---

## Mobile

### Framework
- **React Native** con Expo
  - Código compartido con web (componentes lógicos)
  - Expo Router para navegación
  - Expo Image para optimización
  - Expo Camera para "Capturado en Ruta"

### Navegación
- **Expo Router** (basado en React Navigation)
  - Stack, tabs, drawer
  - Deep linking
  - Type-safe

### Estado
- **Zustand** (mismo que web)
- **TanStack Query** (mismo que web)

### Mapas
- **react-native-maps**
  - iOS MapKit
  - Android Google Maps

### Multimedia
- **Expo Image Picker**
- **Expo Camera**
- **Expo AV** (video player)

### Almacenamiento Local
- **Expo SecureStore** (tokens, credenciales)
- **MMKV** (caché, preferencias)

### Push Notifications
- **Expo Notifications**
- Backend con FCM (Firebase Cloud Messaging)

---

## DevOps e Infraestructura

### Containerización
- **Docker**
  - Desarrollo local consistente
  - docker-compose para servicios
  - Multi-stage builds para producción

### CI/CD
- **GitHub Actions**
  - Tests automatizados
  - Linting y formateo
  - Build y deploy
  - Preview environments

### Hosting

#### Backend
- **AWS ECS/Fargate** o **Railway** o **Render**
  - Escalabilidad automática
  - Load balancing
  - Health checks

#### Frontend Web
- **Vercel** (ideal para Next.js)
  - Edge functions
  - Analytics integrado
  - Preview deployments

#### Base de Datos
- **AWS RDS** (PostgreSQL)
- **MongoDB Atlas**
- **Redis Cloud** o **Upstash**

### Monitoreo
- **Sentry**
  - Error tracking
  - Performance monitoring
  - Release tracking

- **Datadog** o **New Relic** (futuro)
  - APM
  - Logs centralizados
  - Métricas de infraestructura

### Analytics
- **Mixpanel** o **Amplitude**
  - Product analytics
  - Funnels y cohorts
  - A/B testing

- **Google Analytics 4** (básico, SEO)

---

## Testing

### Backend
- **Jest** + **Supertest**
  - Unit tests
  - Integration tests
  - E2E tests

### Frontend
- **Vitest** (más rápido que Jest)
- **Testing Library**
  - Componentes React
  - User interactions

- **Playwright** o **Cypress**
  - E2E tests
  - Visual regression

### Mobile
- **Jest** + **React Native Testing Library**
- **Detox** (E2E móvil)

---

## Herramientas de Desarrollo

### Linting y Formateo
- **ESLint** con configuración TypeScript
- **Prettier**
- **Husky** + **lint-staged** (pre-commit hooks)

### Type Checking
- **TypeScript** estricto
- **Zod** para runtime validation

### Documentación
- **Swagger/OpenAPI** (API docs)
- **Storybook** (componentes UI)
- **Compodoc** (código NestJS)

### Gestión de Monorepo
- **Turborepo** o **Nx**
  - Build cache
  - Parallel execution
  - Dependency graph

---

## Seguridad

- **Helmet** (headers de seguridad)
- **CORS** configurado apropiadamente
- **Rate limiting** con Redis
- **SQL injection** prevenido con ORMs
- **XSS** prevenido con sanitización
- **CSRF** tokens
- **HTTPS** obligatorio en producción
- **Secrets** en variables de entorno (.env)
- **Audit** periódico con `npm audit`

---

## Escalabilidad Futura

### Preparado para:
1. **Microservicios** (cuando sea necesario)
   - Separar: Auth, Reservas, Social, Pagos, B2B
   - Message broker: RabbitMQ o AWS SQS

2. **CDN Global**
   - Cloudflare o AWS CloudFront
   - Edge caching

3. **Multi-región**
   - Bases de datos replicadas
   - Latencia reducida por geografía

4. **Machine Learning**
   - Recomendaciones personalizadas
   - Detección de fraude
   - Moderación de contenido
   - Python microservices (FastAPI)

---

## Resumen de Decisiones Clave

| Aspecto | Tecnología | Razón |
|---------|-----------|-------|
| Backend Framework | NestJS | Escalable, modular, TypeScript nativo |
| Frontend Web | Next.js 14 | SSR/SSG, SEO, performance |
| Mobile | React Native + Expo | Code sharing, desarrollo rápido |
| DB Principal | PostgreSQL | ACID, relaciones complejas |
| DB Social | MongoDB | Flexible, rápido para contenido |
| Caché | Redis | Performance, real-time |
| Pagos | Stripe + Mercado Pago | Global + LATAM |
| Storage | S3/R2 + Cloudinary | Escalable, optimización |
| Búsqueda | Typesense | Rápido, fácil de configurar |
| Monorepo | Turborepo | Build cache, velocidad |
| Hosting Backend | Railway/Render | Fácil deploy, escalable |
| Hosting Frontend | Vercel | Optimizado para Next.js |

---

**Última actualización:** 2025-11-09
