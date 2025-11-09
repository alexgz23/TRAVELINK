import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueName } from '../constants';
import { EmailProcessor } from './email.processor';
import { EmailQueueService } from './email-queue.service';
import { LoggerModule } from '../../common/logger/logger.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.EMAIL,
    }),
    LoggerModule,
  ],
  providers: [EmailProcessor, EmailQueueService],
  exports: [EmailQueueService],
})
export class EmailQueueModule {}
