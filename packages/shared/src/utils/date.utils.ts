/**
 * Formatea una fecha a string ISO
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Agrega días a una fecha
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calcula diferencia en días entre dos fechas
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffTime / oneDay);
}

/**
 * Verifica si una fecha ya pasó
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Verifica si una fecha está en el futuro
 */
export function isFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Verifica si una fecha está entre dos fechas
 */
export function isBetween(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

/**
 * Obtiene inicio del día
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obtiene fin del día
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
