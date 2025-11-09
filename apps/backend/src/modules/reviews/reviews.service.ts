import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewResponse, ReviewReport, ReviewHelpful } from './entities';
import {
  CreateReviewDto,
  UpdateReviewDto,
  FilterReviewsDto,
  CreateResponseDto,
  CreateReportDto,
  VoteHelpfulDto,
} from './dto';
import { ReviewStatus, ReviewSortBy } from '@travelink/types';
import { ReportStatus } from './entities/review-report.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewResponse)
    private responseRepository: Repository<ReviewResponse>,
    @InjectRepository(ReviewReport)
    private reportRepository: Repository<ReviewReport>,
    @InjectRepository(ReviewHelpful)
    private helpfulRepository: Repository<ReviewHelpful>,
  ) {}

  // ==================== REVIEWS ====================

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    // Verificar que el usuario no haya reseñado ya esta entidad
    const existing = await this.reviewRepository.findOne({
      where: {
        userId,
        reviewableType: dto.reviewableType,
        reviewableId: dto.reviewableId,
      },
    });

    if (existing) {
      throw new BadRequestException('Ya has reseñado esta entidad');
    }

    // Verificar si está vinculado a una reserva confirmada
    let isVerifiedPurchase = false;
    if (dto.bookingId) {
      // TODO: Verificar que la reserva exista y pertenezca al usuario
      isVerifiedPurchase = true;
    }

    const review = this.reviewRepository.create({
      ...dto,
      userId,
      isVerifiedPurchase,
      status: ReviewStatus.APPROVED, // Auto-aprobar por defecto, cambiar a PENDING si requiere moderación
    });

    return await this.reviewRepository.save(review);
  }

  async getReviews(filters: FilterReviewsDto): Promise<{
    items: Review[];
    total: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = ReviewSortBy.RECENT,
      ...where
    } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.responses', 'responses')
      .where('review.status = :status', { status: ReviewStatus.APPROVED });

    // Aplicar filtros
    if (filters.reviewableType) {
      queryBuilder.andWhere('review.reviewableType = :reviewableType', {
        reviewableType: filters.reviewableType,
      });
    }

    if (filters.reviewableId) {
      queryBuilder.andWhere('review.reviewableId = :reviewableId', {
        reviewableId: filters.reviewableId,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere('review.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.minRating) {
      queryBuilder.andWhere('review.rating >= :minRating', {
        minRating: filters.minRating,
      });
    }

    if (filters.maxRating) {
      queryBuilder.andWhere('review.rating <= :maxRating', {
        maxRating: filters.maxRating,
      });
    }

    if (filters.isVerifiedPurchase !== undefined) {
      queryBuilder.andWhere('review.isVerifiedPurchase = :isVerifiedPurchase', {
        isVerifiedPurchase: filters.isVerifiedPurchase,
      });
    }

    // Ordenamiento
    switch (sortBy) {
      case ReviewSortBy.RECENT:
        queryBuilder.orderBy('review.createdAt', 'DESC');
        break;
      case ReviewSortBy.RATING_HIGH:
        queryBuilder.orderBy('review.rating', 'DESC');
        break;
      case ReviewSortBy.RATING_LOW:
        queryBuilder.orderBy('review.rating', 'ASC');
        break;
      case ReviewSortBy.HELPFUL:
        queryBuilder.orderBy('review.helpfulCount', 'DESC');
        break;
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Calcular estadísticas
    const stats = await this.getReviewStats(
      filters.reviewableType,
      filters.reviewableId,
    );

    return {
      items,
      total,
      averageRating: stats.averageRating,
      ratingDistribution: stats.ratingDistribution,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReviewById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'responses', 'responses.review'],
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    return review;
  }

  async updateReview(
    id: string,
    userId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.getReviewById(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar esta reseña');
    }

    Object.assign(review, dto);
    review.isEdited = true;
    review.editedAt = new Date();

    return await this.reviewRepository.save(review);
  }

  async deleteReview(id: string, userId: string): Promise<void> {
    const review = await this.getReviewById(id);

    if (review.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar esta reseña',
      );
    }

    await this.reviewRepository.remove(review);
  }

  async getReviewStats(
    reviewableType?: string,
    reviewableId?: string,
  ): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .where('review.status = :status', { status: ReviewStatus.APPROVED });

    if (reviewableType) {
      queryBuilder.andWhere('review.reviewableType = :reviewableType', {
        reviewableType,
      });
    }

    if (reviewableId) {
      queryBuilder.andWhere('review.reviewableId = :reviewableId', {
        reviewableId,
      });
    }

    const reviews = await queryBuilder.getMany();

    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews,
      ratingDistribution,
    };
  }

  // ==================== RESPONSES ====================

  async createResponse(
    responderId: string,
    dto: CreateResponseDto,
  ): Promise<ReviewResponse> {
    const review = await this.getReviewById(dto.reviewId);

    // Verificar que no haya respondido ya
    const existing = await this.responseRepository.findOne({
      where: {
        reviewId: dto.reviewId,
        responderId,
      },
    });

    if (existing) {
      throw new BadRequestException('Ya has respondido a esta reseña');
    }

    // TODO: Verificar que el responderId sea el dueño de la entidad reseñada

    const response = this.responseRepository.create({
      ...dto,
      responderId,
    });

    return await this.responseRepository.save(response);
  }

  async updateResponse(
    id: string,
    responderId: string,
    message: string,
  ): Promise<ReviewResponse> {
    const response = await this.responseRepository.findOne({ where: { id } });

    if (!response) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    if (response.responderId !== responderId) {
      throw new ForbiddenException(
        'No tienes permisos para editar esta respuesta',
      );
    }

    response.message = message;
    response.isEdited = true;
    response.editedAt = new Date();

    return await this.responseRepository.save(response);
  }

  async deleteResponse(id: string, responderId: string): Promise<void> {
    const response = await this.responseRepository.findOne({ where: { id } });

    if (!response) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    if (response.responderId !== responderId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar esta respuesta',
      );
    }

    await this.responseRepository.remove(response);
  }

  // ==================== REPORTS ====================

  async reportReview(
    reporterId: string,
    dto: CreateReportDto,
  ): Promise<ReviewReport> {
    const review = await this.getReviewById(dto.reviewId);

    // Verificar que no haya reportado ya
    const existing = await this.reportRepository.findOne({
      where: {
        reviewId: dto.reviewId,
        reporterId,
      },
    });

    if (existing) {
      throw new BadRequestException('Ya has reportado esta reseña');
    }

    const report = this.reportRepository.create({
      ...dto,
      reporterId,
    });

    const savedReport = await this.reportRepository.save(report);

    // Incrementar contador de reportes en la reseña
    review.reportCount++;
    await this.reviewRepository.save(review);

    // Si hay muchos reportes, marcar automáticamente como FLAGGED
    if (review.reportCount >= 5) {
      review.status = ReviewStatus.FLAGGED;
      await this.reviewRepository.save(review);
    }

    return savedReport;
  }

  async getPendingReports(): Promise<ReviewReport[]> {
    return await this.reportRepository.find({
      where: { status: ReportStatus.PENDING },
      relations: ['review'],
      order: { createdAt: 'DESC' },
    });
  }

  async resolveReport(
    id: string,
    adminId: string,
    resolution: string,
  ): Promise<ReviewReport> {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    report.status = ReportStatus.RESOLVED;
    report.reviewedBy = adminId;
    report.reviewedAt = new Date();
    report.resolution = resolution;

    return await this.reportRepository.save(report);
  }

  // ==================== HELPFUL VOTES ====================

  async voteHelpful(userId: string, dto: VoteHelpfulDto): Promise<ReviewHelpful> {
    const review = await this.getReviewById(dto.reviewId);

    // Verificar si ya votó
    let vote = await this.helpfulRepository.findOne({
      where: {
        reviewId: dto.reviewId,
        userId,
      },
    });

    if (vote) {
      // Actualizar voto existente
      const oldValue = vote.isHelpful;
      vote.isHelpful = dto.isHelpful;

      // Actualizar contadores en la reseña
      if (oldValue !== dto.isHelpful) {
        if (dto.isHelpful) {
          review.helpfulCount++;
          review.notHelpfulCount--;
        } else {
          review.helpfulCount--;
          review.notHelpfulCount++;
        }
        await this.reviewRepository.save(review);
      }

      return await this.helpfulRepository.save(vote);
    } else {
      // Crear nuevo voto
      vote = this.helpfulRepository.create({
        ...dto,
        userId,
      });

      const savedVote = await this.helpfulRepository.save(vote);

      // Actualizar contadores en la reseña
      if (dto.isHelpful) {
        review.helpfulCount++;
      } else {
        review.notHelpfulCount++;
      }
      await this.reviewRepository.save(review);

      return savedVote;
    }
  }

  async removeVote(reviewId: string, userId: string): Promise<void> {
    const vote = await this.helpfulRepository.findOne({
      where: { reviewId, userId },
    });

    if (!vote) {
      throw new NotFoundException('Voto no encontrado');
    }

    const review = await this.getReviewById(reviewId);

    // Actualizar contadores
    if (vote.isHelpful) {
      review.helpfulCount--;
    } else {
      review.notHelpfulCount--;
    }
    await this.reviewRepository.save(review);

    await this.helpfulRepository.remove(vote);
  }

  // ==================== ADMIN ====================

  async moderateReview(
    id: string,
    adminId: string,
    status: ReviewStatus,
    reason?: string,
  ): Promise<Review> {
    const review = await this.getReviewById(id);

    review.status = status;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    review.moderationReason = reason;

    return await this.reviewRepository.save(review);
  }

  async getFlaggedReviews(): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { status: ReviewStatus.FLAGGED },
      relations: ['user', 'reports'],
      order: { createdAt: 'DESC' },
    });
  }
}
