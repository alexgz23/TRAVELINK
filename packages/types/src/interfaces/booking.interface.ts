import { BookingStatus, TravelerType, DocumentType, Currency } from '../enums';

/**
 * Reserva
 */
export interface IBooking {
  id: string;
  bookingNumber: string;
  userId: string;
  experienceId: string;
  variantId?: string;
  availabilityId?: string;
  bookingDate: Date;
  bookingTime?: string;
  numAdults: number;
  numChildren: number;
  totalAmount: number;
  currency: Currency;
  status: BookingStatus;
  cancellationReason?: string;
  cancelledAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Viajero en reserva
 */
export interface IBookingTraveler {
  id: string;
  bookingId: string;
  type: TravelerType;
  firstName?: string;
  lastName?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  dateOfBirth?: Date;
  nationality?: string;
}

/**
 * Documento de reserva
 */
export interface IBookingDocument {
  id: string;
  bookingId: string;
  type: 'voucher' | 'ticket' | 'insurance' | 'invoice';
  name: string;
  url: string;
  createdAt: Date;
}
