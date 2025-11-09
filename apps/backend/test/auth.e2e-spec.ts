import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, cleanDatabase, closeTestApp } from './test-utils';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/auth/register', () => {
    const validRegisterDto = {
      email: 'test@example.com',
      password: 'Test123456',
      displayName: 'Test User',
      role: 'viajero',
    };

    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validRegisterDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(validRegisterDto.email);
          expect(res.body.user.role).toBe(validRegisterDto.role);
          expect(res.body.user).not.toHaveProperty('passwordHash');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...validRegisterDto,
          email: 'invalid-email',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...validRegisterDto,
          password: '123',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail when email already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validRegisterDto)
        .expect(HttpStatus.CREATED);

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validRegisterDto)
        .expect(HttpStatus.CONFLICT);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /api/auth/login', () => {
    const userCredentials = {
      email: 'login@example.com',
      password: 'LoginTest123',
    };

    beforeEach(async () => {
      // Register a user for login tests
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...userCredentials,
          displayName: 'Login Test User',
          role: 'viajero',
        });
    });

    it('should login successfully with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(userCredentials)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(userCredentials.email);
        });
    });

    it('should fail with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: 'WrongPassword123',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail with missing credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'refresh@example.com',
          password: 'RefreshTest123',
          displayName: 'Refresh Test User',
          role: 'viajero',
        });

      refreshToken = response.body.refreshToken;
      accessToken = response.body.accessToken;
    });

    it('should refresh tokens successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.accessToken).not.toBe(accessToken);
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Protected routes', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'protected@example.com',
          password: 'Protected123',
          displayName: 'Protected User',
          role: 'viajero',
        });

      accessToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('should access protected route with valid token', () => {
      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);
    });

    it('should fail to access protected route without token', () => {
      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail to access protected route with invalid token', () => {
      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
