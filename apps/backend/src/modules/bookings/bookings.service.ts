import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Booking, BookingTraveler } from './entities';
import { CreateBookingDto, UpdateBookingDto, AddTravelerDto, FilterBookingDto } from './dto';
import { BookingStatus } from '@viajero-conectado/types';
import { ExperiencesService } from '../experiences/experiences.service';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingTraveler)
    private readonly travelerRepository: Repository<BookingTraveler>,
    private readonly experiencesService: ExperiencesService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('BookingsService');
  }

  /**
   * Crear nueva reserva
   */
  async create(userId: string, createDto: CreateBookingDto): Promise<Booking> {
    // Verificar que la experiencia existe
    const experience = await this.experiencesService.findOne(createDto.experienceId);

    if (experience.status !== 'published') {
      this.logger.warn('Booking creation failed: Experience not published', 'BookingsService', {
        experienceId: createDto.experienceId,
        status: experience.status,
      });
      throw new BadRequestException('La experiencia no está disponible para reservar');
    }

    // Generar número de reserva único
    const bookingNumber = await this.generateBookingNumber();

    const booking = this.bookingRepository.create({
      userId,
      bookingNumber,
      experienceId: createDto.experienceId,
      variantId: createDto.variantId,
      bookingDate: createDto.bookingDate,
      bookingTime: createDto.bookingTime,
      numAdults: createDto.numAdults,
      numChildren: createDto.numChildren || 0,
      totalAmount: createDto.totalAmount,
      currency: createDto.currency || experience.currency,
      status: BookingStatus.PENDING,
    });

    const saved = await this.bookingRepository.save(booking);

    this.logger.business('create', 'booking', saved.id, {
      bookingNumber: saved.bookingNumber,
      userId,
      experienceId: createDto.experienceId,
      totalAmount: saved.totalAmount,
    });

    return saved;
  }

  /**
   * Obtener todas las reservas con filtros
   */
  async findAll(filters: FilterBookingDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Booking> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.experienceId) {
      where.experienceId = filters.experienceId;
    }

    if (filters.startDate && filters.endDate) {
      where.bookingDate = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    const [items, total] = await this.bookingRepository.findAndCount({
      where,
      relations: ['user', 'user.profile', 'experience', 'experience.media', 'travelers'],
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
   * Obtener reserva por ID
   */
  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'user',
        'user.profile',
        'experience',
        'experience.agency',
        'experience.agency.profile',
        'experience.media',
        'experience.variants',
        'travelers',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return booking;
  }

  /**
   * Obtener reserva por número de reserva
   */
  async findByBookingNumber(bookingNumber: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingNumber },
      relations: ['user', 'user.profile', 'experience', 'experience.media', 'travelers'],
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return booking;
  }

  /**
   * Obtener reservas de un usuario (viajero)
   */
  async findByUser(userId: string, filters: FilterBookingDto = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Booking> = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      where.bookingDate = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    const [items, total] = await this.bookingRepository.findAndCount({
      where,
      relations: ['experience', 'experience.media', 'experience.agency', 'experience.agency.profile', 'travelers'],
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
   * Obtener reservas de una agencia
   */
  async findByAgency(agencyId: string, filters: FilterBookingDto = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    let queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.experience', 'experience')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('booking.travelers', 'travelers')
      .where('experience.agencyId = :agencyId', { agencyId });

    if (filters.status) {
      queryBuilder = queryBuilder.andWhere('booking.status = :status', { status: filters.status });
    }

    if (filters.experienceId) {
      queryBuilder = queryBuilder.andWhere('booking.experienceId = :experienceId', {
        experienceId: filters.experienceId,
      });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder = queryBuilder.andWhere('booking.bookingDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    queryBuilder = queryBuilder.orderBy('booking.createdAt', 'DESC');

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
   * Actualizar reserva
   */
  async update(id: string, userId: string, updateDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);

    // Verificar que el usuario sea el dueño
    if (booking.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar esta reserva');
    }

    // No permitir actualizar si ya está confirmada o completada
    if ([BookingStatus.CONFIRMED, BookingStatus.COMPLETED].includes(booking.status)) {
      throw new BadRequestException('No puedes actualizar una reserva confirmada o completada');
    }

    Object.assign(booking, updateDto);

    return this.bookingRepository.save(booking);
  }

  /**
   * Confirmar reserva (por agencia)
   */
  async confirm(id: string, agencyId: string): Promise<Booking> {
    const booking = await this.findOne(id);

    // Verificar que la experiencia pertenece a la agencia
    if (booking.experience.agencyId !== agencyId) {
      this.logger.security('Unauthorized booking confirmation attempt', 'high', {
        bookingId: id,
        bookingAgencyId: booking.experience.agencyId,
        attemptedBy: agencyId,
      });
      throw new ForbiddenException('No tienes permisos para confirmar esta reserva');
    }

    if (booking.status !== BookingStatus.PENDING) {
      this.logger.warn('Booking confirmation failed: Invalid status', 'BookingsService', {
        bookingId: id,
        currentStatus: booking.status,
      });
      throw new BadRequestException('Solo se pueden confirmar reservas pendientes');
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.confirmedAt = new Date();

    const confirmed = await this.bookingRepository.save(booking);

    this.logger.business('confirm', 'booking', id, {
      bookingNumber: booking.bookingNumber,
      agencyId,
    });

    return confirmed;
  }

  /**
   * Completar reserva (por agencia)
   */
  async complete(id: string, agencyId: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.experience.agencyId !== agencyId) {
      this.logger.security('Unauthorized booking completion attempt', 'high', {
        bookingId: id,
        bookingAgencyId: booking.experience.agencyId,
        attemptedBy: agencyId,
      });
      throw new ForbiddenException('No tienes permisos para completar esta reserva');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      this.logger.warn('Booking completion failed: Invalid status', 'BookingsService', {
        bookingId: id,
        currentStatus: booking.status,
      });
      throw new BadRequestException('Solo se pueden completar reservas confirmadas');
    }

    booking.status = BookingStatus.COMPLETED;
    booking.completedAt = new Date();

    const completed = await this.bookingRepository.save(booking);

    this.logger.business('complete', 'booking', id, {
      bookingNumber: booking.bookingNumber,
      agencyId,
      totalAmount: booking.totalAmount,
    });

    return completed;
  }

  /**
   * Cancelar reserva
   */
  async cancel(id: string, userId: string, reason?: string): Promise<Booking> {
    const booking = await this.findOne(id);

    // Permitir cancelación si es el usuario o la agencia
    const isOwner = booking.userId === userId;
    const isAgency = booking.experience.agencyId === userId;

    if (!isOwner && !isAgency) {
      this.logger.security('Unauthorized booking cancellation attempt', 'medium', {
        bookingId: id,
        bookingUserId: booking.userId,
        bookingAgencyId: booking.experience.agencyId,
        attemptedBy: userId,
      });
      throw new ForbiddenException('No tienes permisos para cancelar esta reserva');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      this.logger.warn('Booking cancellation failed: Already completed', 'BookingsService', {
        bookingId: id,
      });
      throw new BadRequestException('No puedes cancelar una reserva completada');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      this.logger.warn('Booking cancellation failed: Already cancelled', 'BookingsService', {
        bookingId: id,
      });
      throw new BadRequestException('La reserva ya está cancelada');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();

    const cancelled = await this.bookingRepository.save(booking);

    this.logger.business('cancel', 'booking', id, {
      bookingNumber: booking.bookingNumber,
      userId,
      isAgency,
      reason,
    });

    return cancelled;
  }

  /**
   * Eliminar reserva
   */
  async remove(id: string, userId: string): Promise<void> {
    const booking = await this.findOne(id);

    if (booking.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta reserva');
    }

    // Solo permitir eliminar si está cancelada o pendiente
    if (![BookingStatus.PENDING, BookingStatus.CANCELLED].includes(booking.status)) {
      throw new BadRequestException('Solo puedes eliminar reservas pendientes o canceladas');
    }

    await this.bookingRepository.remove(booking);
  }

  /**
   * Agregar viajero a reserva
   */
  async addTraveler(bookingId: string, addTravelerDto: AddTravelerDto): Promise<BookingTraveler> {
    await this.findOne(bookingId); // Verificar que existe

    const traveler = this.travelerRepository.create({
      bookingId,
      ...addTravelerDto,
    });

    return this.travelerRepository.save(traveler);
  }

  /**
   * Obtener viajeros de una reserva
   */
  async getTravelers(bookingId: string): Promise<BookingTraveler[]> {
    await this.findOne(bookingId); // Verificar que existe

    return this.travelerRepository.find({
      where: { bookingId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Eliminar viajero
   */
  async removeTraveler(travelerId: string): Promise<void> {
    const traveler = await this.travelerRepository.findOne({ where: { id: travelerId } });

    if (!traveler) {
      throw new NotFoundException('Viajero no encontrado');
    }

    await this.travelerRepository.remove(traveler);
  }

  /**
   * Generar número de reserva único
   */
  private async generateBookingNumber(): Promise<string> {
    const prefix = 'BK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const bookingNumber = `${prefix}${timestamp}${random}`;

    // Verificar que no exista
    const existing = await this.bookingRepository.findOne({ where: { bookingNumber } });
    if (existing) {
      return this.generateBookingNumber(); // Recursivo si existe
    }

    return bookingNumber;
  }
}
