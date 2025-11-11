import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  const corsOrigins = configService.get('CORS_ORIGINS')?.split(',') || [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Viajero Conectado API')
    .setDescription(
      'API documentation for Viajero Conectado - Travel Social Network & Marketplace',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('experiences', 'Experience catalog')
    .addTag('bookings', 'Booking management')
    .addTag('reviews', 'Reviews and ratings')
    .addTag('posts', 'Social feed')
    .addTag('chat', 'Real-time messaging')
    .addTag('uploads', 'File uploads')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Viajero Conectado API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get('PORT') || 4000;
  await app.listen(port);

  console.log(`
    🚀 Server is running!
    🔉 Listening on port ${port}
    📚 API Docs: http://localhost:${port}/api/docs
    🌍 Environment: ${configService.get('NODE_ENV')}
  `);
}

bootstrap();
