import { REGEX_PATTERNS } from '../constants';

/**
 * Valida formato de teléfono internacional
 */
export function isValidPhone(phone: string): boolean {
  return REGEX_PATTERNS.PHONE.test(phone);
}

/**
 * Valida contraseña fuerte
 * Mínimo 8 caracteres, una mayúscula, una minúscula, un número
 */
export function isValidPassword(password: string): boolean {
  return REGEX_PATTERNS.PASSWORD.test(password);
}

/**
 * Valida username
 */
export function isValidUsername(username: string): boolean {
  return REGEX_PATTERNS.USERNAME.test(username);
}

/**
 * Valida slug
 */
export function isValidSlug(slug: string): boolean {
  return REGEX_PATTERNS.SLUG.test(slug);
}

/**
 * Valida UUID v4
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida rango de edad
 */
export function isValidAge(age: number, min: number = 0, max: number = 120): boolean {
  return age >= min && age <= max;
}

/**
 * Sanitiza input HTML (básico)
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
