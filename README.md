# Viajero Conectado

**Red social + marketplace de viajes + ecosistema B2B**

Plataforma que conecta viajeros, agencias, hoteles, guías y conductores en un ecosistema completo de turismo.

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

### Infraestructura
- **Containerización:** Docker
- **Monorepo:** Turborepo
- **Package Manager:** pnpm

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

1. **Auth Module** - Autenticación y autorización
2. **Users Module** - Gestión de usuarios y perfiles
3. **Experiences Module** - Tours y experiencias
4. **Bookings Module** - Sistema de reservas
5. **Payments Module** - Pagos y splits
6. **Social Module** - Feed, stories, comentarios
7. **Chat Module** - Mensajería real-time
8. **Media Module** - Gestión de multimedia
9. **Points Module** - Sistema de puntos y niveles
10. **B2B Module** - Alianzas entre proveedores
11. **Notifications Module** - Notificaciones push/email
12. **Search Module** - Búsqueda con Typesense

Ver [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) para más detalles.

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

### Desarrollo
- **Backend:** Railway / Render
- **Frontend:** Vercel
- **Bases de datos:** Railway / Render

### Producción
- **Backend:** AWS ECS / Fargate
- **Frontend:** Vercel (Edge)
- **Bases de datos:** AWS RDS + MongoDB Atlas
- **Storage:** AWS S3 + CloudFront CDN
- **Search:** Typesense Cloud

Ver [docs/deployment/](./docs/deployment/) para guías detalladas.

---

## Variables de Entorno

Cada aplicación tiene su archivo `.env.example`:

- `apps/backend/.env.example`
- `apps/web/.env.example`
- `apps/mobile/.env.example`

**Importante:** Nunca commitear archivos `.env` reales.

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

### Fase 1 - MVP Colombia (Q1 2025)
- [x] Arquitectura base
- [ ] Módulos core (Auth, Users, Experiences, Bookings)
- [ ] Frontend web básico
- [ ] App móvil viajero
- [ ] Integración pagos (Stripe, Mercado Pago)
- [ ] Red social básica
- [ ] Sistema de puntos v1

### Fase 2 - Expansión LATAM (Q2-Q3 2025)
- [ ] Multi-idioma (ES, EN, PT)
- [ ] Multi-moneda
- [ ] B2B completo
- [ ] Apps para guías y conductores
- [ ] Analytics avanzado
- [ ] Marketing automation

### Fase 3 - Global (Q4 2025+)
- [ ] Internacionalización completa
- [ ] Machine Learning (recomendaciones)
- [ ] API pública para partners
- [ ] Programa de afiliados
- [ ] White-label para agencias

---

## Documentación

- [Arquitectura](./docs/architecture/ARCHITECTURE.md)
- [Esquema de DB](./docs/architecture/DATABASE_SCHEMA.md)
- [Stack Tecnológico](./TECH_STACK.md)
- [API Docs](http://localhost:4000/api/docs) (desarrollo)

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
