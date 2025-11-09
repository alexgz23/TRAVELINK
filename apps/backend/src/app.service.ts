import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'viajero-conectado-api',
      version: '0.1.0',
    };
  }
}
