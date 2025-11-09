import { UserRole, UserStatus, UserLevel, Gender } from '../enums';

/**
 * Usuario base
 */
export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  phone?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * Perfil de usuario
 */
export interface IUserProfile {
  userId: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  countryCode?: string;
  city?: string;
  languages?: string[];
  dateOfBirth?: Date;
  gender?: Gender;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Preferencias de viaje
 */
export interface ITravelPreferences {
  userId: string;
  travelStyles?: string[];
  interests?: string[];
  budgetRange?: 'budget' | 'mid' | 'luxury';
  groupPreferences?: string[];
}

/**
 * Puntos de usuario
 */
export interface IUserPoints {
  userId: string;
  currentPoints: number;
  lifetimePoints: number;
  level: UserLevel;
  levelProgress: number;
}

/**
 * Conexión social (seguidor/siguiendo)
 */
export interface IUserConnection {
  followerId: string;
  followingId: string;
  createdAt: Date;
}
