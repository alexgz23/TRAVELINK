import {
  ExperienceCategory,
  DifficultyLevel,
  ExperienceStatus,
  AudienceType,
  Currency,
} from '../enums';

/**
 * Experiencia/Tour
 */
export interface IExperience {
  id: string;
  agencyId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: ExperienceCategory;
  subcategory?: string;
  location: ILocation;
  durationHours?: number;
  difficultyLevel?: DifficultyLevel;
  minAge?: number;
  maxGroupSize?: number;
  languages?: string[];
  priceFrom: number;
  currency: Currency;
  status: ExperienceStatus;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ubicación geográfica
 */
export interface ILocation {
  country: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Variante de experiencia
 */
export interface IExperienceVariant {
  id: string;
  experienceId: string;
  name: string;
  description?: string;
  price: number;
  maxPeople?: number;
  includes?: string[];
  excludes?: string[];
  isDefault: boolean;
}

/**
 * Itinerario día a día
 */
export interface IItineraryDay {
  id: string;
  experienceId: string;
  dayNumber: number;
  title?: string;
  description?: string;
  location?: string;
  meals?: string[];
}

/**
 * Media de experiencia
 */
export interface IExperienceMedia {
  id: string;
  experienceId: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  displayOrder: number;
}

/**
 * Disponibilidad
 */
export interface IAvailability {
  id: string;
  experienceId: string;
  variantId?: string;
  date: Date;
  time?: string;
  availableSpots: number;
  priceOverride?: number;
  status: 'available' | 'limited' | 'sold_out';
}
