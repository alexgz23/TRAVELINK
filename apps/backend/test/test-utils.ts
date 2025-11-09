import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

/**
 * Crear aplicación de testing E2E
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Aplicar configuraciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return app;
}

/**
 * Limpiar base de datos de testing
 */
export async function cleanDatabase(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.clear();
  }
}

/**
 * Cerrar aplicación de testing
 */
export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
}

/**
 * Helper para esperar un tiempo específico
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
