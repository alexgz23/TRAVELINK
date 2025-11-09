import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create a custom QueryClient for testing
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllTheProvidersProps {
  children: ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const mockExperience = (overrides = {}) => ({
  id: '1',
  title: 'Test Experience',
  description: 'Test description',
  shortDescription: 'Short description',
  category: 'ADVENTURE' as const,
  location: {
    city: 'Bogotá',
    country: 'Colombia',
    address: 'Test Address',
    coordinates: { lat: 4.7110, lng: -74.0721 },
  },
  price: 100000,
  duration: 4,
  maxGroupSize: 10,
  difficulty: 'MODERATE' as const,
  images: ['image1.jpg', 'image2.jpg'],
  includedItems: ['Item 1', 'Item 2'],
  excludedItems: ['Item 3'],
  requirements: ['Requirement 1'],
  cancellationPolicy: 'Flexible',
  languages: ['es', 'en'],
  rating: 4.5,
  reviewCount: 10,
  tags: ['nature', 'adventure'],
  providerId: 'provider-1',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'TRAVELER' as const,
  avatar: 'avatar.jpg',
  phone: '+57 300 123 4567',
  birthDate: '1990-01-01',
  points: 1000,
  isEmailVerified: true,
  preferences: {
    language: 'es',
    currency: 'COP',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const mockBooking = (overrides = {}) => ({
  id: 'booking-1',
  experienceId: '1',
  userId: 'user-1',
  date: new Date().toISOString(),
  numberOfPeople: 2,
  totalPrice: 200000,
  pointsUsed: 0,
  status: 'CONFIRMED' as const,
  contactName: 'Test User',
  contactEmail: 'test@example.com',
  contactPhone: '+57 300 123 4567',
  specialRequests: '',
  paymentStatus: 'PAID' as const,
  paymentMethod: 'CARD' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const mockReview = (overrides = {}) => ({
  id: 'review-1',
  experienceId: '1',
  userId: 'user-1',
  bookingId: 'booking-1',
  rating: 5,
  comment: 'Great experience!',
  response: null,
  images: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const mockPost = (overrides = {}) => ({
  id: 'post-1',
  userId: 'user-1',
  experienceId: '1',
  content: 'Test post content',
  images: [],
  likeCount: 5,
  commentCount: 2,
  isLiked: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
export { createTestQueryClient };
