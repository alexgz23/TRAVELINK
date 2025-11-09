import { Currency } from '@viajero-conectado/types';
import { CURRENCIES } from '../constants';

/**
 * Formatea un monto con su símbolo de moneda
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) return amount.toString();

  const formatted = amount.toLocaleString('es-CO', {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  });

  return `${currencyInfo.symbol}${formatted}`;
}

/**
 * Convierte cantidad a centavos (para Stripe)
 */
export function toCents(amount: number, currency: Currency): number {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) return amount;

  // COP no usa decimales
  if (currency === Currency.COP) return Math.round(amount);

  return Math.round(amount * Math.pow(10, currencyInfo.decimals));
}

/**
 * Convierte centavos a cantidad decimal
 */
export function fromCents(cents: number, currency: Currency): number {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) return cents;

  if (currency === Currency.COP) return cents;

  return cents / Math.pow(10, currencyInfo.decimals);
}

/**
 * Calcula porcentaje de un monto
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return (amount * percentage) / 100;
}

/**
 * Calcula comisión de plataforma
 */
export function calculatePlatformFee(amount: number, feePercentage: number = 10): number {
  return calculatePercentage(amount, feePercentage);
}

/**
 * Calcula monto neto después de comisión
 */
export function calculateNetAmount(amount: number, feePercentage: number = 10): number {
  const fee = calculatePlatformFee(amount, feePercentage);
  return amount - fee;
}
