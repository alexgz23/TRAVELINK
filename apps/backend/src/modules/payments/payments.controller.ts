import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto, FilterPaymentDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { UserRole } from '@viajero-conectado/types';
import { User } from '@/modules/users/entities';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ========== Endpoints de Viajero ==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo pago' })
  @ApiResponse({ status: 201, description: 'Pago creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o reserva ya tiene pago' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  create(@CurrentUser() user: User, @Body() createDto: CreatePaymentDto) {
    return this.paymentsService.create(user.id, createDto);
  }

  @Post(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Procesar/confirmar pago' })
  @ApiResponse({ status: 200, description: 'Pago procesado exitosamente' })
  @ApiResponse({ status: 400, description: 'Solo se pueden procesar pagos pendientes' })
  process(@Param('id') id: string, @Body() processDto: ProcessPaymentDto) {
    return this.paymentsService.process(id, processDto);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reembolsar pago' })
  @ApiResponse({ status: 200, description: 'Pago reembolsado exitosamente' })
  @ApiResponse({ status: 400, description: 'Solo se pueden reembolsar pagos completados' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  refund(@Param('id') id: string, @CurrentUser() user: User, @Body() refundDto?: RefundPaymentDto) {
    return this.paymentsService.refund(id, user.id, refundDto);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis pagos' })
  @ApiResponse({ status: 200, description: 'Lista de mis pagos' })
  findMyPayments(@CurrentUser() user: User, @Query() filters: FilterPaymentDto) {
    return this.paymentsService.findByUser(user.id, filters);
  }

  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener pagos de una reserva' })
  @ApiResponse({ status: 200, description: 'Lista de pagos de la reserva' })
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener pago por ID' })
  @ApiResponse({ status: 200, description: 'Pago encontrado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  // ========== Endpoints de Agencia ==========

  @Get('agency/my-payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener pagos de mi agencia' })
  @ApiResponse({ status: 200, description: 'Lista de pagos de la agencia' })
  findAgencyPayments(@CurrentUser() user: User, @Query() filters: FilterPaymentDto) {
    return this.paymentsService.findByAgency(user.id, filters);
  }

  // ========== Endpoints Administrativos ==========

  @Post(':id/mark-failed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar pago como fallido (solo admin)' })
  @ApiResponse({ status: 200, description: 'Pago marcado como fallido' })
  markAsFailed(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.paymentsService.markAsFailed(id, reason);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los pagos (solo admin)' })
  @ApiResponse({ status: 200, description: 'Lista de todos los pagos' })
  findAll(@Query() filters: FilterPaymentDto) {
    return this.paymentsService.findAll(filters);
  }
}
