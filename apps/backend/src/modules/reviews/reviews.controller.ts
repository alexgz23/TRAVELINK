import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  FilterReviewsDto,
  CreateResponseDto,
  CreateReportDto,
  VoteHelpfulDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole, ReviewStatus } from '@travelink/types';

interface User {
  id: string;
  email: string;
  role: UserRole;
}

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ==================== REVIEWS ====================

  /**
   * Crear nueva reseña
   */
  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateReviewDto) {
    return await this.reviewsService.create(user.id, dto);
  }

  /**
   * Obtener reseñas con filtros
   */
  @Get()
  async getReviews(@Query() filters: FilterReviewsDto) {
    return await this.reviewsService.getReviews(filters);
  }

  /**
   * Obtener reseña por ID
   */
  @Get(':id')
  async getReviewById(@Param('id') id: string) {
    return await this.reviewsService.getReviewById(id);
  }

  /**
   * Actualizar reseña
   */
  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateReviewDto,
  ) {
    return await this.reviewsService.updateReview(id, user.id, dto);
  }

  /**
   * Eliminar reseña
   */
  @Delete(':id')
  async deleteReview(@Param('id') id: string, @CurrentUser() user: User) {
    await this.reviewsService.deleteReview(id, user.id);
    return { message: 'Reseña eliminada exitosamente' };
  }

  /**
   * Obtener estadísticas de reseñas
   */
  @Get('stats/summary')
  async getReviewStats(
    @Query('reviewableType') reviewableType?: string,
    @Query('reviewableId') reviewableId?: string,
  ) {
    return await this.reviewsService.getReviewStats(
      reviewableType,
      reviewableId,
    );
  }

  // ==================== RESPONSES ====================

  /**
   * Crear respuesta a una reseña
   */
  @Post('responses')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async createResponse(
    @CurrentUser() user: User,
    @Body() dto: CreateResponseDto,
  ) {
    return await this.reviewsService.createResponse(user.id, dto);
  }

  /**
   * Actualizar respuesta
   */
  @Patch('responses/:id')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async updateResponse(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('message') message: string,
  ) {
    return await this.reviewsService.updateResponse(id, user.id, message);
  }

  /**
   * Eliminar respuesta
   */
  @Delete('responses/:id')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async deleteResponse(@Param('id') id: string, @CurrentUser() user: User) {
    await this.reviewsService.deleteResponse(id, user.id);
    return { message: 'Respuesta eliminada exitosamente' };
  }

  // ==================== REPORTS ====================

  /**
   * Reportar reseña inapropiada
   */
  @Post('report')
  async reportReview(@CurrentUser() user: User, @Body() dto: CreateReportDto) {
    return await this.reviewsService.reportReview(user.id, dto);
  }

  /**
   * Obtener reportes pendientes (admin)
   */
  @Get('admin/reports/pending')
  @Roles(UserRole.ADMIN)
  async getPendingReports() {
    return await this.reviewsService.getPendingReports();
  }

  /**
   * Resolver reporte (admin)
   */
  @Post('admin/reports/:id/resolve')
  @Roles(UserRole.ADMIN)
  async resolveReport(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('resolution') resolution: string,
  ) {
    return await this.reviewsService.resolveReport(id, user.id, resolution);
  }

  // ==================== HELPFUL VOTES ====================

  /**
   * Votar si una reseña es útil
   */
  @Post('helpful')
  async voteHelpful(@CurrentUser() user: User, @Body() dto: VoteHelpfulDto) {
    return await this.reviewsService.voteHelpful(user.id, dto);
  }

  /**
   * Remover voto de utilidad
   */
  @Delete('helpful/:reviewId')
  async removeVote(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: User,
  ) {
    await this.reviewsService.removeVote(reviewId, user.id);
    return { message: 'Voto removido exitosamente' };
  }

  // ==================== MODERATION (ADMIN) ====================

  /**
   * Moderar reseña (aprobar/rechazar/ocultar)
   */
  @Post('admin/:id/moderate')
  @Roles(UserRole.ADMIN)
  async moderateReview(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('status') status: ReviewStatus,
    @Body('reason') reason?: string,
  ) {
    return await this.reviewsService.moderateReview(id, user.id, status, reason);
  }

  /**
   * Obtener reseñas reportadas/flagged (admin)
   */
  @Get('admin/flagged')
  @Roles(UserRole.ADMIN)
  async getFlaggedReviews() {
    return await this.reviewsService.getFlaggedReviews();
  }
}
