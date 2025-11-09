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
import { B2BService } from './b2b.service';
import {
  CreateAllianceDto,
  UpdateAllianceDto,
  CreateContractDto,
  UpdateContractDto,
  CreateTransactionDto,
  FilterAlliancesDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '@travelink/types';

interface User {
  id: string;
  email: string;
  role: UserRole;
}

@Controller('b2b')
@UseGuards(JwtAuthGuard, RolesGuard)
export class B2BController {
  constructor(private readonly b2bService: B2BService) {}

  // ==================== ALLIANCES ====================

  /**
   * Crear nueva solicitud de alianza
   * Solo AGENCIA puede crear alianzas
   */
  @Post('alliances')
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  async createAlliance(
    @CurrentUser() user: User,
    @Body() dto: CreateAllianceDto,
  ) {
    return await this.b2bService.createAlliance(user.id, dto);
  }

  /**
   * Obtener todas las alianzas (admin)
   */
  @Get('alliances')
  @Roles(UserRole.ADMIN)
  async getAlliances(@Query() filters: FilterAlliancesDto) {
    return await this.b2bService.getAlliances(filters);
  }

  /**
   * Obtener mis alianzas (como agencia o proveedor)
   */
  @Get('alliances/my-alliances')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async getMyAlliances(@CurrentUser() user: User, @Query() filters: FilterAlliancesDto) {
    return await this.b2bService.getMyAlliances(user.id, filters);
  }

  /**
   * Obtener alianza por ID
   */
  @Get('alliances/:id')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async getAllianceById(@Param('id') id: string) {
    return await this.b2bService.getAllianceById(id);
  }

  /**
   * Actualizar alianza
   * Solo la agencia puede actualizar
   */
  @Patch('alliances/:id')
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  async updateAlliance(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateAllianceDto,
  ) {
    return await this.b2bService.updateAlliance(id, user.id, dto);
  }

  /**
   * Eliminar alianza
   * Solo la agencia puede eliminar (y solo si está en PENDING o REJECTED)
   */
  @Delete('alliances/:id')
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  async deleteAlliance(@Param('id') id: string, @CurrentUser() user: User) {
    await this.b2bService.deleteAlliance(id, user.id);
    return { message: 'Alianza eliminada exitosamente' };
  }

  /**
   * Aceptar solicitud de alianza
   * Solo el proveedor puede aceptar
   */
  @Post('alliances/:id/accept')
  @Roles(UserRole.HOTEL, UserRole.GUIA, UserRole.CONDUCTOR, UserRole.ADMIN)
  async acceptAlliance(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.b2bService.acceptAlliance(id, user.id);
  }

  /**
   * Rechazar solicitud de alianza
   * Solo el proveedor puede rechazar
   */
  @Post('alliances/:id/reject')
  @Roles(UserRole.HOTEL, UserRole.GUIA, UserRole.CONDUCTOR, UserRole.ADMIN)
  async rejectAlliance(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('reason') reason: string,
  ) {
    return await this.b2bService.rejectAlliance(id, user.id, reason);
  }

  /**
   * Obtener métricas de una alianza
   */
  @Get('alliances/:id/metrics')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async getAllianceMetrics(@Param('id') id: string) {
    return await this.b2bService.getAllianceMetrics(id);
  }

  // ==================== CONTRACTS ====================

  /**
   * Crear nuevo contrato para una alianza
   */
  @Post('contracts')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async createContract(@CurrentUser() user: User, @Body() dto: CreateContractDto) {
    return await this.b2bService.createContract(user.id, dto);
  }

  /**
   * Obtener contratos de una alianza
   */
  @Get('alliances/:allianceId/contracts')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async getContractsByAlliance(@Param('allianceId') allianceId: string) {
    return await this.b2bService.getContractsByAlliance(allianceId);
  }

  /**
   * Obtener contrato por ID
   */
  @Get('contracts/:id')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async getContractById(@Param('id') id: string) {
    return await this.b2bService.getContractById(id);
  }

  /**
   * Actualizar contrato
   */
  @Patch('contracts/:id')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async updateContract(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateContractDto,
  ) {
    return await this.b2bService.updateContract(id, user.id, dto);
  }

  /**
   * Firmar contrato
   */
  @Post('contracts/:id/sign')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async signContract(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('signatureUrl') signatureUrl: string,
  ) {
    return await this.b2bService.signContract(id, user.id, signatureUrl);
  }

  // ==================== TRANSACTIONS ====================

  /**
   * Crear nueva transacción de comisión
   */
  @Post('transactions')
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  async createTransaction(@Body() dto: CreateTransactionDto) {
    return await this.b2bService.createTransaction(dto);
  }

  /**
   * Obtener transacciones de una alianza
   */
  @Get('alliances/:allianceId/transactions')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async getTransactionsByAlliance(@Param('allianceId') allianceId: string) {
    return await this.b2bService.getTransactionsByAlliance(allianceId);
  }

  /**
   * Obtener transacción por ID
   */
  @Get('transactions/:id')
  @Roles(
    UserRole.AGENCIA,
    UserRole.HOTEL,
    UserRole.GUIA,
    UserRole.CONDUCTOR,
    UserRole.ADMIN,
  )
  async getTransactionById(@Param('id') id: string) {
    return await this.b2bService.getTransactionById(id);
  }

  /**
   * Marcar transacción como pagada
   */
  @Post('transactions/:id/pay')
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  async markTransactionAsPaid(
    @Param('id') id: string,
    @Body('paymentReference') paymentReference: string,
  ) {
    return await this.b2bService.markTransactionAsPaid(id, paymentReference);
  }

  /**
   * Cancelar transacción
   */
  @Post('transactions/:id/cancel')
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  async cancelTransaction(@Param('id') id: string) {
    return await this.b2bService.cancelTransaction(id);
  }
}
