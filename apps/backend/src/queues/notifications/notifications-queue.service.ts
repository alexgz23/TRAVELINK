import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueName, JobName } from '../constants';
import { LoggerService } from '../../common/logger/logger.service';
import {
  PushNotificationData,
  InAppNotificationData,
  SmsNotificationData,
} from './notifications.processor';

/**
 * Servicio para encolar trabajos de notificaciones
 */
@Injectable()
export class NotificationsQueueService {
  constructor(
    @InjectQueue(QueueName.NOTIFICATIONS) private notificationsQueue: Queue,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('NotificationsQueueService');
  }

  /**
   * Enviar push notification
   */
  async sendPushNotification(data: PushNotificationData) {
    this.logger.log(`Enqueuing push notification for user ${data.userId}`, 'NotificationsQueueService');

    await this.notificationsQueue.add(JobName.NOTIFICATION_PUSH, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  /**
   * Crear notificación in-app
   */
  async createInAppNotification(data: InAppNotificationData) {
    this.logger.log(`Enqueuing in-app notification for user ${data.userId}`, 'NotificationsQueueService');

    await this.notificationsQueue.add(JobName.NOTIFICATION_IN_APP, data, {
      attempts: 2,
      removeOnComplete: false, // Mantener registro
    });
  }

  /**
   * Enviar SMS
   */
  async sendSms(data: SmsNotificationData) {
    this.logger.log(`Enqueuing SMS for user ${data.userId}`, 'NotificationsQueueService');

    await this.notificationsQueue.add(JobName.NOTIFICATION_SMS, data, {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    });
  }

  /**
   * Enviar notificación completa (push + in-app)
   */
  async sendFullNotification(userId: string, title: string, body: string, data?: Record<string, any>) {
    this.logger.log(`Sending full notification to user ${userId}`, 'NotificationsQueueService');

    // Encolar ambas notificaciones en paralelo
    await Promise.all([
      this.sendPushNotification({ userId, title, body, data }),
      this.createInAppNotification({
        userId,
        type: 'general',
        title,
        message: body,
        metadata: data,
      }),
    ]);
  }

  /**
   * Obtener estadísticas de la cola
   */
  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.notificationsQueue.getWaitingCount(),
      this.notificationsQueue.getActiveCount(),
      this.notificationsQueue.getCompletedCount(),
      this.notificationsQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active,
    };
  }
}
