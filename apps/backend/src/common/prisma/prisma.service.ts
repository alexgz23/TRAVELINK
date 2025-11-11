import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Order matters due to foreign key constraints
    const models = [
      'message',
      'conversationParticipant',
      'conversation',
      'comment',
      'like',
      'post',
      'review',
      'booking',
      'experience',
      'refreshToken',
      'user',
    ];

    for (const model of models) {
      await this[model].deleteMany({});
    }
  }
}
