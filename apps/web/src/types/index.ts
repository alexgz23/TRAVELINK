/**
 * TypeScript types and interfaces for Viajero Conectado
 */

// ========================================
// User & Auth Types
// ========================================

export type UserRole = 'VIAJERO' | 'PROVEEDOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile: UserProfile;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  phone?: string;
  dateOfBirth?: Date;
  nationality?: string;
  city?: string;
  country?: string;
  languages?: string[];
  website?: string;
  socialLinks?: Record<string, string>;
  totalPoints?: number;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  experienceCount?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RegisterDto {
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ========================================
// Experience Types
// ========================================

export type ExperienceCategory =
  | 'ADVENTURE'
  | 'CULTURE'
  | 'GASTRONOMY'
  | 'NATURE'
  | 'BEACH'
  | 'CITY'
  | 'RURAL'
  | 'EXTREME'
  | 'RELAX'
  | 'FAMILY';

export interface Experience {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: ExperienceCategory;
  tags: string[];
  location: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  price: number;
  discountPrice?: number;
  currency: string;
  duration: number;
  durationUnit: 'HOURS' | 'DAYS';
  maxGroupSize: number;
  minAge?: number;
  difficulty?: 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';
  providerId: string;
  provider?: User;
  images: string[];
  coverImage?: string;
  included: string[];
  excluded: string[];
  requirements: string[];
  cancellationPolicy: string;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  bookingCount: number;
  viewCount: number;
  availability?: ExperienceAvailability[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceAvailability {
  id: string;
  experienceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  availableSlots: number;
  bookedSlots: number;
  price?: number;
  isAvailable: boolean;
}

// ========================================
// Booking Types
// ========================================

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'CASH' | 'POINTS';

export interface Booking {
  id: string;
  experienceId: string;
  experience?: Experience;
  userId: string;
  user?: User;
  availabilityId?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  numberOfPeople: number;
  totalPrice: number;
  discountAmount?: number;
  pointsUsed?: number;
  finalPrice: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  payment?: Payment;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  providerResponse?: Record<string, any>;
  failureReason?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// Review Types
// ========================================

export interface Review {
  id: string;
  experienceId: string;
  experience?: Experience;
  userId: string;
  user?: User;
  bookingId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  likeCount: number;
  isVerifiedBooking: boolean;
  providerResponse?: string;
  providerResponseAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// Social Types
// ========================================

export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'SHARED_EXPERIENCE';

export interface Post {
  id: string;
  userId: string;
  user?: User;
  type: PostType;
  content: string;
  images?: string[];
  videoUrl?: string;
  experienceId?: string;
  experience?: Experience;
  location?: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  parentId?: string;
  content: string;
  likeCount: number;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Follow {
  followerId: string;
  follower?: User;
  followingId: string;
  following?: User;
  createdAt: Date;
}

// ========================================
// Chat Types
// ========================================

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'BOOKING_INQUIRY' | 'SYSTEM';

export interface Conversation {
  id: string;
  participantIds: string[];
  participants?: User[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  type: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  metadata?: Record<string, any>;
  readBy: string[];
  isRead?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// Points Types
// ========================================

export type PointsEventType =
  | 'BOOKING_COMPLETED'
  | 'REVIEW_WRITTEN'
  | 'REFERRAL'
  | 'PROFILE_COMPLETED'
  | 'SOCIAL_SHARE'
  | 'POINTS_REDEEMED'
  | 'MANUAL_ADJUSTMENT';

export interface PointsBalance {
  userId: string;
  totalPoints: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  updatedAt: Date;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  eventType: PointsEventType;
  points: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// ========================================
// Search Types
// ========================================

export interface SearchFilters {
  q?: string;
  category?: ExperienceCategory;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  country?: string;
  rating?: number;
  difficulty?: string;
  duration?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  facets?: Record<string, any>;
  searchTimeMs?: number;
}

// ========================================
// Pagination Types
// ========================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ========================================
// Notification Types
// ========================================

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'REVIEW_RECEIVED'
  | 'NEW_FOLLOWER'
  | 'POST_LIKED'
  | 'POST_COMMENTED'
  | 'MESSAGE_RECEIVED'
  | 'POINTS_EARNED'
  | 'EXPERIENCE_UPDATE';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// ========================================
// API Response Types
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
