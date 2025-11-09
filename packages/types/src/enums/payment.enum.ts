/**
 * Estados de pago
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

/**
 * Proveedores de pago
 */
export enum PaymentProvider {
  STRIPE = 'stripe',
  MERCADOPAGO = 'mercadopago',
  CASH = 'cash',
}

/**
 * Métodos de pago
 */
export enum PaymentMethod {
  CARD = 'card',
  PSE = 'pse',
  EFECTY = 'efecty',
  BALOTO = 'baloto',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

/**
 * Monedas soportadas
 */
export enum Currency {
  COP = 'COP',
  USD = 'USD',
  EUR = 'EUR',
  MXN = 'MXN',
  BRL = 'BRL',
}
