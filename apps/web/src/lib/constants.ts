/**
 * Application constants and configuration
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Viajero Conectado';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: (id: string) => `/users/${id}/profile`,
    UPDATE_PROFILE: '/users/profile',
    UPDATE_EXTENDED_PROFILE: '/users/profile/extended',
    UPDATE_PRIVACY: '/users/privacy',
    STATS: '/users/stats',
    MAP: (id: string) => `/users/${id}/map`,
    FOLLOWERS: (id: string) => `/users/${id}/followers`,
    FOLLOWING: (id: string) => `/users/${id}/following`,
    FOLLOW: (id: string) => `/users/${id}/follow`,
    UNFOLLOW: (id: string) => `/users/${id}/unfollow`,
  },
  // Experiences
  EXPERIENCES: {
    BASE: '/experiences',
    BY_ID: (id: string) => `/experiences/${id}`,
    SEARCH: '/experiences/search',
    FEATURED: '/experiences/featured',
    NEARBY: '/experiences/nearby',
    BY_PROVIDER: (providerId: string) => `/experiences/provider/${providerId}`,
  },
  // Bookings
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    MY_BOOKINGS: '/bookings/my',
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    BY_EXPERIENCE: (experienceId: string) => `/experiences/${experienceId}/reviews`,
    BY_USER: (userId: string) => `/users/${userId}/reviews`,
  },
  // Social
  SOCIAL: {
    POSTS: '/social/posts',
    POST_BY_ID: (id: string) => `/social/posts/${id}`,
    FEED: '/social/feed',
    LIKE: (postId: string) => `/social/posts/${postId}/like`,
    UNLIKE: (postId: string) => `/social/posts/${postId}/unlike`,
    COMMENT: (postId: string) => `/social/posts/${postId}/comments`,
  },
  // Chat
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    CONVERSATION_BY_ID: (id: string) => `/chat/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
  },
  // Search
  SEARCH: {
    EXPERIENCES: '/search/experiences',
    USERS: '/search/users',
    AUTOCOMPLETE: '/search/autocomplete',
    POPULAR: '/search/popular',
  },
  // Gamification/Points
  GAMIFICATION: {
    BALANCE: '/gamification/points/balance',
    HISTORY: '/gamification/points/history',
    LEVELS: '/gamification/levels',
    RULES: '/gamification/points/rules',
  },
} as const;

/**
 * Query keys for TanStack Query
 */
export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'],
  },
  USERS: {
    BY_ID: (id: string) => ['users', id],
    PROFILE: (id: string) => ['users', id, 'profile'],
    STATS: (id: string) => ['users', id, 'stats'],
    MAP: (id: string) => ['users', id, 'map'],
    FOLLOWERS: (id: string) => ['users', id, 'followers'],
    FOLLOWING: (id: string) => ['users', id, 'following'],
  },
  EXPERIENCES: {
    ALL: ['experiences'],
    BY_ID: (id: string) => ['experiences', id],
    SEARCH: (query: string) => ['experiences', 'search', query],
    FEATURED: ['experiences', 'featured'],
    NEARBY: (lat: number, lng: number) => ['experiences', 'nearby', lat, lng],
  },
  BOOKINGS: {
    ALL: ['bookings'],
    BY_ID: (id: string) => ['bookings', id],
    MY_BOOKINGS: ['bookings', 'my'],
  },
  REVIEWS: {
    BY_EXPERIENCE: (experienceId: string) => ['reviews', 'experience', experienceId],
    BY_USER: (userId: string) => ['reviews', 'user', userId],
  },
  SOCIAL: {
    FEED: ['social', 'feed'],
    POSTS: ['social', 'posts'],
    POST_BY_ID: (id: string) => ['social', 'posts', id],
  },
  CHAT: {
    CONVERSATIONS: ['chat', 'conversations'],
    CONVERSATION_BY_ID: (id: string) => ['chat', 'conversations', id],
    MESSAGES: (conversationId: string) => ['chat', 'messages', conversationId],
  },
  GAMIFICATION: {
    BALANCE: ['gamification', 'balance'],
    HISTORY: ['gamification', 'history'],
    LEVELS: ['gamification', 'levels'],
    RULES: ['gamification', 'rules'],
  },
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  VIAJERO: 'VIAJERO',
  PROVEEDOR: 'PROVEEDOR',
  ADMIN: 'ADMIN',
} as const;

/**
 * User status
 */
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

/**
 * Booking status
 */
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  REFUNDED: 'REFUNDED',
} as const;

/**
 * Experience categories
 */
export const EXPERIENCE_CATEGORIES = [
  { value: 'ADVENTURE', label: 'Aventura' },
  { value: 'CULTURE', label: 'Cultura' },
  { value: 'GASTRONOMY', label: 'Gastronomía' },
  { value: 'NATURE', label: 'Naturaleza' },
  { value: 'BEACH', label: 'Playa' },
  { value: 'CITY', label: 'Ciudad' },
  { value: 'RURAL', label: 'Rural' },
  { value: 'EXTREME', label: 'Deportes Extremos' },
  { value: 'RELAX', label: 'Relax' },
  { value: 'FAMILY', label: 'Familia' },
] as const;

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: (id?: string) => (id ? `/profile/${id}` : '/profile'),
  EXPERIENCES: '/experiences',
  EXPERIENCE_DETAIL: (id: string) => `/experiences/${id}`,
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: (id: string) => `/bookings/${id}`,
  CHAT: '/chat',
  CHAT_CONVERSATION: (id: string) => `/chat/${id}`,
  SOCIAL: '/social',
  SEARCH: '/search',
  SETTINGS: '/settings',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: "dd 'de' MMMM 'de' yyyy",
  WITH_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
} as const;

/**
 * Currency format
 */
export const CURRENCY = {
  CODE: 'COP',
  SYMBOL: '$',
  LOCALE: 'es-CO',
} as const;
