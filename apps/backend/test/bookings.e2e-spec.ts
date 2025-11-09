import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, cleanDatabase, closeTestApp } from './test-utils';

describe('Bookings (e2e)', () => {
  let app: INestApplication;
  let agencyToken: string;
  let agencyId: string;
  let viajeroToken: string;
  let viajeroId: string;
  let publishedExperienceId: string;
  let variantId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(app);

    // Register agency user
    const agencyResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'booking-agency@example.com',
        password: 'Agency123',
        displayName: 'Booking Agency',
        role: 'agencia',
      });

    agencyToken = agencyResponse.body.accessToken;
    agencyId = agencyResponse.body.user.id;

    // Register viajero user
    const viajeroResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'booking-viajero@example.com',
        password: 'Viajero123',
        displayName: 'Booking Viajero',
        role: 'viajero',
      });

    viajeroToken = viajeroResponse.body.accessToken;
    viajeroId = viajeroResponse.body.user.id;

    // Create and publish an experience
    const expResponse = await request(app.getHttpServer())
      .post('/api/experiences')
      .set('Authorization', `Bearer ${agencyToken}`)
      .send({
        title: 'Bookable Tour',
        description: 'A tour that can be booked',
        shortDescription: 'Bookable',
        category: 'tour',
        location: {
          country: 'Colombia',
          city: 'Cartagena',
          address: 'Centro',
          latitude: 10.4,
          longitude: -75.5,
        },
        durationHours: 4,
        difficultyLevel: 'easy',
        minAge: 0,
        maxGroupSize: 10,
        languages: ['es', 'en'],
        priceFrom: 100000,
        currency: 'COP',
      });

    publishedExperienceId = expResponse.body.id;

    // Add variant
    const variantResponse = await request(app.getHttpServer())
      .post(`/api/experiences/${publishedExperienceId}/variants`)
      .set('Authorization', `Bearer ${agencyToken}`)
      .send({
        name: 'Standard Package',
        description: 'Standard tour package',
        price: 100000,
        currency: 'COP',
        maxParticipants: 10,
        isActive: true,
      });

    variantId = variantResponse.body.id;

    // Add media
    await request(app.getHttpServer())
      .post(`/api/experiences/${publishedExperienceId}/media`)
      .set('Authorization', `Bearer ${agencyToken}`)
      .send({
        type: 'image',
        url: 'https://example.com/tour.jpg',
        isPrimary: true,
      });

    // Publish experience
    await request(app.getHttpServer())
      .patch(`/api/experiences/${publishedExperienceId}/publish`)
      .set('Authorization', `Bearer ${agencyToken}`);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/bookings', () => {
    const validBookingDto = {
      experienceId: '',
      variantId: '',
      bookingDate: '2025-12-25',
      bookingTime: '10:00',
      numAdults: 2,
      numChildren: 1,
      totalAmount: 100000,
      currency: 'COP',
    };

    beforeEach(() => {
      validBookingDto.experienceId = publishedExperienceId;
      validBookingDto.variantId = variantId;
    });

    it('should create booking as viajero', () => {
      return request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send(validBookingDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('bookingNumber');
          expect(res.body.userId).toBe(viajeroId);
          expect(res.body.experienceId).toBe(publishedExperienceId);
          expect(res.body.status).toBe('pending');
          expect(res.body.totalAmount).toBe(validBookingDto.totalAmount);
        });
    });

    it('should fail to create booking without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/bookings')
        .send(validBookingDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          experienceId: publishedExperienceId,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail with invalid date', () => {
      return request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          ...validBookingDto,
          bookingDate: 'invalid-date',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/bookings/user', () => {
    beforeEach(async () => {
      // Create multiple bookings for viajero
      await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          experienceId: publishedExperienceId,
          variantId: variantId,
          bookingDate: '2025-12-25',
          bookingTime: '10:00',
          numAdults: 2,
          totalAmount: 100000,
          currency: 'COP',
        });

      await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          experienceId: publishedExperienceId,
          variantId: variantId,
          bookingDate: '2025-12-26',
          bookingTime: '14:00',
          numAdults: 1,
          totalAmount: 50000,
          currency: 'COP',
        });
    });

    it('should get user bookings', () => {
      return request(app.getHttpServer())
        .get('/api/bookings/user')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBeGreaterThan(0);
          res.body.items.forEach((booking: any) => {
            expect(booking.userId).toBe(viajeroId);
          });
        });
    });

    it('should filter user bookings by status', () => {
      return request(app.getHttpServer())
        .get('/api/bookings/user?status=pending')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          res.body.items.forEach((booking: any) => {
            expect(booking.status).toBe('pending');
          });
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/bookings/user')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/bookings/agency', () => {
    beforeEach(async () => {
      // Create booking for agency's experience
      await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          experienceId: publishedExperienceId,
          variantId: variantId,
          bookingDate: '2025-12-25',
          bookingTime: '10:00',
          numAdults: 2,
          totalAmount: 100000,
          currency: 'COP',
        });
    });

    it('should get agency bookings', () => {
      return request(app.getHttpServer())
        .get('/api/bookings/agency')
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });

    it('should fail as viajero', () => {
      return request(app.getHttpServer())
        .get('/api/bookings/agency')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('GET /api/bookings/:id', () => {
    let bookingId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          experienceId: publishedExperienceId,
          variantId: variantId,
          bookingDate: '2025-12-25',
          bookingTime: '10:00',
          numAdults: 2,
          totalAmount: 100000,
          currency: 'COP',
        });

      bookingId = response.body.id;
    });

    it('should get booking by id as owner', () => {
      return request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${viajeroToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toBe(bookingId);
          expect(res.body.userId).toBe(viajeroId);
        });
    });

    it('should get booking by id as agency', () => {
      return request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toBe(bookingId);
        });
    });

    it('should fail to get non-existent booking', () => {
      return request(app.getHttpServer())
        .get('/api/bookings/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/bookings/:id/confirm', () => {
    let bookingId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          experienceId: publishedExperienceId,
          variantId: variantId,
          bookingDate: '2025-12-25',
          bookingTime: '10:00',
          numAdults: 2,
          totalAmount: 100000,
          currency: 'COP',
        });

      bookingId = response.body.id;
    });

    it('should confirm booking as agency', () => {
      return request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.status).toBe('confirmed');
          expect(res.body).toHaveProperty('confirmedAt');
        });
    });

    it('should fail to confirm as viajero', () => {
      return request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${viajeroToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('PATCH /api/bookings/:id/complete', () => {
    let bookingId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          experienceId: publishedExperienceId,
          variantId: variantId,
          bookingDate: '2025-12-25',
          bookingTime: '10:00',
          numAdults: 2,
          totalAmount: 100000,
          currency: 'COP',
        });

      bookingId = response.body.id;

      // First confirm the booking
      await request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${agencyToken}`);
    });

    it('should complete confirmed booking as agency', () => {
      return request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/complete`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.status).toBe('completed');
          expect(res.body).toHaveProperty('completedAt');
        });
    });

    it('should fail to complete as viajero', () => {
      return request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/complete`)
        .set('Authorization', `Bearer ${viajeroToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('PATCH /api/bookings/:id/cancel', () => {
    let bookingId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          experienceId: publishedExperienceId,
          variantId: variantId,
          bookingDate: '2025-12-25',
          bookingTime: '10:00',
          numAdults: 2,
          totalAmount: 100000,
          currency: 'COP',
        });

      bookingId = response.body.id;
    });

    it('should cancel booking as viajero', () => {
      return request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          reason: 'Change of plans',
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.status).toBe('cancelled');
          expect(res.body.cancellationReason).toBe('Change of plans');
        });
    });

    it('should cancel booking as agency', () => {
      return request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          reason: 'Experience cancelled',
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.status).toBe('cancelled');
          expect(res.body.cancellationReason).toBe('Experience cancelled');
        });
    });

    it('should fail to cancel completed booking', async () => {
      // Confirm booking
      await request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${agencyToken}`);

      // Complete booking
      await request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/complete`)
        .set('Authorization', `Bearer ${agencyToken}`);

      // Try to cancel
      return request(app.getHttpServer())
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          reason: 'Too late',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
