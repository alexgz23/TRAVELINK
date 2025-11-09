import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QueueName, JobName } from '../constants';
import { LoggerService } from '../../common/logger/logger.service';

export interface WelcomeEmailData {
  userId: string;
  email: string;
  name: string;
}

export interface BookingConfirmationEmailData {
  userId: string;
  email: string;
  bookingId: string;
  bookingNumber: string;
  experienceName: string;
  date: string;
  totalAmount: number;
}

export interface PasswordResetEmailData {
  userId: string;
  email: string;
  resetToken: string;
}

export interface BookingReminderEmailData {
  userId: string;
  email: string;
  bookingId: string;
  experienceName: string;
  date: string;
}

export interface ReviewRequestEmailData {
  userId: string;
  email: string;
  bookingId: string;
  experienceName: string;
}

/**
 * Procesador de cola de emails
 * Maneja el envío asíncrono de todos los emails del sistema
 */
@Processor(QueueName.EMAIL)
export class EmailProcessor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('EmailProcessor');
  }

  /**
   * Enviar email de bienvenida
   */
  @Process(JobName.EMAIL_WELCOME)
  async sendWelcomeEmail(job: Job<WelcomeEmailData>) {
    this.logger.log(`Processing welcome email for ${job.data.email}`, 'EmailProcessor');

    try {
      // TODO: Integrar con SendGrid o servicio de email
      // await this.emailService.sendWelcome(job.data);

      // Simulación de envío
      await this.simulateEmailSend(job.data.email, 'Welcome Email');

      this.logger.log(`Welcome email sent successfully to ${job.data.email}`, 'EmailProcessor');
      return { success: true, email: job.data.email };
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${job.data.email}: ${error.message}`,
        error.stack,
        'EmailProcessor',
      );
      throw error; // Bull will retry
    }
  }

  /**
   * Enviar email de confirmación de reserva
   */
  @Process(JobName.EMAIL_BOOKING_CONFIRMATION)
  async sendBookingConfirmation(job: Job<BookingConfirmationEmailData>) {
    this.logger.log(`Processing booking confirmation email for ${job.data.email}`, 'EmailProcessor');

    try {
      // TODO: Integrar con SendGrid
      await this.simulateEmailSend(job.data.email, 'Booking Confirmation');

      this.logger.business('email:booking_confirmation', 'email_sent', job.data.bookingId, {
        email: job.data.email,
        bookingNumber: job.data.bookingNumber,
      });

      return { success: true, email: job.data.email, bookingId: job.data.bookingId };
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation to ${job.data.email}: ${error.message}`,
        error.stack,
        'EmailProcessor',
      );
      throw error;
    }
  }

  /**
   * Enviar email de reset de contraseña
   */
  @Process(JobName.EMAIL_PASSWORD_RESET)
  async sendPasswordReset(job: Job<PasswordResetEmailData>) {
    this.logger.log(`Processing password reset email for ${job.data.email}`, 'EmailProcessor');

    try {
      // TODO: Integrar con SendGrid
      await this.simulateEmailSend(job.data.email, 'Password Reset');

      this.logger.log(`Password reset email sent to ${job.data.email}`, 'EmailProcessor');
      return { success: true, email: job.data.email };
    } catch (error) {
      this.logger.error(
        `Failed to send password reset to ${job.data.email}: ${error.message}`,
        error.stack,
        'EmailProcessor',
      );
      throw error;
    }
  }

  /**
   * Enviar recordatorio de reserva
   */
  @Process(JobName.EMAIL_BOOKING_REMINDER)
  async sendBookingReminder(job: Job<BookingReminderEmailData>) {
    this.logger.log(`Processing booking reminder email for ${job.data.email}`, 'EmailProcessor');

    try {
      // TODO: Integrar con SendGrid
      await this.simulateEmailSend(job.data.email, 'Booking Reminder');

      this.logger.log(`Booking reminder sent to ${job.data.email}`, 'EmailProcessor');
      return { success: true, email: job.data.email, bookingId: job.data.bookingId };
    } catch (error) {
      this.logger.error(
        `Failed to send booking reminder to ${job.data.email}: ${error.message}`,
        error.stack,
        'EmailProcessor',
      );
      throw error;
    }
  }

  /**
   * Solicitar review después de experiencia
   */
  @Process(JobName.EMAIL_REVIEW_REQUEST)
  async sendReviewRequest(job: Job<ReviewRequestEmailData>) {
    this.logger.log(`Processing review request email for ${job.data.email}`, 'EmailProcessor');

    try {
      // TODO: Integrar con SendGrid
      await this.simulateEmailSend(job.data.email, 'Review Request');

      this.logger.log(`Review request sent to ${job.data.email}`, 'EmailProcessor');
      return { success: true, email: job.data.email, bookingId: job.data.bookingId };
    } catch (error) {
      this.logger.error(
        `Failed to send review request to ${job.data.email}: ${error.message}`,
        error.stack,
        'EmailProcessor',
      );
      throw error;
    }
  }

  /**
   * Simular envío de email (remover cuando se integre servicio real)
   */
  private async simulateEmailSend(to: string, subject: string): Promise<void> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Simular fallo ocasional (5% de las veces)
    if (Math.random() < 0.05) {
      throw new Error('Simulated email service error');
    }

    this.logger.debug(`[SIMULATED] Email sent to ${to}: ${subject}`, 'EmailProcessor');
  }
}
