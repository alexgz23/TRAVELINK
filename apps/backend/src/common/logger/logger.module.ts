import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logger.service';
import { winstonConfig } from './winston.config';

/**
 * Módulo global de logging
 * Proporciona LoggerService en toda la aplicación
 */
@Global()
@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
