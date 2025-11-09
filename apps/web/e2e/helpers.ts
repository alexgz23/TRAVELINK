import { Page } from '@playwright/test';

/**
 * E2E Test Helpers
 */

export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function logout(page: Page) {
  await page.click('text=Cerrar Sesión');
  await page.waitForURL('/');
}

export function mockAuthAPI(page: Page, user = {}) {
  const defaultUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'TRAVELER',
    points: 1000,
    ...user,
  };

  page.route('**/api/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: defaultUser,
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
      }),
    });
  });

  page.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(defaultUser),
    });
  });
}

export function mockExperiencesAPI(page: Page, experiences: any[] = []) {
  const defaultExperiences = experiences.length > 0 ? experiences : [
    {
      id: '1',
      title: 'Tour por Bogotá',
      shortDescription: 'Conoce la capital',
      price: 100000,
      rating: 4.5,
      reviewCount: 10,
      images: ['/images/bogota.jpg'],
      category: 'CULTURAL',
    },
  ];

  page.route('**/api/experiences?*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: defaultExperiences,
        meta: {
          total: defaultExperiences.length,
          page: 1,
          limit: 10,
          hasNextPage: false,
        },
      }),
    });
  });
}

export function mockExperienceAPI(page: Page, experienceId: string, data: any = {}) {
  const defaultExperience = {
    id: experienceId,
    title: 'Tour por Bogotá',
    description: 'Descripción completa del tour',
    shortDescription: 'Conoce la capital',
    price: 100000,
    duration: 4,
    maxGroupSize: 10,
    difficulty: 'EASY',
    rating: 4.5,
    reviewCount: 10,
    images: ['/images/bogota.jpg'],
    category: 'CULTURAL',
    location: {
      city: 'Bogotá',
      country: 'Colombia',
      coordinates: { lat: 4.6097, lng: -74.0817 },
    },
    includedItems: ['Transporte', 'Guía'],
    excludedItems: ['Comida'],
    requirements: ['Mayores de 18 años'],
    languages: ['es', 'en'],
    ...data,
  };

  page.route(`**/api/experiences/${experienceId}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(defaultExperience),
    });
  });
}

export function mockBookingAPI(page: Page, bookingId: string = 'booking-123') {
  page.route('**/api/bookings', (route) => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: bookingId,
        experienceId: '1',
        userId: '1',
        date: new Date().toISOString(),
        numberOfPeople: 2,
        totalPrice: 200000,
        status: 'PENDING',
      }),
    });
  });

  page.route(`**/api/bookings/${bookingId}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: bookingId,
        experienceId: '1',
        userId: '1',
        date: new Date().toISOString(),
        numberOfPeople: 2,
        totalPrice: 200000,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      }),
    });
  });
}

export async function waitForToast(page: Page, message: string) {
  await page.waitForSelector(`text=${message}`, { timeout: 5000 });
}

export async function fillBookingForm(page: Page, data: {
  date?: string;
  people?: number;
  name?: string;
  email?: string;
  phone?: string;
}) {
  if (data.date) {
    await page.fill('input[name="date"]', data.date);
  }
  if (data.people) {
    await page.fill('input[name="numberOfPeople"]', String(data.people));
  }
  if (data.name) {
    await page.fill('input[name="contactName"]', data.name);
  }
  if (data.email) {
    await page.fill('input[name="contactEmail"]', data.email);
  }
  if (data.phone) {
    await page.fill('input[name="contactPhone"]', data.phone);
  }
}

export async function createBooking(page: Page, experienceId: string = '1') {
  await page.goto(`/booking/new?experienceId=${experienceId}`);

  await fillBookingForm(page, {
    date: '2024-02-15',
    people: 2,
  });

  await page.click('button:has-text("Continuar")');

  await fillBookingForm(page, {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+57 300 123 4567',
  });

  await page.click('button:has-text("Continuar")');
  await page.click('button:has-text("Confirmar Reserva")');

  return page.url().match(/booking\/([^\/]+)\/payment/)?.[1];
}
