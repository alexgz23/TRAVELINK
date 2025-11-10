import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreateReviewDto,
  ProviderResponseDto,
  ReviewFiltersDto,
} from './dto';
import { BookingStatus, Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  // Prohibited words for automatic moderation
  private readonly PROHIBITED_WORDS = [
    'spam',
    'scam',
    'fraud',
    'fake',
    // Add more prohibited words as needed
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new review
   */
  async create(userId: string, createReviewDto: CreateReviewDto) {
    // 1. Get booking
    const booking = await this.prisma.booking.findUnique({
      where: { id: createReviewDto.bookingId },
      include: {
        experience: {
          select: {
            id: true,
            title: true,
            providerId: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // 2. Verify user owns this booking
    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    // 3. Verify booking is completed
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'You can only review completed bookings',
      );
    }

    // 4. Verify no existing review for this booking (one review per booking)
    if (booking.review) {
      throw new BadRequestException(
        'You have already reviewed this booking',
      );
    }

    // 5. Moderate content
    const moderationResult = this.moderateContent(createReviewDto.content);

    // 6. Create review
    const review = await this.prisma.review.create({
      data: {
        userId,
        experienceId: booking.experience.id,
        bookingId: booking.id,
        rating: createReviewDto.rating,
        title: createReviewDto.title,
        content: createReviewDto.content,
        photos: createReviewDto.photos || [],
        isVerified: true, // Auto-verify since it's from a completed booking
        isModerated: moderationResult.isClean,
        moderationNotes: moderationResult.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        experience: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // 7. Update experience rating
    await this.updateExperienceRating(booking.experience.id);

    // TODO: Notify provider about new review
    // TODO: Award points to user for writing review

    return review;
  }

  /**
   * Find all reviews with filters and pagination
   */
  async findAll(filters: ReviewFiltersDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...where
    } = filters;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.ReviewWhereInput = {
      ...(where.experienceId && { experienceId: where.experienceId }),
      ...(where.userId && { userId: where.userId }),
      ...(where.minRating && { rating: { gte: where.minRating } }),
      ...(where.isVerified !== undefined && { isVerified: where.isVerified }),
      isModerated: true, // Only show moderated reviews publicly
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          experience: {
            select: {
              id: true,
              title: true,
              city: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where: whereClause }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get reviews for a specific experience
   */
  async getExperienceReviews(
    experienceId: string,
    filters: ReviewFiltersDto,
  ) {
    return this.findAll({
      ...filters,
      experienceId,
    });
  }

  /**
   * Get reviews by a specific user
   */
  async getUserReviews(userId: string, filters: ReviewFiltersDto) {
    return this.findAll({
      ...filters,
      userId,
    });
  }

  /**
   * Find one review by ID
   */
  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        experience: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: true,
            images: true,
            providerId: true,
          },
        },
        booking: {
          select: {
            id: true,
            startDate: true,
            numberOfPeople: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Provider responds to a review
   */
  async addProviderResponse(
    reviewId: string,
    providerId: string,
    providerResponseDto: ProviderResponseDto,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        experience: {
          select: {
            providerId: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify provider owns the experience
    if (review.experience.providerId !== providerId) {
      throw new ForbiddenException(
        'You can only respond to reviews of your own experiences',
      );
    }

    // Verify no existing response
    if (review.response) {
      throw new BadRequestException('You have already responded to this review');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        response: providerResponseDto.response,
        respondedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        experience: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Mark review as helpful
   */
  async markAsHelpful(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Increment helpful count
    // TODO: Track which users marked as helpful to prevent duplicates
    // For now, simple increment
    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Delete review (admin or review owner)
   */
  async remove(id: string, userId: string, userRole: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        experience: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only owner or admin can delete
    const isOwner = review.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You cannot delete this review');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    // Update experience rating after deletion
    await this.updateExperienceRating(review.experienceId);

    return { message: 'Review deleted successfully' };
  }

  /**
   * Moderate review (admin only)
   */
  async moderate(
    id: string,
    isModerated: boolean,
    moderationNotes?: string,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        isModerated,
        moderationNotes,
      },
    });
  }

  /**
   * Get review statistics for an experience
   */
  async getExperienceReviewStats(experienceId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        experienceId,
        isModerated: true,
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingDistribution,
    };
  }

  /**
   * Update experience average rating
   */
  private async updateExperienceRating(experienceId: string) {
    const stats = await this.getExperienceReviewStats(experienceId);

    await this.prisma.experience.update({
      where: { id: experienceId },
      data: {
        rating: stats.averageRating,
        reviewCount: stats.totalReviews,
      },
    });
  }

  /**
   * Moderate review content (automatic)
   */
  private moderateContent(content: string): {
    isClean: boolean;
    notes?: string;
  } {
    const lowerContent = content.toLowerCase();

    // Check for prohibited words
    const foundProhibitedWords = this.PROHIBITED_WORDS.filter((word) =>
      lowerContent.includes(word),
    );

    if (foundProhibitedWords.length > 0) {
      return {
        isClean: false,
        notes: `Contains prohibited words: ${foundProhibitedWords.join(', ')}`,
      };
    }

    // TODO: Add more moderation rules:
    // - Detect spam patterns
    // - Detect excessive caps
    // - Detect contact information
    // - Use AI moderation API

    return {
      isClean: true,
    };
  }
}
