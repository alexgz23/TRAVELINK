import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePaymentIntentDto, RefundPaymentDto } from './dto';
import { PaymentStatus, BookingStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly platformCommissionRate = 0.1; // 10%

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecretKey || stripeSecretKey === 'sk_test_your-stripe-secret-key') {
      console.warn('⚠️  Stripe not configured - payments will not work');
      // Initialize with dummy key to avoid errors, but mark as not configured
      this.stripe = null;
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-11-20.acacia',
      });
    }
  }

  /**
   * Create a Stripe payment intent for a booking
   */
  async createPaymentIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    // 1. Get booking
    const booking = await this.prisma.booking.findUnique({
      where: { id: createPaymentIntentDto.bookingId },
      include: {
        experience: {
          select: {
            title: true,
            providerId: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // 2. Verify user owns this booking
    if (booking.userId !== userId) {
      throw new BadRequestException('You can only pay for your own bookings');
    }

    // 3. Verify booking is not already paid
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking is already paid');
    }

    // 4. Verify booking is not cancelled
    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED) {
      throw new BadRequestException('Cannot pay for cancelled booking');
    }

    // 5. Calculate amounts in cents (Stripe uses smallest currency unit)
    const totalAmount = Number(booking.totalPrice);
    const amountInCents = Math.round(totalAmount * 100);

    // 6. Create Stripe payment intent
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: createPaymentIntentDto.currency.toLowerCase(),
      metadata: {
        bookingId: booking.id,
        userId: userId,
        experienceTitle: booking.experience.title,
      },
      description: `Payment for ${booking.experience.title}`,
      receipt_email: booking.user.email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 7. Create payment record in database
    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: createPaymentIntentDto.currency,
        status: PaymentStatus.PENDING,
        method: createPaymentIntentDto.method,
        stripePaymentIntentId: paymentIntent.id,
        description: `Payment for booking ${booking.id}`,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      payment,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe is not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const bookingId = paymentIntent.metadata.bookingId;

    if (!bookingId) {
      console.error('No bookingId in payment intent metadata');
      return;
    }

    // Update payment record
    await this.prisma.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        status: PaymentStatus.PAID,
        stripeChargeId: paymentIntent.latest_charge as string,
        gatewayResponse: paymentIntent as any,
      },
    });

    // Update booking
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });

    // TODO: Send confirmation email
    // TODO: Notify provider
    // TODO: Award points to user
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const bookingId = paymentIntent.metadata.bookingId;

    if (!bookingId) {
      console.error('No bookingId in payment intent metadata');
      return;
    }

    // Update payment record
    await this.prisma.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        status: PaymentStatus.FAILED,
        gatewayResponse: paymentIntent as any,
      },
    });

    // Update booking
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: PaymentStatus.FAILED,
      },
    });

    // TODO: Send failure notification email
  }

  /**
   * Handle charge refunded
   */
  private async handleChargeRefunded(charge: Stripe.Charge) {
    // Update payment record
    await this.prisma.payment.updateMany({
      where: {
        stripeChargeId: charge.id,
      },
      data: {
        status: PaymentStatus.REFUNDED,
        gatewayResponse: charge as any,
      },
    });

    // Update booking
    const payment = await this.prisma.payment.findFirst({
      where: { stripeChargeId: charge.id },
      include: { booking: true },
    });

    if (payment) {
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: PaymentStatus.REFUNDED,
        },
      });
    }

    // TODO: Send refund confirmation email
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(refundDto: RefundPaymentDto) {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe is not configured');
    }

    // 1. Get payment
    const payment = await this.prisma.payment.findUnique({
      where: { id: refundDto.paymentId },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 2. Verify payment is paid
    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Can only refund paid payments');
    }

    // 3. Calculate refund amount
    const refundAmount = refundDto.amount
      ? Math.round(refundDto.amount * 100)
      : Math.round(Number(payment.amount) * 100);

    // 4. Create Stripe refund
    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        reason: refundDto.reason,
        bookingId: payment.bookingId,
      },
    });

    // 5. Update payment record
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
        stripeRefundId: refund.id,
        gatewayResponse: refund as any,
      },
    });

    // 6. Update booking
    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: PaymentStatus.REFUNDED,
        refundAmount: refundDto.amount || Number(payment.amount),
      },
    });

    return {
      refund,
      payment: updatedPayment,
    };
  }

  /**
   * Get all payments for a booking
   */
  async getPaymentsByBooking(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          select: {
            userId: true,
            experience: {
              select: {
                providerId: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify user has access to this payment
    const isOwner = payment.booking.userId === userId;
    const isProvider = payment.booking.experience.providerId === userId;

    if (!isOwner && !isProvider) {
      throw new BadRequestException('You do not have access to this payment');
    }

    return payment;
  }

  /**
   * Process split payment (Platform + Provider)
   * This is called after successful payment
   */
  async processSplitPayment(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        experience: {
          select: {
            providerId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const totalAmount = Number(booking.totalPrice);
    const platformCommission = Number(booking.commission);
    const providerAmount = Number(booking.netPrice);

    // TODO: Implement actual split payment to provider
    // This could be:
    // 1. Stripe Connect transfer to provider's connected account
    // 2. Manual payout tracking in database
    // 3. Platform holds funds and pays out later

    console.log('Split payment processing:', {
      total: totalAmount,
      platform: platformCommission,
      provider: providerAmount,
      providerId: booking.experience.providerId,
    });

    return {
      total: totalAmount,
      platformCommission,
      providerAmount,
    };
  }

  /**
   * Get payment statistics for a provider
   */
  async getProviderPaymentStats(providerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        experience: {
          providerId,
        },
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        payments: true,
      },
    });

    const totalRevenue = bookings.reduce(
      (sum, b) => sum + Number(b.netPrice),
      0,
    );

    const totalCommission = bookings.reduce(
      (sum, b) => sum + Number(b.commission),
      0,
    );

    return {
      totalBookings: bookings.length,
      totalRevenue,
      totalCommission,
      averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
    };
  }
}
