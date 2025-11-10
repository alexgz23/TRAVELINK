# Viajero Conectado - Web App

Red social + marketplace de viajes en Colombia. Aplicación web frontend construida con Next.js 14.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38bdf8)

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <tu-repo-url>
cd TRAVELINK

# 2. Instalar dependencias
cd apps/web
pnpm install

# 3. Copiar variables de entorno
cp .env.example .env.local

# 4. Iniciar servidor de desarrollo
pnpm dev
```

### Acceder a la aplicación

Abre tu navegador en: **http://localhost:3000**

---

## 📁 Estructura del Proyecto

```
TRAVELINK/
├── apps/
│   └── web/                 # Aplicación Next.js
│       ├── src/
│       │   ├── app/         # App Router (rutas)
│       │   ├── components/  # Componentes React
│       │   ├── hooks/       # Custom hooks
│       │   ├── lib/         # Utilidades y configs
│       │   ├── providers/   # Context providers
│       │   ├── styles/      # Estilos globales
│       │   └── types/       # TypeScript types
│       ├── public/          # Archivos estáticos
│       ├── .env.local       # Variables de entorno (crear desde .env.example)
│       └── package.json     # Dependencias
└── README.md                # Este archivo
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Descripción |
|------------|-------------|
| **Next.js 14** | Framework React con App Router |
| **TypeScript 5** | Tipado estático |
| **Tailwind CSS 3** | Framework de estilos utility-first |
| **Zustand** | Gestión de estado global |
| **TanStack Query v5** | Data fetching y caché |
| **React Hook Form** | Formularios con validación |
| **Zod** | Validación de schemas |
| **Framer Motion** | Animaciones |
| **Socket.io Client** | WebSocket para chat en tiempo real |
| **Mapbox GL** | Mapas interactivos |

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo (puerto 3000)
pnpm dev --turbo      # Con Turbopack (más rápido)

# Producción
pnpm build            # Build optimizado para producción
pnpm start            # Ejecutar build de producción

# Testing
pnpm test             # Tests unitarios (Vitest)
pnpm test:ui          # Tests con interfaz UI
pnpm test:e2e         # Tests end-to-end (Playwright)

# Code Quality
pnpm lint             # ESLint
pnpm type-check       # Verificación de tipos TypeScript
pnpm format           # Formatear código con Prettier

# Análisis
pnpm build:analyze    # Analizar tamaño del bundle
```

---

## 🌐 Rutas Principales

### Públicas (sin autenticación)
- `/` - Homepage con hero section y categorías
- `/experiences` - Catálogo de experiencias
- `/experiences/[id]` - Detalle de experiencia
- `/auth/login` - Iniciar sesión
- `/auth/register` - Registro de usuario

### Privadas (requieren autenticación)
- `/dashboard` - Dashboard del usuario
- `/booking/new` - Nueva reserva
- `/booking/[id]/payment` - Proceso de pago
- `/chat` - Chat en tiempo real
- `/social` - Feed de red social
- `/settings` - Configuración de usuario

---

## ⚙️ Variables de Entorno

Crear archivo `.env.local` en `apps/web/` basado en `.env.example`:

```env
# API Backend (opcional - si tienes backend)
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# Mapbox (para mapas - opcional)
NEXT_PUBLIC_MAPBOX_TOKEN=tu-token-aqui

# Google Maps (alternativa - opcional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-api-key-aqui

# App Info
NEXT_PUBLIC_APP_NAME=Viajero Conectado
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nota:** La aplicación funciona perfectamente sin backend. Las llamadas API simplemente mostrarán errores en la consola pero el UI es completamente funcional.

---

## 🎨 Características

### Implementadas
- ✅ Homepage con hero section
- ✅ Sistema de navegación completo
- ✅ 10+ páginas funcionales
- ✅ Componentes UI reutilizables
- ✅ Formularios con validación
- ✅ Responsive design (mobile-first)
- ✅ Dark mode compatible
- ✅ SEO optimizado
- ✅ PWA configurado
- ✅ Optimización de performance (Web Vitals)

### En Desarrollo
- 🚧 Integración con backend API
- 🚧 Autenticación completa
- 🚧 Sistema de pagos
- 🚧 Chat en tiempo real
- 🚧 Mapas interactivos

---

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
cd apps/web
vercel
```

### Netlify

```bash
# Build command
cd apps/web && pnpm build

# Publish directory
apps/web/.next
```

### Docker (si prefieres contenedores)

```bash
# Build
docker build -t viajero-web -f apps/web/Dockerfile .

# Run
docker run -p 3000:3000 viajero-web
```

---

## 📊 Performance

La aplicación está optimizada para:
- ⚡ First Contentful Paint (FCP) < 1.5s
- ⚡ Largest Contentful Paint (LCP) < 2.5s
- ⚡ Cumulative Layout Shift (CLS) < 0.1
- ⚡ First Input Delay (FID) < 100ms

---

## 🐛 Troubleshooting

### Puerto 3000 ya está en uso
```bash
# Cambiar puerto
PORT=3001 pnpm dev
```

### Errores de TypeScript
```bash
# Limpiar y reconstruir
rm -rf .next
pnpm dev
```

### Problemas con dependencias
```bash
# Reinstalar
rm -rf node_modules
pnpm install
```

---

## 📝 Notas Importantes

1. **Sin Backend:** La app funciona sin backend. Solo verás errores de red en la consola del navegador, pero el UI es totalmente funcional.

2. **Fuentes del Sistema:** Actualmente usa fuentes del sistema (system-ui). Para habilitar Google Fonts, edita `src/app/layout.tsx`.

3. **Mapbox Token:** Para que los mapas funcionen, necesitas obtener un token gratis en [mapbox.com](https://www.mapbox.com/).

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Propietario - Todos los derechos reservados

---

## 📧 Contacto

- **Website:** https://viajeroconectado.com
- **Email:** contact@viajeroconectado.com

---

**¡Construyendo la mejor red social de viajes!** 🌍✈️
