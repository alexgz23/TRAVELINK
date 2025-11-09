import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QueueName, JobName } from '../constants';
import { LoggerService } from '../../common/logger/logger.service';

export interface PushNotificationData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface InAppNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface SmsNotificationData {
  userId: string;
  phoneNumber: string;
  message: string;
}

/**
 * Procesador de cola de notificaciones
 * Maneja push notifications, in-app notifications y SMS
 */
@Processor(QueueName.NOTIFICATIONS)
export class NotificationsProcessor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('NotificationsProcessor');
  }

  /**
   * Enviar push notification
   */
  @Process(JobName.NOTIFICATION_PUSH)
  async sendPushNotification(job: Job<PushNotificationData>) {
    this.logger.log(`Processing push notification for user ${job.data.userId}`, 'NotificationsProcessor');

    try {
      // TODO: Integrar con FCM (Firebase Cloud Messaging) o similar
      // await this.pushService.send(job.data);

      await this.simulatePushSend(job.data.userId, job.data.title);

      this.logger.log(`Push notification sent to user ${job.data.userId}`, 'NotificationsProcessor');
      return { success: true, userId: job.data.userId };
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to user ${job.data.userId}: ${error.message}`,
        error.stack,
        'NotificationsProcessor',
      );
      throw error;
    }
  }

  /**
   * Crear notificación in-app
   */
  @Process(JobName.NOTIFICATION_IN_APP)
  async createInAppNotification(job: Job<InAppNotificationData>) {
    this.logger.log(`Processing in-app notification for user ${job.data.userId}`, 'NotificationsProcessor');

    try {
      // TODO: Guardar en base de datos de notificaciones
      // await this.notificationRepository.create(job.data);

      await this.simulateInAppNotification(job.data.userId, job.data.title);

      this.logger.log(`In-app notification created for user ${job.data.userId}`, 'NotificationsProcessor');
      return { success: true, userId: job.data.userId };
    } catch (error) {
      this.logger.error(
        `Failed to create in-app notification for user ${job.data.userId}: ${error.message}`,
        error.stack,
        'NotificationsProcessor',
      );
      throw error;
    }
  }

  /**
   * Enviar SMS
   */
  @Process(JobName.NOTIFICATION_SMS)
  async sendSms(job: Job<SmsNotificationData>) {
    this.logger.log(`Processing SMS for user ${job.data.userId}`, 'NotificationsProcessor');

    try {
      // TODO: Integrar con Twilio o similar
      // await this.smsService.send(job.data);

      await this.simulateSmsSend(job.data.userId, job.data.phoneNumber);

      this.logger.log(`SMS sent to user ${job.data.userId}`, 'NotificationsProcessor');
      return { success: true, userId: job.data.userId };
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to user ${job.data.userId}: ${error.message}`,
        error.stack,
        'NotificationsProcessor',
      );
      throw error;
    }
  }

  private async simulatePushSend(userId: string, title: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
    this.logger.debug(`[SIMULATED] Push sent to user ${userId}: ${title}`, 'NotificationsProcessor');
  }

  private async simulateInAppNotification(userId: string, title: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));
    this.logger.debug(`[SIMULATED] In-app notification created for user ${userId}: ${title}`, 'NotificationsProcessor');
  }

  private async simulateSmsSend(userId: string, phone: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
    this.logger.debug(`[SIMULATED] SMS sent to ${phone} for user ${userId}`, 'NotificationsProcessor');
  }
}
