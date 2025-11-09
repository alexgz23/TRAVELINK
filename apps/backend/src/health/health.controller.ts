import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { captureMessage } from '../common/sentry/sentry.config';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('sentry-test')
  @ApiOperation({
    summary: 'Test Sentry integration',
    description: 'Throws an error to test Sentry error tracking. Only available in development.',
  })
  testSentry() {
    if (process.env.NODE_ENV === 'production') {
      return { message: 'Sentry test endpoint is disabled in production' };
    }

    // Enviar mensaje de prueba
    captureMessage('Sentry test message from health endpoint', 'info');

    // Lanzar un error de prueba
    throw new Error('This is a test error for Sentry monitoring');
  }
}
