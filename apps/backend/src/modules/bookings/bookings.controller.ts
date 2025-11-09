import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, AddTravelerDto, FilterBookingDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { UserRole } from '@viajero-conectado/types';
import { User } from '@/modules/users/entities';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ========== Endpoints de Viajero ==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva reserva' })
  @ApiResponse({ status: 201, description: 'Reserva creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o experiencia no disponible' })
  create(@CurrentUser() user: User, @Body() createDto: CreateBookingDto) {
    return this.bookingsService.create(user.id, createDto);
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis reservas' })
  @ApiResponse({ status: 200, description: 'Lista de mis reservas' })
  findMyBookings(@CurrentUser() user: User, @Query() filters: FilterBookingDto) {
    return this.bookingsService.findByUser(user.id, filters);
  }

  @Get('number/:bookingNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener reserva por número de reserva' })
  @ApiResponse({ status: 200, description: 'Reserva encontrada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  findByBookingNumber(@Param('bookingNumber') bookingNumber: string) {
    return this.bookingsService.findByBookingNumber(bookingNumber);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener reserva por ID' })
  @ApiResponse({ status: 200, description: 'Reserva encontrada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar reserva' })
  @ApiResponse({ status: 200, description: 'Reserva actualizada' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  @ApiResponse({ status: 400, description: 'No se puede actualizar' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() updateDto: UpdateBookingDto) {
    return this.bookingsService.update(id, user.id, updateDto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar reserva' })
  @ApiResponse({ status: 200, description: 'Reserva cancelada' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  @ApiResponse({ status: 400, description: 'No se puede cancelar' })
  cancel(@Param('id') id: string, @CurrentUser() user: User, @Body('reason') reason?: string) {
    return this.bookingsService.cancel(id, user.id, reason);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar reserva' })
  @ApiResponse({ status: 204, description: 'Reserva eliminada' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.remove(id, user.id);
  }

  // ========== Viajeros ==========

  @Post(':id/travelers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar viajero a la reserva' })
  @ApiResponse({ status: 201, description: 'Viajero agregado' })
  addTraveler(@Param('id') bookingId: string, @Body() addTravelerDto: AddTravelerDto) {
    return this.bookingsService.addTraveler(bookingId, addTravelerDto);
  }

  @Get(':id/travelers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener viajeros de la reserva' })
  @ApiResponse({ status: 200, description: 'Lista de viajeros' })
  getTravelers(@Param('id') bookingId: string) {
    return this.bookingsService.getTravelers(bookingId);
  }

  @Delete('travelers/:travelerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar viajero de la reserva' })
  @ApiResponse({ status: 204, description: 'Viajero eliminado' })
  removeTraveler(@Param('travelerId') travelerId: string) {
    return this.bookingsService.removeTraveler(travelerId);
  }

  // ========== Endpoints de Agencia ==========

  @Get('agency/my-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener reservas de mi agencia' })
  @ApiResponse({ status: 200, description: 'Lista de reservas de la agencia' })
  findAgencyBookings(@CurrentUser() user: User, @Query() filters: FilterBookingDto) {
    return this.bookingsService.findByAgency(user.id, filters);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmar reserva (solo agencia)' })
  @ApiResponse({ status: 200, description: 'Reserva confirmada' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  confirm(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.confirm(id, user.id);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Completar reserva (solo agencia)' })
  @ApiResponse({ status: 200, description: 'Reserva completada' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.complete(id, user.id);
  }
}
