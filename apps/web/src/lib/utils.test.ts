import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  calculateDiscountedPrice,
  generateSlug,
  truncateText,
  debounce,
  getInitials,
  validateEmail,
} from './utils';

describe('Utils', () => {
  describe('cn (className merge)', () => {
    it('merges class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'not-included')).toBe(
        'base conditional'
      );
    });

    it('handles tailwind merge conflicts', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
    });
  });

  describe('formatCurrency', () => {
    it('formats COP currency correctly', () => {
      expect(formatCurrency(100000)).toBe('$100.000');
      expect(formatCurrency(1500000)).toBe('$1.500.000');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('handles negative numbers', () => {
      expect(formatCurrency(-50000)).toBe('-$50.000');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toMatch(/15.*ene.*2024/i);
    });

    it('handles string dates', () => {
      expect(formatDate('2024-01-15')).toMatch(/15.*ene.*2024/i);
    });

    it('uses custom format', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats recent times correctly', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      expect(formatRelativeTime(fiveMinutesAgo)).toBe('hace 5 minutos');
    });

    it('formats hours correctly', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      expect(formatRelativeTime(twoHoursAgo)).toBe('hace 2 horas');
    });

    it('formats days correctly', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      expect(formatRelativeTime(threeDaysAgo)).toBe('hace 3 días');
    });
  });

  describe('calculateDiscountedPrice', () => {
    it('calculates discount correctly', () => {
      expect(calculateDiscountedPrice(100000, 500)).toBe(95000);
      expect(calculateDiscountedPrice(200000, 1000)).toBe(190000);
    });

    it('handles zero points', () => {
      expect(calculateDiscountedPrice(100000, 0)).toBe(100000);
    });

    it('does not go below zero', () => {
      expect(calculateDiscountedPrice(100000, 20000)).toBe(0);
    });
  });

  describe('generateSlug', () => {
    it('generates slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('handles special characters', () => {
      expect(generateSlug('Hello, World!')).toBe('hello-world');
    });

    it('handles accents', () => {
      expect(generateSlug('Bogotá y Medellín')).toBe('bogota-y-medellin');
    });

    it('handles multiple spaces', () => {
      expect(generateSlug('Hello    World')).toBe('hello-world');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long...');
    });

    it('does not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    it('handles custom suffix', () => {
      const text = 'This is a long text';
      expect(truncateText(text, 10, '…')).toBe('This is a…');
    });
  });

  describe('debounce', () => {
    it('debounces function calls', async () => {
      let counter = 0;
      const debouncedFn = debounce(() => {
        counter++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(counter).toBe(0);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(counter).toBe(1);
    });
  });

  describe('getInitials', () => {
    it('gets initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('handles single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('handles multiple names', () => {
      expect(getInitials('John Michael Doe')).toBe('JD');
    });

    it('handles empty string', () => {
      expect(getInitials('')).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('validates correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('invalid@domain')).toBe(false);
    });
  });
});
