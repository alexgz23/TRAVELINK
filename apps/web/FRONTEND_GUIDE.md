# Frontend Web - Viajero Conectado

## 📚 Guía de Desarrollo Frontend

Este documento proporciona una guía completa para trabajar con el frontend de Viajero Conectado.

---

## 🏗️ Arquitectura

### Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS 3+
- **Estado**: Zustand (auth), TanStack Query (server state)
- **Formularios**: React Hook Form + Zod
- **Tiempo Real**: Socket.io Client
- **HTTP**: Axios con interceptors
- **Testing**: Vitest, Playwright (pendiente)

### Estructura del Proyecto

```
apps/web/src/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout + providers
│   ├── page.tsx               # Homepage
│   ├── loading.tsx            # Global loading
│   ├── error.tsx              # Error boundary
│   ├── not-found.tsx          # 404 page
│   ├── auth/                  # Authentication pages
│   ├── experiences/           # Experiences pages
│   ├── booking/               # Booking flow
│   ├── dashboard/             # User dashboard
│   ├── social/                # Social feed
│   ├── chat/                  # Real-time chat
│   └── settings/              # Settings & profile
│
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Skeleton.tsx       # Loading skeletons
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MainLayout.tsx
│   └── reviews/               # Feature components
│       └── ReviewModal.tsx
│
├── hooks/                      # Custom React hooks
│   ├── use-experiences.ts     # Experiences API hooks
│   ├── use-bookings.ts        # Bookings API hooks
│   ├── use-reviews.ts         # Reviews API hooks
│   ├── use-social.ts          # Social API hooks
│   ├── use-users.ts           # Users API hooks
│   └── use-chat.ts            # Chat + WebSocket hooks
│
├── providers/                  # React context providers
│   ├── query-provider.tsx     # TanStack Query config
│   ├── websocket-provider.tsx # Socket.io connection
│   └── toast-provider.tsx     # Toast notifications
│
├── stores/                     # Zustand stores
│   └── auth-store.ts          # Authentication state
│
├── lib/                        # Utilities
│   ├── api-client.ts          # Axios instance
│   ├── constants.ts           # App constants
│   └── utils.ts               # Helper functions
│
├── types/                      # TypeScript types
│   └── index.ts               # All type definitions
│
└── styles/                     # Global styles
    └── globals.css            # Tailwind + custom CSS
```

---

## 🎨 Componentes UI

### Button

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg" isLoading={loading}>
  Click me
</Button>
```

**Variantes**: `primary`, `secondary`, `outline`, `ghost`, `danger`
**Tamaños**: `sm`, `md`, `lg`
**Props**: `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`

### Input

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  error={errors.email?.message}
  leftIcon={<MailIcon />}
  {...register('email')}
/>
```

**Props**: `label`, `error`, `helperText`, `leftIcon`, `rightIcon`

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Skeleton

```tsx
import { Skeleton, CardSkeleton, ExperienceCardSkeleton } from '@/components/ui/Skeleton';

// Simple skeleton
<Skeleton width="200px" height="20px" />

// Pre-built card skeleton
<ExperienceCardSkeleton />
```

---

## 🔌 Hooks Personalizados

### useExperiences

```tsx
import { useExperiences } from '@/hooks';

const { data, isLoading, error } = useExperiences({
  q: 'search term',
  category: 'ADVENTURE',
  minPrice: 50000,
  maxPrice: 500000,
  page: 1,
  limit: 20,
});
```

### useCreateBooking

```tsx
import { useCreateBooking } from '@/hooks';

const { mutate: createBooking, isPending } = useCreateBooking();

createBooking({
  experienceId: 'exp-123',
  date: '2025-12-25',
  numberOfPeople: 2,
  contactName: 'Juan Pérez',
  contactEmail: 'juan@example.com',
  contactPhone: '3001234567',
}, {
  onSuccess: (booking) => {
    router.push(`/booking/${booking.id}/payment`);
  },
});
```

### useRealtimeChat

```tsx
import { useRealtimeChat } from '@/hooks';

const { typingUsers, sendTyping, markAsRead, isConnected } = useRealtimeChat(conversationId);

// Send typing indicator
const handleTyping = () => {
  sendTyping();
};

// Mark message as read
const handleRead = (messageId: string) => {
  markAsRead(messageId);
};
```

---

## 🔔 Sistema de Notificaciones

### Toast Notifications

```tsx
import { useToast } from '@/providers/toast-provider';

const { showToast } = useToast();

// Success
showToast('success', 'Reserva creada exitosamente');

// Error
showToast('error', 'Error al procesar el pago');

// Warning
showToast('warning', 'Revisa los datos antes de continuar');

// Info
showToast('info', 'Nueva funcionalidad disponible', 8000);
```

---

## 🔐 Autenticación

### Auth Store (Zustand)

```tsx
import { useAuthStore } from '@/stores/auth-store';

const { user, isAuthenticated, login, logout } = useAuthStore();

// Login
await login({ email, password });

// Logout
logout();

// Check auth status
await checkAuth();
```

### Protected Routes

```tsx
export default function ProtectedPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  return <div>Protected content</div>;
}
```

---

## 🌐 WebSocket (Chat en Tiempo Real)

### Conexión

El `WebSocketProvider` maneja automáticamente la conexión con el servidor Socket.io.

```tsx
import { useWebSocket } from '@/providers/websocket-provider';

const { socket, isConnected } = useWebSocket();
```

### Eventos de Chat

```tsx
// Join conversation
socket.emit('chat:join', conversationId);

// Send typing indicator
socket.emit('chat:typing', { conversationId });

// Mark message as read
socket.emit('chat:markRead', { conversationId, messageId });

// Leave conversation
socket.emit('chat:leave', conversationId);
```

### Escuchar Eventos

```tsx
socket.on('chat:message', (message) => {
  // Handle new message
});

socket.on('chat:typing', ({ userId }) => {
  // Show typing indicator
});

socket.on('chat:messageRead', ({ messageId }) => {
  // Update read status
});
```

---

## 📋 Formularios

### React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        type="password"
        label="Password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## 🎯 Optimistic Updates

### Example: Like a Post

```tsx
const { mutate: likePost } = useLikePost();

likePost(postId, {
  onMutate: async (postId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['posts', postId]);

    // Snapshot previous value
    const previousPost = queryClient.getQueryData(['posts', postId]);

    // Optimistically update
    queryClient.setQueryData(['posts', postId], (old: any) => ({
      ...old,
      isLiked: true,
      likeCount: old.likeCount + 1,
    }));

    return { previousPost };
  },
  onError: (err, postId, context) => {
    // Rollback on error
    queryClient.setQueryData(['posts', postId], context.previousPost);
  },
  onSettled: (_, __, postId) => {
    // Refetch after mutation
    queryClient.invalidateQueries(['posts', postId]);
  },
});
```

---

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Lint
pnpm lint

# Tests
pnpm test
pnpm test:ui
pnpm test:coverage
```

---

## 📦 Variables de Entorno

Crear `.env.local`:

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# Mapbox (opcional)
NEXT_PUBLIC_MAPBOX_TOKEN=

# Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# App
NEXT_PUBLIC_APP_NAME=Viajero Conectado
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎨 Tailwind CSS

### Colores Personalizados

```css
primary: blue-600
secondary: green-500
error: red-600
warning: yellow-500
success: green-600
```

### Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## ✅ Mejores Prácticas

1. **Componentes Server por defecto**: Usa `'use client'` solo cuando necesites interactividad
2. **Hooks personalizados**: Encapsula lógica de API en hooks reutilizables
3. **TypeScript estricto**: Evita `any`, usa tipos específicos
4. **Optimistic updates**: Mejora UX con actualizaciones optimistas
5. **Loading states**: Siempre muestra skeletons mientras carga
6. **Error handling**: Usa error boundaries y toast notifications
7. **Accessibility**: Usa ARIA labels y semantic HTML
8. **Performance**: Code splitting automático con Next.js 14

---

## 🐛 Debugging

### React Query Devtools

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Ya incluido en QueryProvider (solo en desarrollo)
```

### Redux DevTools (para Zustand)

```bash
npm install @redux-devtools/extension
```

```tsx
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // state and actions
      }),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' }
  )
);
```

---

## 📊 Métricas

- **Lighthouse Score**: >90
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.5s
- **Bundle Size**: <250KB (initial)

---

## 🔗 Links Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

**Actualizado**: 2025-11-09
**Versión**: 1.0.0
**Mantenido por**: Viajero Conectado Team
