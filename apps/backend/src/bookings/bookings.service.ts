import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CancelBookingDto,
  BookingFiltersDto,
} from './dto';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  // Platform commission rate (10%)
  private readonly COMMISSION_RATE = 0.1;

  // Points value: 1 point = 100 COP
  private readonly POINTS_TO_COP_RATE = 100;

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new booking
   */
  async create(userId: string, createBookingDto: CreateBookingDto) {
    // 1. Validate experience exists and is active
    const experience = await this.prisma.experience.findFirst({
      where: {
        id: createBookingDto.experienceId,
        isActive: true,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found or inactive');
    }

    // 2. Validate number of people doesn't exceed max group size
    if (createBookingDto.numberOfPeople > experience.maxGroupSize) {
      throw new BadRequestException(
        `Number of people exceeds maximum group size of ${experience.maxGroupSize}`,
      );
    }

    // 3. Check availability for the selected date
    const isAvailable = await this.checkAvailability(
      createBookingDto.experienceId,
      new Date(createBookingDto.startDate),
      createBookingDto.endDate ? new Date(createBookingDto.endDate) : null,
    );

    if (!isAvailable) {
      throw new BadRequestException(
        'Experience is not available for the selected date',
      );
    }

    // 4. Get user's points
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    const pointsUsed = createBookingDto.pointsUsed || 0;

    // Validate user has enough points
    if (pointsUsed > 0 && user.points < pointsUsed) {
      throw new BadRequestException('Insufficient points');
    }

    // 5. Calculate pricing
    const pricing = this.calculatePricing(
      Number(experience.price),
      createBookingDto.numberOfPeople,
      pointsUsed,
    );

    // 6. Create the booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        experienceId: createBookingDto.experienceId,
        startDate: new Date(createBookingDto.startDate),
        endDate: createBookingDto.endDate
          ? new Date(createBookingDto.endDate)
          : null,
        numberOfPeople: createBookingDto.numberOfPeople,
        totalPrice: pricing.totalPrice,
        commission: pricing.commission,
        netPrice: pricing.netPrice,
        pointsUsed: pointsUsed,
        pointsValue: pricing.pointsValue,
        contactName: createBookingDto.contactName,
        contactEmail: createBookingDto.contactEmail,
        contactPhone: createBookingDto.contactPhone,
        specialRequests: createBookingDto.specialRequests,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
      include: {
        experience: {
          select: {
            id: true,
            title: true,
            city: true,
            price: true,
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 7. Deduct points if used (temporary hold until payment confirmed)
    if (pointsUsed > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: pointsUsed,
          },
        },
      });
    }

    // TODO: Send notification to user and provider
    // TODO: Create payment intent if online payment

    return booking;
  }

  /**
   * Find all bookings with filters and pagination
   */
  async findAll(filters: BookingFiltersDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...where } = filters;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.BookingWhereInput = {
      ...(where.status && { status: where.status }),
      ...(where.paymentStatus && { paymentStatus: where.paymentStatus }),
      ...(where.experienceId && { experienceId: where.experienceId }),
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          experience: {
            select: {
              id: true,
              title: true,
              city: true,
              images: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where: whereClause }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get bookings for the current user
   */
  async getMyBookings(userId: string, filters: BookingFiltersDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...where } = filters;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.BookingWhereInput = {
      userId,
      ...(where.status && { status: where.status }),
      ...(where.paymentStatus && { paymentStatus: where.paymentStatus }),
      ...(where.experienceId && { experienceId: where.experienceId }),
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          experience: {
            select: {
              id: true,
              title: true,
              slug: true,
              city: true,
              country: true,
              images: true,
              price: true,
              rating: true,
              category: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              createdAt: true,
            },
          },
          review: {
            select: {
              id: true,
              rating: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where: whereClause }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get bookings received by a provider
   */
  async getProviderBookings(providerId: string, filters: BookingFiltersDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...where } = filters;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.BookingWhereInput = {
      experience: {
        providerId,
      },
      ...(where.status && { status: where.status }),
      ...(where.paymentStatus && { paymentStatus: where.paymentStatus }),
      ...(where.experienceId && { experienceId: where.experienceId }),
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          experience: {
            select: {
              id: true,
              title: true,
              city: true,
              images: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where: whereClause }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one booking by ID
   */
  async findOne(id: string, userId: string, userRole: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        experience: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        payments: true,
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user has permission to view this booking
    const isOwner = booking.userId === userId;
    const isProvider = booking.experience.providerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isProvider && !isAdmin) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  /**
   * Update booking (mainly for providers to add notes or modify)
   */
  async update(
    id: string,
    userId: string,
    userRole: string,
    updateBookingDto: UpdateBookingDto,
  ) {
    const booking = await this.findOne(id, userId, userRole);

    // Only provider or admin can update
    const isProvider = booking.experience.providerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isProvider && !isAdmin) {
      throw new ForbiddenException('Only providers can update bookings');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        ...(updateBookingDto.status && { status: updateBookingDto.status }),
        ...(updateBookingDto.providerNotes && {
          providerNotes: updateBookingDto.providerNotes,
        }),
        ...(updateBookingDto.startDate && {
          startDate: new Date(updateBookingDto.startDate),
        }),
        ...(updateBookingDto.endDate && {
          endDate: new Date(updateBookingDto.endDate),
        }),
      },
      include: {
        experience: true,
        user: true,
        payments: true,
      },
    });
  }

  /**
   * Confirm booking (provider only)
   */
  async confirm(id: string, providerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { experience: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.experience.providerId !== providerId) {
      throw new ForbiddenException('Only the provider can confirm this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    // Check payment status
    if (booking.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Booking must be paid before confirmation');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CONFIRMED,
      },
      include: {
        experience: true,
        user: true,
      },
    });

    // TODO: Send confirmation email to user
  }

  /**
   * Reject booking (provider only)
   */
  async reject(id: string, providerId: string, reason: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { experience: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.experience.providerId !== providerId) {
      throw new ForbiddenException('Only the provider can reject this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.REJECTED,
        providerNotes: reason,
      },
      include: {
        experience: true,
        user: true,
      },
    });

    // Refund points if used
    if (booking.pointsUsed > 0) {
      await this.prisma.user.update({
        where: { id: booking.userId },
        data: {
          points: {
            increment: booking.pointsUsed,
          },
        },
      });
    }

    // TODO: Initiate refund if payment was made
    // TODO: Send rejection email to user

    return updated;
  }

  /**
   * Cancel booking (user or provider can cancel)
   */
  async cancel(
    id: string,
    userId: string,
    userRole: string,
    cancelBookingDto: CancelBookingDto,
  ) {
    const booking = await this.findOne(id, userId, userRole);

    const isOwner = booking.userId === userId;
    const isProvider = booking.experience.providerId === userId;

    if (!isOwner && !isProvider) {
      throw new ForbiddenException('You cannot cancel this booking');
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    // Calculate refund based on cancellation policy
    const refundAmount = this.calculateRefundAmount(
      booking,
      booking.experience.cancellationPolicy,
    );

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: cancelBookingDto.cancellationReason,
        refundAmount,
      },
      include: {
        experience: true,
        user: true,
      },
    });

    // Refund points if used
    if (booking.pointsUsed > 0) {
      await this.prisma.user.update({
        where: { id: booking.userId },
        data: {
          points: {
            increment: booking.pointsUsed,
          },
        },
      });
    }

    // TODO: Process refund payment
    // TODO: Send cancellation email

    return updated;
  }

  /**
   * Mark booking as completed
   */
  async complete(id: string, providerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { experience: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.experience.providerId !== providerId) {
      throw new ForbiddenException('Only the provider can mark as completed');
    }

    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress bookings can be completed');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.COMPLETED,
      },
      include: {
        experience: true,
        user: true,
      },
    });

    // TODO: Award points to user
    // TODO: Send review request email
  }

  /**
   * Check availability for a date
   */
  private async checkAvailability(
    experienceId: string,
    startDate: Date,
    endDate: Date | null,
  ): Promise<boolean> {
    const experience = await this.prisma.experience.findUnique({
      where: { id: experienceId },
      select: { maxGroupSize: true },
    });

    if (!experience) {
      return false;
    }

    // Count existing bookings for the same date (not cancelled or rejected)
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        experienceId,
        startDate: {
          gte: startDate,
          ...(endDate && { lte: endDate }),
        },
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
        },
      },
      select: {
        numberOfPeople: true,
      },
    });

    const totalPeople = existingBookings.reduce(
      (sum, b) => sum + b.numberOfPeople,
      0,
    );

    // Simple availability check - can be enhanced with calendar/seasons later
    return totalPeople < experience.maxGroupSize;
  }

  /**
   * Calculate pricing with commission and points
   */
  private calculatePricing(
    basePrice: number,
    numberOfPeople: number,
    pointsUsed: number,
  ) {
    const subtotal = basePrice * numberOfPeople;
    const pointsValue = pointsUsed * this.POINTS_TO_COP_RATE;
    const totalPrice = subtotal - pointsValue;

    const commission = totalPrice * this.COMMISSION_RATE;
    const netPrice = totalPrice - commission;

    return {
      totalPrice,
      commission,
      netPrice,
      pointsValue,
    };
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  private calculateRefundAmount(
    booking: any,
    cancellationPolicy: string,
  ): number {
    const now = new Date();
    const bookingDate = new Date(booking.startDate);
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Simple policy - can be enhanced:
    // More than 48h before: 100% refund
    // 24-48h: 50% refund
    // Less than 24h: No refund

    const totalPrice = Number(booking.totalPrice);

    if (hoursUntilBooking > 48) {
      return totalPrice; // 100% refund
    } else if (hoursUntilBooking > 24) {
      return totalPrice * 0.5; // 50% refund
    } else {
      return 0; // No refund
    }
  }
}
