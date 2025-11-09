# Frontend Web - Viajero Conectado

Aplicación web construida con Next.js 14 + TypeScript + TailwindCSS.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5+
- **Estilos:** TailwindCSS 3+
- **Estado:** Zustand + TanStack Query
- **Formularios:** React Hook Form + Zod
- **Animaciones:** Framer Motion
- **Mapas:** Mapbox GL JS

## Estructura del proyecto

```
src/
├── app/              # App Router (Next.js 14)
│   ├── (auth)/      # Rutas de autenticación
│   ├── (dashboard)/ # Dashboard de usuario
│   ├── explore/     # Marketplace
│   ├── social/      # Red social
│   └── layout.tsx   # Layout principal
├── components/       # Componentes reutilizables
│   ├── ui/          # Componentes base (buttons, inputs, etc.)
│   ├── layout/      # Header, Footer, Nav
│   ├── features/    # Componentes específicos de features
│   └── shared/      # Componentes compartidos
├── lib/             # Utilidades y configuraciones
│   ├── api/         # Cliente API
│   ├── auth/        # Autenticación
│   ├── utils/       # Helper functions
│   └── constants/   # Constantes
├── hooks/           # Custom hooks
├── types/           # TypeScript types
└── styles/          # Estilos globales
```

## Instalación

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus credenciales
```

## Desarrollo

```bash
# Modo desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## Testing

```bash
# Run tests
pnpm test

# Tests con UI
pnpm test:ui

# Coverage
pnpm test:coverage
```

## Build

```bash
# Build para producción
pnpm build

# Ejecutar build
pnpm start
```

## Rutas principales

### Público (no autenticado)
- `/` - Homepage
- `/explore` - Catálogo de experiencias
- `/explore/[slug]` - Detalle de experiencia
- `/login` - Login
- `/register` - Registro

### Viajero (autenticado)
- `/dashboard` - Dashboard principal
- `/dashboard/bookings` - Mis reservas
- `/dashboard/trips` - Mis viajes
- `/dashboard/gallery` - Capturado en Ruta
- `/dashboard/map` - Mapa de viajes
- `/dashboard/points` - Sistema de puntos
- `/dashboard/profile` - Perfil

### Social
- `/feed` - Feed principal
- `/stories` - Stories
- `/messages` - Chat
- `/profile/[username]` - Perfil de usuario

### Agencia (autenticado)
- `/agency/dashboard` - Dashboard de agencia
- `/agency/products` - Gestión de productos
- `/agency/bookings` - Reservas recibidas
- `/agency/b2b` - Alianzas B2B

## Componentes UI

Se usa **shadcn/ui** para componentes base accesibles y customizables:

- Button
- Input
- Select
- Dialog
- Sheet
- Tabs
- Card
- Avatar
- Badge
- Toast
- Y más...

## Estado Global

### Zustand (Client state)
- Auth state
- UI state (modals, sidebar, etc.)
- User preferences

### TanStack Query (Server state)
- Data fetching
- Cache management
- Optimistic updates
- Infinite scrolling

## Internacionalización

Soporte multi-idioma con `next-intl`:
- Español (default)
- Inglés
- Portugués

## SEO

- Metadata dinámica por página
- Open Graph tags
- Structured data (JSON-LD)
- Sitemap automático
- robots.txt

## Performance

- Server Components (RSC)
- Image optimization
- Font optimization
- Code splitting automático
- Lazy loading de componentes

## Variables de entorno

Ver `.env.example` para todas las variables necesarias.

**Importante:** Nunca commitear el archivo `.env.local` real.
