import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  ProviderResponseDto,
  ReviewFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a completed booking' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Booking not completed or already reviewed',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all reviews with filters' })
  @ApiResponse({ status: 200, description: 'List of reviews with pagination' })
  findAll(@Query() filters: ReviewFiltersDto) {
    return this.reviewsService.findAll(filters);
  }

  @Get('experience/:experienceId')
  @Public()
  @ApiOperation({ summary: 'Get reviews for a specific experience' })
  @ApiResponse({ status: 200, description: 'List of experience reviews' })
  getExperienceReviews(
    @Param('experienceId') experienceId: string,
    @Query() filters: ReviewFiltersDto,
  ) {
    return this.reviewsService.getExperienceReviews(experienceId, filters);
  }

  @Get('experience/:experienceId/stats')
  @Public()
  @ApiOperation({ summary: 'Get review statistics for an experience' })
  @ApiResponse({
    status: 200,
    description: 'Review statistics (average rating, distribution)',
  })
  getExperienceStats(@Param('experienceId') experienceId: string) {
    return this.reviewsService.getExperienceReviewStats(experienceId);
  }

  @Get('user/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reviews' })
  @ApiResponse({ status: 200, description: 'List of user reviews' })
  getMyReviews(@Request() req, @Query() filters: ReviewFiltersDto) {
    return this.reviewsService.getUserReviews(req.user.userId, filters);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review details' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Post(':id/response')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add provider response to a review' })
  @ApiResponse({ status: 200, description: 'Response added successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Already responded',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  addProviderResponse(
    @Param('id') id: string,
    @Request() req,
    @Body() providerResponseDto: ProviderResponseDto,
  ) {
    return this.reviewsService.addProviderResponse(
      id,
      req.user.userId,
      providerResponseDto,
    );
  }

  @Patch(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark review as helpful' })
  @ApiResponse({ status: 200, description: 'Review marked as helpful' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  markAsHelpful(@Param('id') id: string, @Request() req) {
    return this.reviewsService.markAsHelpful(id, req.user.userId);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderate review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review moderated' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  moderate(
    @Param('id') id: string,
    @Body() body: { isModerated: boolean; moderationNotes?: string },
  ) {
    return this.reviewsService.moderate(
      id,
      body.isModerated,
      body.moderationNotes,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review (Owner or Admin)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.userId, req.user.role);
  }
}
