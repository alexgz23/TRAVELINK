# Mobile App - Implementation Guide

Esta guía describe la estructura e implementación de la aplicación móvil de Viajero Conectado.

## Estado Actual

**Configuración Base**: ✅ Completa
- package.json con todas las dependencias
- Expo Router configurado
- TypeScript y ESLint configurados
- Tailwind CSS (NativeWind) configurado

**Pendiente de Implementación**: Pantallas y funcionalidad completa

## Estructura Recomendada

```
apps/mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Auth group
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── index.tsx             # Home
│   │   ├── explore.tsx           # Marketplace
│   │   ├── social.tsx            # Social feed
│   │   ├── map.tsx               # Map view
│   │   └── profile.tsx           # User profile
│   ├── experience/
│   │   └── [id].tsx              # Experience detail
│   ├── booking/
│   │   ├── new.tsx               # New booking
│   │   └── [id].tsx              # Booking detail
│   ├── chat/
│   │   └── [id].tsx              # Chat screen
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
│
├── src/
│   ├── components/               # Shared components
│   │   ├── ui/                   # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── ExperienceCard.tsx
│   │   ├── PostCard.tsx
│   │   └── index.ts
│   │
│   ├── lib/                      # Utilities and configs
│   │   ├── api-client.ts         # Axios instance
│   │   ├── constants.ts          # App constants
│   │   ├── utils.ts              # Helper functions
│   │   └── socket.ts             # Socket.IO client
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useExperiences.ts
│   │   ├── useBookings.ts
│   │   ├── useSocial.ts
│   │   └── index.ts
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── cart-store.ts
│   │   └── index.ts
│   │
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   │
│   └── providers/                # Context providers
│       ├── QueryProvider.tsx
│       └── ThemeProvider.tsx
│
├── assets/                       # Static assets
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── .env.example                  # Environment variables template
├── app.json                      # Expo config
├── babel.config.js              # Babel config
├── eas.json                     # EAS Build config
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind config
├── tsconfig.json                # TypeScript config
└── README.md                    # Documentation
```

## Implementación Paso a Paso

### 1. API Client

**src/lib/api-client.ts**:
```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      await SecureStore.deleteItemAsync('access_token');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export const get = <T>(url: string) => apiClient.get<T>(url).then(res => res.data);
export const post = <T>(url: string, data: any) => apiClient.post<T>(url, data).then(res => res.data);
export const put = <T>(url: string, data: any) => apiClient.put<T>(url, data).then(res => res.data);
export const del = <T>(url: string) => apiClient.delete<T>(url).then(res => res.data);
```

### 2. Auth Store

**src/stores/auth-store.ts**:
```typescript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { post } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    const response = await post('/auth/login', credentials);
    await SecureStore.setItemAsync('access_token', response.accessToken);
    await SecureStore.setItemAsync('refresh_token', response.refreshToken);
    set({ user: response.user, isAuthenticated: true });
  },

  register: async (data) => {
    const response = await post('/auth/register', data);
    await SecureStore.setItemAsync('access_token', response.accessToken);
    await SecureStore.setItemAsync('refresh_token', response.refreshToken);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        // Verify token with backend
        const user = await get('/auth/me');
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
```

### 3. Experiences Hook

**src/hooks/useExperiences.ts**:
```typescript
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';

export function useExperiences(filters?: any) {
  return useQuery({
    queryKey: ['experiences', filters],
    queryFn: () => {
      const params = new URLSearchParams(filters);
      return get(`/experiences?${params}`);
    },
  });
}

export function useExperience(id: string) {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: () => get(`/experiences/${id}`),
    enabled: !!id,
  });
}

export function useInfiniteExperiences(filters?: any) {
  return useInfiniteQuery({
    queryKey: ['experiences', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ ...filters, page: pageParam });
      return get(`/experiences?${params}`);
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  });
}
```

### 4. UI Components

**src/components/ui/Button.tsx**:
```typescript
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchable = styled(TouchableOpacity);
const StyledText = styled(Text);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled
}: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg items-center justify-center';
  const variantClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    outline: 'border-2 border-primary-600 bg-transparent',
  };

  return (
    <StyledTouchable
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <StyledText className={`font-semibold ${variant === 'outline' ? 'text-primary-600' : 'text-white'}`}>
          {title}
        </StyledText>
      )}
    </StyledTouchable>
  );
}
```

### 5. Login Screen

**app/(auth)/login.tsx**:
```typescript
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { styled } from 'nativewind';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login({ email, password });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledView className="flex-1 bg-white px-6 justify-center">
      <StyledText className="text-3xl font-bold mb-8 text-center">
        Iniciar Sesión
      </StyledText>

      <StyledInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <StyledInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title="Iniciar Sesión"
        onPress={handleLogin}
        loading={loading}
      />

      <StyledText className="text-center mt-6 text-gray-600">
        ¿No tienes cuenta?{' '}
        <StyledText
          className="text-primary-600 font-semibold"
          onPress={() => router.push('/(auth)/register')}
        >
          Regístrate
        </StyledText>
      </StyledText>
    </StyledView>
  );
}
```

### 6. Home Screen

**app/(tabs)/index.tsx**:
```typescript
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { useExperiences } from '@/hooks/useExperiences';
import { ExperienceCard } from '@/components/ExperienceCard';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

export default function HomeScreen() {
  const { data, isLoading, refetch } = useExperiences({ featured: true });

  return (
    <StyledScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <StyledView className="p-4">
        <StyledText className="text-2xl font-bold mb-4">
          Experiencias Destacadas
        </StyledText>

        {data?.data.map((experience) => (
          <ExperienceCard key={experience.id} experience={experience} />
        ))}
      </StyledView>
    </StyledScrollView>
  );
}
```

## Próximos Pasos

1. **Implementar todas las pantallas** siguiendo los ejemplos anteriores
2. **Agregar navegación** con Expo Router (ya configurado)
3. **Implementar WebSocket** para chat en tiempo real
4. **Agregar notificaciones push** con Expo Notifications
5. **Implementar cámara y galería** para "Capturado en Ruta"
6. **Agregar mapas** con react-native-maps
7. **Configurar deep linking** para compartir contenido
8. **Optimizar performance** con FlashList y memoization
9. **Agregar tests** con Jest
10. **Configurar EAS Build** para producción

## Referencias

- **Backend API**: http://localhost:4000/api/docs
- **Frontend Web**: apps/web (para referencia de UI/UX)
- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **TanStack Query**: https://tanstack.com/query
- **Zustand**: https://zustand-demo.pmnd.rs

## Comandos Útiles

```bash
# Desarrollo
npm run start             # Iniciar Expo
npm run ios              # Ejecutar en iOS
npm run android          # Ejecutar en Android

# Testing
npm run test             # Jest tests
npm run lint             # ESLint

# Build
npm run build:android    # Build para Android
npm run build:ios        # Build para iOS
```
