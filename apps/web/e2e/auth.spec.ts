import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.click('text=Iniciar Sesión');
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('h1')).toContainText('Iniciar Sesión');
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=El email es requerido')).toBeVisible();
    await expect(page.locator('text=La contraseña es requerida')).toBeVisible();
  });

  test('should show error on invalid email format', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Mock the API response
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'TRAVELER',
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token',
        }),
      });
    });

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display registration page', async ({ page }) => {
    await page.click('text=Registrarse');
    await expect(page).toHaveURL('/auth/register');
    await expect(page.locator('h1')).toContainText('Crear Cuenta');
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // Mock the API response
    await page.route('**/api/auth/register', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'newuser@example.com',
            name: 'New User',
            role: 'TRAVELER',
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token',
        }),
      });
    });

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different-password');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible();
  });

  test('should logout successfully', async ({ page, context }) => {
    // Setup logged in state
    await context.addCookies([
      {
        name: 'auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');
    await page.click('text=Cerrar Sesión');
    await expect(page).toHaveURL('/');
  });
});
