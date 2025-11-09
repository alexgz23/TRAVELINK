/**
 * Códigos de países soportados
 */
export const SUPPORTED_COUNTRIES = {
  CO: { name: 'Colombia', code: 'CO', currency: 'COP', languages: ['es'] },
  US: { name: 'United States', code: 'US', currency: 'USD', languages: ['en'] },
  MX: { name: 'México', code: 'MX', currency: 'MXN', languages: ['es'] },
  BR: { name: 'Brasil', code: 'BR', currency: 'BRL', languages: ['pt'] },
  AR: { name: 'Argentina', code: 'AR', currency: 'ARS', languages: ['es'] },
  PE: { name: 'Perú', code: 'PE', currency: 'PEN', languages: ['es'] },
  CL: { name: 'Chile', code: 'CL', currency: 'CLP', languages: ['es'] },
  EC: { name: 'Ecuador', code: 'EC', currency: 'USD', languages: ['es'] },
} as const;

/**
 * Monedas soportadas
 */
export const CURRENCIES = {
  COP: { code: 'COP', symbol: '$', name: 'Peso Colombiano', decimals: 0 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  MXN: { code: 'MXN', symbol: '$', name: 'Peso Mexicano', decimals: 2 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Real Brasileño', decimals: 2 },
} as const;

/**
 * Idiomas soportados
 */
export const LANGUAGES = {
  es: { code: 'es', name: 'Español', nativeName: 'Español' },
  en: { code: 'en', name: 'English', nativeName: 'English' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
} as const;
