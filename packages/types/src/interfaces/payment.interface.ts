import { PaymentStatus, PaymentProvider, PaymentMethod, Currency } from '../enums';

/**
 * Pago
 */
export interface IPayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerPaymentId?: string;
  providerCustomerId?: string;
  paymentMethod: PaymentMethod;
  feeAmount?: number;
  netAmount?: number;
  refundAmount?: number;
  refundedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos de pago para split (marketplace)
 */
export interface IPaymentSplit {
  recipientId: string; // ID del proveedor
  amount: number;
  percentage?: number;
}
