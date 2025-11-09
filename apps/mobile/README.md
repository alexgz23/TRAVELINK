# Mobile App - Viajero Conectado

Aplicación móvil construida con React Native + Expo.

## Stack

- **Framework:** React Native + Expo SDK 50
- **Navegación:** Expo Router (file-based)
- **Lenguaje:** TypeScript 5+
- **Estilos:** NativeWind (Tailwind para RN)
- **Estado:** Zustand + TanStack Query
- **Formularios:** React Hook Form + Zod
- **Mapas:** react-native-maps
- **Cámara:** Expo Camera + Image Picker

## Estructura del proyecto

```
app/                  # File-based routing (Expo Router)
├── (tabs)/          # Tab navigation
│   ├── index.tsx    # Home
│   ├── explore.tsx  # Marketplace
│   ├── social.tsx   # Feed social
│   ├── map.tsx      # Mapa
│   └── profile.tsx  # Perfil
├── auth/            # Autenticación
├── booking/         # Flujo de reserva
├── trip/            # Detalle de viaje
└── _layout.tsx      # Root layout

src/
├── components/      # Componentes reutilizables
├── screens/         # Pantallas complejas
├── hooks/           # Custom hooks
├── lib/             # Utilidades
├── types/           # TypeScript types
└── constants/       # Constantes

assets/              # Imágenes, iconos, fuentes
```

## Instalación

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# iOS: instalar pods
cd ios && pod install && cd ..
```

## Desarrollo

```bash
# Iniciar Expo
pnpm start

# iOS
pnpm ios

# Android
pnpm android

# Web (para testing rápido)
pnpm web
```

## Testing

```bash
# Tests con Jest
pnpm test
```

## Build

### Desarrollo (con Expo Go)
No requiere build, usar `pnpm start`

### Producción (EAS Build)

```bash
# Configurar EAS
eas login
eas build:configure

# Build Android
pnpm build:android

# Build iOS
pnpm build:ios

# Submit a stores
eas submit -p android
eas submit -p ios
```

## Características móviles

### Cámara y Galería
- Captura de fotos/videos en ruta
- Selector de galería
- Edición básica de imágenes

### Geolocalización
- Ubicación actual
- Geocoding reverso
- Tracking de rutas

### Notificaciones Push
- Expo Notifications
- Firebase Cloud Messaging
- Notificaciones locales

### Almacenamiento
- **Secure Store:** tokens, credenciales
- **MMKV:** caché, preferencias
- Persistencia de estado

### Mapas
- iOS: MapKit nativo
- Android: Google Maps
- Markers customizados
- Rutas animadas

### Offline
- Caché de imágenes (Expo Image)
- Persistencia con TanStack Query
- Sincronización al reconectar

## Pantallas principales

### Tabs principales
1. **Home:** Feed personalizado, próximos viajes
2. **Explorar:** Búsqueda y catálogo de experiencias
3. **Social:** Feed, stories, chat
4. **Mapa:** Mapa de viajes y wishlist
5. **Perfil:** Configuración y puntos

### Flujos especiales
- Onboarding (primera vez)
- Autenticación (login/registro)
- Reserva (checkout)
- Captura en ruta (cámara + mapa)
- Chat individual/grupal

## Permisos

### iOS
- Cámara
- Galería de fotos
- Ubicación (cuando se usa)

### Android
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION

## Deep Linking

Esquema: `viajeroconectado://`

Ejemplos:
- `viajeroconectado://experience/cartagena-city-tour`
- `viajeroconectado://booking/123`
- `viajeroconectado://profile/username`

## Performance

- Lazy loading de pantallas
- Optimización de imágenes (Expo Image)
- Virtualización de listas (FlashList)
- Memoización de componentes
- React Native Reanimated para animaciones

## Variables de entorno

Ver `.env.example` para todas las variables necesarias.

**Importante:** Nunca commitear el archivo `.env` real.
