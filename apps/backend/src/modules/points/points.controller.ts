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
import { PointsService } from './points.service';
import {
  RedeemRewardDto,
  CreateRewardDto,
  UpdateRewardDto,
  AdjustPointsDto,
  FilterTransactionsDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { UserRole, RedemptionStatus } from '@viajero-conectado/types';
import { User } from '@/modules/users/entities';

@ApiTags('points')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  // ========== Endpoints de Viajero ==========

  @Get('balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi balance de puntos y nivel' })
  @ApiResponse({ status: 200, description: 'Balance de puntos' })
  getBalance(@CurrentUser() user: User) {
    return this.pointsService.getBalance(user.id);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi historial de transacciones de puntos' })
  @ApiResponse({ status: 200, description: 'Historial de transacciones' })
  getTransactions(@CurrentUser() user: User, @Query() filters: FilterTransactionsDto) {
    return this.pointsService.getTransactions(user.id, filters);
  }

  @Get('rewards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener recompensas disponibles para mí' })
  @ApiResponse({ status: 200, description: 'Lista de recompensas disponibles' })
  getAvailableRewards(@CurrentUser() user: User) {
    return this.pointsService.getAvailableRewards(user.id);
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Canjear recompensa con puntos' })
  @ApiResponse({ status: 201, description: 'Recompensa canjeada exitosamente' })
  @ApiResponse({ status: 400, description: 'Puntos insuficientes o recompensa no disponible' })
  @ApiResponse({ status: 403, description: 'No cumples el nivel mínimo' })
  redeemReward(@CurrentUser() user: User, @Body() redeemDto: RedeemRewardDto) {
    return this.pointsService.redeemReward(user.id, redeemDto);
  }

  @Get('my-redemptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VIAJERO, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis canjes de recompensas' })
  @ApiResponse({ status: 200, description: 'Lista de mis canjes' })
  getMyRedemptions(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pointsService.getMyRedemptions(user.id, page, limit);
  }

  // ========== Endpoints Administrativos ==========

  @Post('admin/adjust/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ajustar puntos manualmente (admin)' })
  @ApiResponse({ status: 201, description: 'Puntos ajustados' })
  adjustPoints(@Param('userId') userId: string, @Body() adjustDto: AdjustPointsDto) {
    return this.pointsService.adjustPoints(userId, adjustDto);
  }

  @Post('admin/rewards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva recompensa (admin)' })
  @ApiResponse({ status: 201, description: 'Recompensa creada' })
  createReward(@Body() createDto: CreateRewardDto) {
    return this.pointsService.createReward(createDto);
  }

  @Get('admin/rewards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las recompensas (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de recompensas' })
  getAllRewards() {
    return this.pointsService.getAllRewards();
  }

  @Patch('admin/rewards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar recompensa (admin)' })
  @ApiResponse({ status: 200, description: 'Recompensa actualizada' })
  updateReward(@Param('id') id: string, @Body() updateDto: UpdateRewardDto) {
    return this.pointsService.updateReward(id, updateDto);
  }

  @Delete('admin/rewards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar recompensa (admin)' })
  @ApiResponse({ status: 204, description: 'Recompensa eliminada' })
  deleteReward(@Param('id') id: string) {
    return this.pointsService.deleteReward(id);
  }

  @Get('admin/redemptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los canjes (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de canjes' })
  getAllRedemptions(@Query() filters: FilterTransactionsDto) {
    return this.pointsService.getAllRedemptions(filters);
  }

  @Patch('admin/redemptions/:id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Procesar canje (admin)' })
  @ApiResponse({ status: 200, description: 'Canje procesado' })
  processRedemption(
    @Param('id') redemptionId: string,
    @Body('status') status: RedemptionStatus,
  ) {
    return this.pointsService.processRedemption(redemptionId, status);
  }

  @Post('admin/process-expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Procesar puntos expirados (admin/cron)' })
  @ApiResponse({ status: 200, description: 'Puntos expirados procesados' })
  async processExpiredPoints() {
    const count = await this.pointsService.processExpiredPoints();
    return { processedTransactions: count };
  }
}
