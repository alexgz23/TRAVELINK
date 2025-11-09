import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, cleanDatabase, closeTestApp } from './test-utils';

describe('Experiences (e2e)', () => {
  let app: INestApplication;
  let agencyToken: string;
  let agencyId: string;
  let viajeroToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(app);

    // Register agency user
    const agencyResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'agency@example.com',
        password: 'Agency123',
        displayName: 'Test Agency',
        role: 'agencia',
      });

    agencyToken = agencyResponse.body.accessToken;
    agencyId = agencyResponse.body.user.id;

    // Register viajero user
    const viajeroResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'viajero@example.com',
        password: 'Viajero123',
        displayName: 'Test Viajero',
        role: 'viajero',
      });

    viajeroToken = viajeroResponse.body.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/experiences', () => {
    const validExperienceDto = {
      title: 'Amazing Tour in Cartagena',
      description: 'Discover the historic center of Cartagena with our expert guides',
      shortDescription: 'Historic center tour',
      category: 'tour',
      location: {
        country: 'Colombia',
        city: 'Cartagena',
        address: 'Plaza de Bolívar',
        latitude: 10.423,
        longitude: -75.543,
      },
      durationHours: 4,
      difficultyLevel: 'easy',
      minAge: 5,
      maxGroupSize: 15,
      languages: ['es', 'en'],
      priceFrom: 50000,
      currency: 'COP',
    };

    it('should create experience as agency', () => {
      return request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send(validExperienceDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('slug');
          expect(res.body.title).toBe(validExperienceDto.title);
          expect(res.body.status).toBe('draft');
          expect(res.body.agencyId).toBe(agencyId);
        });
    });

    it('should fail to create experience as viajero', () => {
      return request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send(validExperienceDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should fail to create experience without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/experiences')
        .send(validExperienceDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Incomplete Experience',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail with invalid category', () => {
      return request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          ...validExperienceDto,
          category: 'invalid_category',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/experiences', () => {
    beforeEach(async () => {
      // Create multiple experiences
      await request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Tour 1',
          description: 'Description 1',
          shortDescription: 'Short 1',
          category: 'tour',
          location: {
            country: 'Colombia',
            city: 'Cartagena',
            address: 'Centro',
            latitude: 10.4,
            longitude: -75.5,
          },
          durationHours: 2,
          difficultyLevel: 'easy',
          minAge: 0,
          maxGroupSize: 10,
          languages: ['es'],
          priceFrom: 30000,
          currency: 'COP',
        });

      const exp2 = await request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Tour 2',
          description: 'Description 2',
          shortDescription: 'Short 2',
          category: 'activity',
          location: {
            country: 'Colombia',
            city: 'Bogotá',
            address: 'Centro',
            latitude: 4.7,
            longitude: -74.1,
          },
          durationHours: 3,
          difficultyLevel: 'moderate',
          minAge: 12,
          maxGroupSize: 8,
          languages: ['es', 'en'],
          priceFrom: 80000,
          currency: 'COP',
        });

      // Publish one experience
      await request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Published Tour',
          description: 'This is published',
          shortDescription: 'Published',
          category: 'tour',
          location: {
            country: 'Colombia',
            city: 'Medellín',
            address: 'Poblado',
            latitude: 6.2,
            longitude: -75.6,
          },
          durationHours: 5,
          difficultyLevel: 'hard',
          minAge: 18,
          maxGroupSize: 6,
          languages: ['es'],
          priceFrom: 150000,
          currency: 'COP',
        })
        .then(async (res) => {
          const expId = res.body.id;

          // Add variant
          await request(app.getHttpServer())
            .post(`/api/experiences/${expId}/variants`)
            .set('Authorization', `Bearer ${agencyToken}`)
            .send({
              name: 'Standard',
              description: 'Standard variant',
              price: 150000,
              currency: 'COP',
              maxParticipants: 6,
              isActive: true,
            });

          // Add media
          await request(app.getHttpServer())
            .post(`/api/experiences/${expId}/media`)
            .set('Authorization', `Bearer ${agencyToken}`)
            .send({
              type: 'image',
              url: 'https://example.com/image.jpg',
              isPrimary: true,
            });

          // Publish
          await request(app.getHttpServer())
            .patch(`/api/experiences/${expId}/publish`)
            .set('Authorization', `Bearer ${agencyToken}`);
        });
    });

    it('should get all published experiences', () => {
      return request(app.getHttpServer())
        .get('/api/experiences')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(Array.isArray(res.body.items)).toBe(true);
          // Only published experiences should be returned
          expect(res.body.items.length).toBeGreaterThan(0);
          res.body.items.forEach((exp: any) => {
            expect(exp.status).toBe('published');
          });
        });
    });

    it('should filter experiences by category', () => {
      return request(app.getHttpServer())
        .get('/api/experiences?category=tour')
        .expect(HttpStatus.OK)
        .expect((res) => {
          res.body.items.forEach((exp: any) => {
            expect(exp.category).toBe('tour');
          });
        });
    });

    it('should filter experiences by city', () => {
      return request(app.getHttpServer())
        .get('/api/experiences?city=Medellín')
        .expect(HttpStatus.OK)
        .expect((res) => {
          res.body.items.forEach((exp: any) => {
            expect(exp.locationCity).toContain('Medellín');
          });
        });
    });

    it('should paginate results', () => {
      return request(app.getHttpServer())
        .get('/api/experiences?page=1&limit=10')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
        });
    });
  });

  describe('GET /api/experiences/:id', () => {
    let experienceId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Specific Tour',
          description: 'Specific description',
          shortDescription: 'Specific',
          category: 'tour',
          location: {
            country: 'Colombia',
            city: 'Cartagena',
            address: 'Centro',
            latitude: 10.4,
            longitude: -75.5,
          },
          durationHours: 2,
          difficultyLevel: 'easy',
          minAge: 0,
          maxGroupSize: 10,
          languages: ['es'],
          priceFrom: 50000,
          currency: 'COP',
        });

      experienceId = response.body.id;
    });

    it('should get experience by id', () => {
      return request(app.getHttpServer())
        .get(`/api/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toBe(experienceId);
          expect(res.body.title).toBe('Specific Tour');
        });
    });

    it('should fail to get non-existent experience', () => {
      return request(app.getHttpServer())
        .get('/api/experiences/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/experiences/:id', () => {
    let experienceId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Original Title',
          description: 'Original description',
          shortDescription: 'Original',
          category: 'tour',
          location: {
            country: 'Colombia',
            city: 'Cartagena',
            address: 'Centro',
            latitude: 10.4,
            longitude: -75.5,
          },
          durationHours: 2,
          difficultyLevel: 'easy',
          minAge: 0,
          maxGroupSize: 10,
          languages: ['es'],
          priceFrom: 50000,
          currency: 'COP',
        });

      experienceId = response.body.id;
    });

    it('should update experience as owner', () => {
      return request(app.getHttpServer())
        .patch(`/api/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Updated Title',
          priceFrom: 60000,
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Title');
          expect(res.body.priceFrom).toBe(60000);
        });
    });

    it('should fail to update experience as non-owner', () => {
      return request(app.getHttpServer())
        .patch(`/api/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${viajeroToken}`)
        .send({
          title: 'Hacked Title',
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('DELETE /api/experiences/:id', () => {
    let experienceId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/experiences')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'To Delete',
          description: 'Will be deleted',
          shortDescription: 'Delete me',
          category: 'tour',
          location: {
            country: 'Colombia',
            city: 'Cartagena',
            address: 'Centro',
            latitude: 10.4,
            longitude: -75.5,
          },
          durationHours: 2,
          difficultyLevel: 'easy',
          minAge: 0,
          maxGroupSize: 10,
          languages: ['es'],
          priceFrom: 50000,
          currency: 'COP',
        });

      experienceId = response.body.id;
    });

    it('should delete experience as owner', () => {
      return request(app.getHttpServer())
        .delete(`/api/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(HttpStatus.OK);
    });

    it('should fail to delete experience as non-owner', () => {
      return request(app.getHttpServer())
        .delete(`/api/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${viajeroToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should fail to delete non-existent experience', () => {
      return request(app.getHttpServer())
        .delete('/api/experiences/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
