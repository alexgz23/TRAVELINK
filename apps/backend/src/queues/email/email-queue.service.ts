import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueName, JobName } from '../constants';
import { LoggerService } from '../../common/logger/logger.service';
import {
  WelcomeEmailData,
  BookingConfirmationEmailData,
  PasswordResetEmailData,
  BookingReminderEmailData,
  ReviewRequestEmailData,
} from './email.processor';

/**
 * Servicio para encolar trabajos de email
 */
@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue(QueueName.EMAIL) private emailQueue: Queue,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('EmailQueueService');
  }

  /**
   * Encolar email de bienvenida
   */
  async sendWelcomeEmail(data: WelcomeEmailData) {
    this.logger.log(`Enqueuing welcome email for ${data.email}`, 'EmailQueueService');

    await this.emailQueue.add(JobName.EMAIL_WELCOME, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  /**
   * Encolar email de confirmación de reserva
   */
  async sendBookingConfirmation(data: BookingConfirmationEmailData) {
    this.logger.log(`Enqueuing booking confirmation email for ${data.email}`, 'EmailQueueService');

    await this.emailQueue.add(JobName.EMAIL_BOOKING_CONFIRMATION, data, {
      attempts: 5, // Más intentos para emails críticos
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    });
  }

  /**
   * Encolar email de reset de contraseña
   */
  async sendPasswordReset(data: PasswordResetEmailData) {
    this.logger.log(`Enqueuing password reset email for ${data.email}`, 'EmailQueueService');

    await this.emailQueue.add(JobName.EMAIL_PASSWORD_RESET, data, {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      // Expirar el token después de 1 hora
      removeOnComplete: true,
    });
  }

  /**
   * Encolar recordatorio de reserva programado
   */
  async scheduleBookingReminder(data: BookingReminderEmailData, sendAt: Date) {
    this.logger.log(
      `Scheduling booking reminder for ${data.email} at ${sendAt.toISOString()}`,
      'EmailQueueService',
    );

    const delay = sendAt.getTime() - Date.now();

    if (delay < 0) {
      this.logger.warn(`Cannot schedule reminder in the past for ${data.email}`, 'EmailQueueService');
      return;
    }

    await this.emailQueue.add(JobName.EMAIL_BOOKING_REMINDER, data, {
      delay, // Delay en milisegundos
      attempts: 3,
    });
  }

  /**
   * Encolar solicitud de review
   */
  async sendReviewRequest(data: ReviewRequestEmailData, delay = 0) {
    this.logger.log(`Enqueuing review request for ${data.email}`, 'EmailQueueService');

    await this.emailQueue.add(JobName.EMAIL_REVIEW_REQUEST, data, {
      delay,
      attempts: 2,
    });
  }

  /**
   * Obtener estadísticas de la cola
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  /**
   * Limpiar trabajos completados
   */
  async cleanCompleted() {
    const cleaned = await this.emailQueue.clean(24 * 60 * 60 * 1000); // 24 horas
    this.logger.log(`Cleaned ${cleaned.length} completed jobs from email queue`, 'EmailQueueService');
    return cleaned.length;
  }
}
