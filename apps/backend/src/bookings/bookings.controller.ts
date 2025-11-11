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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CancelBookingDto,
  BookingFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data or not available.' })
  @ApiResponse({ status: 404, description: 'Experience not found.' })
  create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(req.user.userId, createBookingDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all bookings with pagination.' })
  findAll(@Query() filters: BookingFiltersDto) {
    return this.bookingsService.findAll(filters);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my bookings as a traveler' })
  @ApiResponse({ status: 200, description: 'List of user bookings.' })
  getMyBookings(@Request() req, @Query() filters: BookingFiltersDto) {
    return this.bookingsService.getMyBookings(req.user.userId, filters);
  }

  @Get('provider')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Get bookings received as a provider' })
  @ApiResponse({ status: 200, description: 'List of provider bookings.' })
  getProviderBookings(@Request() req, @Query() filters: BookingFiltersDto) {
    return this.bookingsService.getProviderBookings(req.user.userId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  @ApiResponse({ status: 200, description: 'Booking details.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this booking.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.bookingsService.findOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update booking (Provider or Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(
      id,
      req.user.userId,
      req.user.role,
      updateBookingDto,
    );
  }

  @Patch(':id/confirm')
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Confirm booking (Provider only)' })
  @ApiResponse({ status: 200, description: 'Booking confirmed.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot confirm this booking.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  confirm(@Param('id') id: string, @Request() req) {
    return this.bookingsService.confirm(id, req.user.userId);
  }

  @Patch(':id/reject')
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject booking (Provider only)' })
  @ApiResponse({ status: 200, description: 'Booking rejected.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot reject this booking.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  reject(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { reason: string },
  ) {
    return this.bookingsService.reject(id, req.user.userId, body.reason);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking (User or Provider)' })
  @ApiResponse({ status: 200, description: 'Booking cancelled.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot cancel this booking.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  cancel(
    @Param('id') id: string,
    @Request() req,
    @Body() cancelBookingDto: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(
      id,
      req.user.userId,
      req.user.role,
      cancelBookingDto,
    );
  }

  @Patch(':id/complete')
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark booking as completed (Provider only)' })
  @ApiResponse({ status: 200, description: 'Booking marked as completed.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot complete this booking.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  complete(@Param('id') id: string, @Request() req) {
    return this.bookingsService.complete(id, req.user.userId);
  }
}
