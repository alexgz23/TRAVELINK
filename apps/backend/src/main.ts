import { NestFactory } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Usar Winston como logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Interceptor de logging global
  app.useGlobalInterceptors(new LoggingInterceptor(logger as any));

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Validation
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

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Port configuration
  const port = process.env.PORT || 4000;

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Viajero Conectado API')
      .setDescription(
        'Ecosistema completo de turismo: Red social + Marketplace de experiencias + Sistema de Puntos + Plataforma Publicitaria + Alianzas B2B + Notificaciones + Reseñas',
      )
      .setVersion('1.0.0')
      .setContact(
        'Viajero Conectado',
        'https://viajeroconectado.com',
        'contact@viajeroconectado.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Autenticación y autorización - Registro, login, JWT')
      .addTag('users', 'Gestión de usuarios - Perfiles, roles, gamificación')
      .addTag('experiences', 'Tours y experiencias - Marketplace de actividades')
      .addTag('bookings', 'Reservas - Gestión de bookings y viajeros')
      .addTag('payments', 'Pagos - Transacciones, reembolsos, métodos de pago')
      .addTag('social', 'Red social - Posts, comentarios, likes, follows')
      .addTag('points', 'Sistema de puntos - Gamificación, niveles, recompensas')
      .addTag('ads', 'Publicidad - Campañas CPC/CPM, métricas')
      .addTag('b2b', 'Alianzas B2B - Contratos, comisiones, transacciones')
      .addTag('notifications', 'Notificaciones - Multi-canal (In-App, Email, Push, SMS)')
      .addTag('reviews', 'Reseñas - Calificaciones, moderación, respuestas')
      .addServer('http://localhost:4000', 'Desarrollo Local')
      .addServer('https://api-staging.viajeroconectado.com', 'Staging')
      .addServer('https://api.viajeroconectado.com', 'Producción')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none',
        filter: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'Viajero Conectado API - Documentación',
      customfavIcon: 'https://viajeroconectado.com/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #2563eb }
      `,
    });
  }

  // Start server
  await app.listen(port);

  logger.log(`🚀 Backend running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔒 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
