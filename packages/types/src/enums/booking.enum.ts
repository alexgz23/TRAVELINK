/**
 * Estados de reserva
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  NO_SHOW = 'no_show',
}

/**
 * Tipos de viajero en una reserva
 */
export enum TravelerType {
  ADULT = 'adult',
  CHILD = 'child',
  INFANT = 'infant',
}

/**
 * Tipos de documento
 */
export enum DocumentType {
  PASSPORT = 'passport',
  ID_CARD = 'id_card',
  DRIVER_LICENSE = 'driver_license',
  OTHER = 'other',
}
