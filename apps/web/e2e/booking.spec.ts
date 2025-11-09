import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setup logged in state
    await context.addCookies([
      {
        name: 'auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Mock user data
    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'TRAVELER',
          points: 1000,
        }),
      });
    });
  });

  test('should display booking form', async ({ page }) => {
    await page.goto('/booking/new?experienceId=1&date=2024-02-15&people=2');

    await expect(page.locator('h1')).toContainText('Reservar Experiencia');
    await expect(page.locator('input[name="numberOfPeople"]')).toHaveValue('2');
    await expect(page.locator('input[name="date"]')).toHaveValue('2024-02-15');
  });

  test('should complete booking step 1 - details', async ({ page }) => {
    await page.goto('/booking/new?experienceId=1');

    // Fill in booking details
    await page.fill('input[name="date"]', '2024-02-15');
    await page.fill('input[name="numberOfPeople"]', '2');
    await page.fill('input[name="specialRequests"]', 'Dietary restrictions: vegetarian');

    await page.click('button:has-text("Continuar")');
    await expect(page.locator('text=Paso 2')).toBeVisible();
  });

  test('should complete booking step 2 - contact info', async ({ page }) => {
    await page.goto('/booking/new?experienceId=1&date=2024-02-15&people=2');

    // Navigate to step 2
    await page.click('button:has-text("Continuar")');

    // Fill in contact info
    await page.fill('input[name="contactName"]', 'John Doe');
    await page.fill('input[name="contactEmail"]', 'john@example.com');
    await page.fill('input[name="contactPhone"]', '+57 300 123 4567');

    await page.click('button:has-text("Continuar")');
    await expect(page.locator('text=Paso 3')).toBeVisible();
  });

  test('should display booking summary', async ({ page }) => {
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

    await page.goto('/booking/new?experienceId=1&date=2024-02-15&people=2');

    // Complete steps 1 and 2
    await page.click('button:has-text("Continuar")');
    await page.fill('input[name="contactName"]', 'John Doe');
    await page.fill('input[name="contactEmail"]', 'john@example.com');
    await page.fill('input[name="contactPhone"]', '+57 300 123 4567');
    await page.click('button:has-text("Continuar")');

    // Check summary
    await expect(page.locator('text=Tour por Bogotá')).toBeVisible();
    await expect(page.locator('text=2024-02-15')).toBeVisible();
    await expect(page.locator('text=2 personas')).toBeVisible();
    await expect(page.locator('text=$200.000')).toBeVisible();
  });

  test('should apply points discount', async ({ page }) => {
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

    await page.goto('/booking/new?experienceId=1&date=2024-02-15&people=2');

    // Complete steps 1 and 2
    await page.click('button:has-text("Continuar")');
    await page.fill('input[name="contactName"]', 'John Doe');
    await page.fill('input[name="contactEmail"]', 'john@example.com');
    await page.fill('input[name="contactPhone"]', '+57 300 123 4567');
    await page.click('button:has-text("Continuar")');

    // Apply points
    await page.fill('input[name="pointsToUse"]', '500');
    await page.click('button:has-text("Aplicar puntos")');

    // Check discounted price (200.000 - 5.000 = 195.000)
    await expect(page.locator('text=$195.000')).toBeVisible();
  });

  test('should create booking successfully', async ({ page }) => {
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

    await page.route('**/api/bookings', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'booking-123',
          experienceId: '1',
          date: '2024-02-15',
          numberOfPeople: 2,
          totalPrice: 200000,
          status: 'PENDING',
        }),
      });
    });

    await page.goto('/booking/new?experienceId=1&date=2024-02-15&people=2');

    // Complete all steps
    await page.click('button:has-text("Continuar")');
    await page.fill('input[name="contactName"]', 'John Doe');
    await page.fill('input[name="contactEmail"]', 'john@example.com');
    await page.fill('input[name="contactPhone"]', '+57 300 123 4567');
    await page.click('button:has-text("Continuar")');
    await page.click('button:has-text("Confirmar Reserva")');

    // Should redirect to payment
    await expect(page).toHaveURL(/.*booking\/booking-123\/payment/);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/booking/new?experienceId=1');

    // Try to continue without filling required fields
    await page.click('button:has-text("Continuar")');

    await expect(page.locator('text=La fecha es requerida')).toBeVisible();
    await expect(page.locator('text=El número de personas es requerido')).toBeVisible();
  });

  test('should not allow booking with invalid date (past)', async ({ page }) => {
    await page.goto('/booking/new?experienceId=1');

    await page.fill('input[name="date"]', '2020-01-01');
    await page.fill('input[name="numberOfPeople"]', '2');
    await page.click('button:has-text("Continuar")');

    await expect(page.locator('text=La fecha debe ser futura')).toBeVisible();
  });

  test('should navigate back between steps', async ({ page }) => {
    await page.goto('/booking/new?experienceId=1&date=2024-02-15&people=2');

    // Go to step 2
    await page.click('button:has-text("Continuar")');
    await expect(page.locator('text=Paso 2')).toBeVisible();

    // Go back to step 1
    await page.click('button:has-text("Atrás")');
    await expect(page.locator('text=Paso 1')).toBeVisible();
  });
});
