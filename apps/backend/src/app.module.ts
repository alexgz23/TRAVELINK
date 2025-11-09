import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database - PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'viajero_conectado',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
      logging: process.env.NODE_ENV === 'development',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 10, // 10 requests
      },
    ]),

    // Modules
    // TODO: Import feature modules here
    // AuthModule,
    // UsersModule,
    // ExperiencesModule,
    // BookingsModule,
    // SocialModule,
    // B2BModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
