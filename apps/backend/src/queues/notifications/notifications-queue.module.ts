import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueName } from '../constants';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsQueueService } from './notifications-queue.service';
import { LoggerModule } from '../../common/logger/logger.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.NOTIFICATIONS,
    }),
    LoggerModule,
  ],
  providers: [NotificationsProcessor, NotificationsQueueService],
  exports: [NotificationsQueueService],
})
export class NotificationsQueueModule {}
