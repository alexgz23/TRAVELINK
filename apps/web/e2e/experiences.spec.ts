import { test, expect } from '@playwright/test';

test.describe('Experiences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage with search', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Vive experiencias');
    await expect(page.locator('input[placeholder*="destino"]')).toBeVisible();
    await expect(page.locator('button:has-text("Buscar")')).toBeVisible();
  });

  test('should search experiences', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="destino"]');
    await searchInput.fill('Bogotá');

    // Mock the API response
    await page.route('**/api/experiences?*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
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
          ],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
          },
        }),
      });
    });

    await page.click('button:has-text("Buscar")');
    await expect(page).toHaveURL(/.*experiences.*q=Bogot/);
    await expect(page.locator('text=Tour por Bogotá')).toBeVisible();
  });

  test('should filter experiences by category', async ({ page }) => {
    await page.goto('/experiences');

    // Mock the API response
    await page.route('**/api/experiences?*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: '1',
              title: 'Parapente en Chicamocha',
              shortDescription: 'Aventura extrema',
              price: 150000,
              rating: 5.0,
              reviewCount: 20,
              images: ['/images/parapente.jpg'],
              category: 'ADVENTURE',
            },
          ],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
          },
        }),
      });
    });

    await page.click('button:has-text("Aventura")');
    await expect(page).toHaveURL(/.*category=ADVENTURE/);
    await expect(page.locator('text=Parapente en Chicamocha')).toBeVisible();
  });

  test('should display experience details', async ({ page }) => {
    // Mock the API response for single experience
    await page.route('**/api/experiences/1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          title: 'Tour por Bogotá',
          description: 'Descripción completa del tour por Bogotá',
          shortDescription: 'Conoce la capital',
          price: 100000,
          duration: 4,
          maxGroupSize: 10,
          difficulty: 'EASY',
          rating: 4.5,
          reviewCount: 10,
          images: ['/images/bogota1.jpg', '/images/bogota2.jpg'],
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
        }),
      });
    });

    await page.goto('/experiences/1');

    await expect(page.locator('h1:has-text("Tour por Bogotá")')).toBeVisible();
    await expect(page.locator('text=$100.000')).toBeVisible();
    await expect(page.locator('text=4 horas')).toBeVisible();
    await expect(page.locator('text=10 personas máx')).toBeVisible();
  });

  test('should display experience gallery', async ({ page }) => {
    await page.route('**/api/experiences/1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          title: 'Tour por Bogotá',
          images: [
            '/images/bogota1.jpg',
            '/images/bogota2.jpg',
            '/images/bogota3.jpg',
          ],
          price: 100000,
          rating: 4.5,
          reviewCount: 10,
        }),
      });
    });

    await page.goto('/experiences/1');
    const images = page.locator('img[alt*="Tour por Bogotá"]');
    await expect(images).toHaveCount(3);
  });

  test('should show booking sidebar on experience page', async ({ page }) => {
    await page.route('**/api/experiences/1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          title: 'Tour por Bogotá',
          price: 100000,
          rating: 4.5,
          reviewCount: 10,
        }),
      });
    });

    await page.goto('/experiences/1');

    await expect(page.locator('text=$100.000')).toBeVisible();
    await expect(page.locator('button:has-text("Reservar")')).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.locator('input[type="number"]')).toBeVisible();
  });

  test('should navigate to booking page when clicking reserve', async ({ page, context }) => {
    // Setup logged in state
    await context.addCookies([
      {
        name: 'auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.route('**/api/experiences/1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          title: 'Tour por Bogotá',
          price: 100000,
        }),
      });
    });

    await page.goto('/experiences/1');
    await page.click('button:has-text("Reservar")');
    await expect(page).toHaveURL(/.*booking\/new\?experienceId=1/);
  });

  test('should paginate experiences list', async ({ page }) => {
    await page.goto('/experiences');

    // Mock the first page
    await page.route('**/api/experiences?page=1*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: Array(10).fill(null).map((_, i) => ({
            id: String(i + 1),
            title: `Experience ${i + 1}`,
            price: 100000,
            rating: 4.5,
            reviewCount: 10,
          })),
          meta: {
            total: 25,
            page: 1,
            limit: 10,
            hasNextPage: true,
          },
        }),
      });
    });

    await expect(page.locator('text=Experience 1')).toBeVisible();

    // Click next page
    await page.click('button:has-text("Siguiente")');
    await expect(page).toHaveURL(/.*page=2/);
  });
});
