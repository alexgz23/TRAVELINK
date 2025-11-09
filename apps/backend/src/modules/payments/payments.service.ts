import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Payment } from './entities';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto, FilterPaymentDto } from './dto';
import { PaymentStatus } from '@viajero-conectado/types';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly bookingsService: BookingsService,
  ) {}

  /**
   * Crear nuevo pago
   */
  async create(userId: string, createDto: CreatePaymentDto): Promise<Payment> {
    // Verificar que la reserva existe y pertenece al usuario
    const booking = await this.bookingsService.findOne(createDto.bookingId);

    if (booking.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para crear un pago para esta reserva');
    }

    // Verificar que la reserva no tenga ya un pago completado
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        bookingId: createDto.bookingId,
        status: PaymentStatus.COMPLETED,
      },
    });

    if (existingPayment) {
      throw new BadRequestException('Esta reserva ya tiene un pago completado');
    }

    const payment = this.paymentRepository.create({
      bookingId: createDto.bookingId,
      amount: createDto.amount,
      currency: createDto.currency || booking.currency,
      provider: createDto.provider,
      paymentMethod: createDto.paymentMethod,
      status: PaymentStatus.PENDING,
      metadata: createDto.metadata,
    });

    return this.paymentRepository.save(payment);
  }

  /**
   * Procesar/confirmar pago
   */
  async process(paymentId: string, processDto: ProcessPaymentDto): Promise<Payment> {
    const payment = await this.findOne(paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Solo se pueden procesar pagos pendientes');
    }

    payment.providerPaymentId = processDto.providerPaymentId;
    payment.providerCustomerId = processDto.providerCustomerId;
    payment.status = PaymentStatus.COMPLETED;

    if (processDto.metadata) {
      payment.metadata = { ...payment.metadata, ...processDto.metadata };
    }

    const savedPayment = await this.paymentRepository.save(payment);

    // Confirmar la reserva automáticamente cuando el pago se completa
    try {
      await this.bookingsService.confirm(payment.bookingId, payment.booking.experience.agencyId);
    } catch (error) {
      // Log error but don't fail the payment
      console.error('Error auto-confirming booking:', error);
    }

    return savedPayment;
  }

  /**
   * Marcar pago como fallido
   */
  async markAsFailed(paymentId: string, reason?: string): Promise<Payment> {
    const payment = await this.findOne(paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Solo se pueden marcar como fallidos los pagos pendientes');
    }

    payment.status = PaymentStatus.FAILED;

    if (reason && payment.metadata) {
      payment.metadata = { ...payment.metadata, failureReason: reason };
    } else if (reason) {
      payment.metadata = { failureReason: reason };
    }

    return this.paymentRepository.save(payment);
  }

  /**
   * Reembolsar pago
   */
  async refund(paymentId: string, userId: string, refundDto?: RefundPaymentDto): Promise<Payment> {
    const payment = await this.findOne(paymentId);

    // Verificar permisos (usuario o agencia)
    const isOwner = payment.booking.userId === userId;
    const isAgency = payment.booking.experience.agencyId === userId;

    if (!isOwner && !isAgency) {
      throw new ForbiddenException('No tienes permisos para reembolsar este pago');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Solo se pueden reembolsar pagos completados');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Este pago ya fue reembolsado');
    }

    const refundAmount = refundDto?.amount || payment.amount;

    if (refundAmount > payment.amount) {
      throw new BadRequestException('El monto a reembolsar no puede ser mayor al monto del pago');
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.refundAmount = refundAmount;
    payment.refundedAt = new Date();

    if (refundDto?.reason && payment.metadata) {
      payment.metadata = { ...payment.metadata, refundReason: refundDto.reason };
    } else if (refundDto?.reason) {
      payment.metadata = { refundReason: refundDto.reason };
    }

    const savedPayment = await this.paymentRepository.save(payment);

    // Cancelar la reserva automáticamente cuando se reembolsa
    try {
      await this.bookingsService.cancel(
        payment.bookingId,
        userId,
        refundDto?.reason || 'Pago reembolsado',
      );
    } catch (error) {
      // Log error but don't fail the refund
      console.error('Error auto-cancelling booking:', error);
    }

    return savedPayment;
  }

  /**
   * Obtener todos los pagos con filtros
   */
  async findAll(filters: FilterPaymentDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Payment> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.provider) {
      where.provider = filters.provider;
    }

    if (filters.bookingId) {
      where.bookingId = filters.bookingId;
    }

    const [items, total] = await this.paymentRepository.findAndCount({
      where,
      relations: ['booking', 'booking.experience', 'booking.user', 'booking.user.profile'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener pago por ID
   */
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        'booking',
        'booking.user',
        'booking.user.profile',
        'booking.experience',
        'booking.experience.agency',
        'booking.experience.agency.profile',
      ],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return payment;
  }

  /**
   * Obtener pagos por reserva
   */
  async findByBooking(bookingId: string): Promise<Payment[]> {
    await this.bookingsService.findOne(bookingId); // Verificar que existe

    return this.paymentRepository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener pagos de un usuario
   */
  async findByUser(userId: string, filters: FilterPaymentDto = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    let queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('booking.experience', 'experience')
      .leftJoinAndSelect('experience.agency', 'agency')
      .leftJoinAndSelect('agency.profile', 'agencyProfile')
      .where('booking.userId = :userId', { userId });

    if (filters.status) {
      queryBuilder = queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.provider) {
      queryBuilder = queryBuilder.andWhere('payment.provider = :provider', {
        provider: filters.provider,
      });
    }

    queryBuilder = queryBuilder.orderBy('payment.createdAt', 'DESC');

    const [items, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener pagos de una agencia
   */
  async findByAgency(agencyId: string, filters: FilterPaymentDto = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    let queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('booking.experience', 'experience')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('user.profile', 'userProfile')
      .where('experience.agencyId = :agencyId', { agencyId });

    if (filters.status) {
      queryBuilder = queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.provider) {
      queryBuilder = queryBuilder.andWhere('payment.provider = :provider', {
        provider: filters.provider,
      });
    }

    if (filters.bookingId) {
      queryBuilder = queryBuilder.andWhere('payment.bookingId = :bookingId', {
        bookingId: filters.bookingId,
      });
    }

    queryBuilder = queryBuilder.orderBy('payment.createdAt', 'DESC');

    const [items, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Calcular comisión de la plataforma
   */
  calculatePlatformFee(amount: number, feePercentage: number = 10): number {
    return Number((amount * (feePercentage / 100)).toFixed(2));
  }

  /**
   * Calcular monto neto para la agencia
   */
  calculateNetAmount(amount: number, feeAmount: number): number {
    return Number((amount - feeAmount).toFixed(2));
  }
}
