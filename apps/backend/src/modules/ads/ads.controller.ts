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
import { AdsService } from './ads.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateAdDto,
  UpdateAdDto,
  RecordImpressionDto,
  RecordClickDto,
  RecordConversionDto,
  FilterCampaignsDto,
  FilterAdsDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles, CurrentUser, Public } from '@/common/decorators';
import { UserRole } from '@viajero-conectado/types';
import { User } from '@/modules/users/entities';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // ========== Endpoints de Agencia ==========

  @Post('campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear campaña publicitaria' })
  @ApiResponse({ status: 201, description: 'Campaña creada' })
  createCampaign(@CurrentUser() user: User, @Body() createDto: CreateCampaignDto) {
    return this.adsService.createCampaign(user.id, createDto);
  }

  @Get('campaigns/my-campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis campañas' })
  @ApiResponse({ status: 200, description: 'Lista de mis campañas' })
  getMyCampaigns(@CurrentUser() user: User, @Query() filters: FilterCampaignsDto) {
    return this.adsService.getMyCampaigns(user.id, filters);
  }

  @Get('campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener campaña por ID' })
  @ApiResponse({ status: 200, description: 'Campaña encontrada' })
  getCampaign(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adsService.getCampaign(id, user.id);
  }

  @Patch('campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar campaña' })
  @ApiResponse({ status: 200, description: 'Campaña actualizada' })
  updateCampaign(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateDto: UpdateCampaignDto,
  ) {
    return this.adsService.updateCampaign(id, user.id, updateDto);
  }

  @Delete('campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar campaña' })
  @ApiResponse({ status: 204, description: 'Campaña eliminada' })
  deleteCampaign(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adsService.deleteCampaign(id, user.id);
  }

  @Post('campaigns/:id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar campaña a aprobación' })
  @ApiResponse({ status: 200, description: 'Campaña enviada a aprobación' })
  submitForApproval(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adsService.submitForApproval(id, user.id);
  }

  @Post('campaigns/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pausar/reanudar campaña' })
  @ApiResponse({ status: 200, description: 'Estado de campaña actualizado' })
  toggleCampaignStatus(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adsService.toggleCampaignStatus(id, user.id);
  }

  @Get('campaigns/:id/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener métricas de campaña' })
  @ApiResponse({ status: 200, description: 'Métricas de la campaña' })
  getCampaignMetrics(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adsService.getCampaignMetrics(id, user.id);
  }

  // ========== Anuncios ==========

  @Post('ads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear anuncio' })
  @ApiResponse({ status: 201, description: 'Anuncio creado' })
  createAd(@CurrentUser() user: User, @Body() createDto: CreateAdDto) {
    return this.adsService.createAd(user.id, createDto);
  }

  @Get('ads/my-ads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis anuncios' })
  @ApiResponse({ status: 200, description: 'Lista de mis anuncios' })
  getMyAds(@CurrentUser() user: User, @Query() filters: FilterAdsDto) {
    return this.adsService.getMyAds(user.id, filters);
  }

  @Get('ads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener anuncio por ID' })
  @ApiResponse({ status: 200, description: 'Anuncio encontrado' })
  getAd(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adsService.getAd(id, user.id);
  }

  @Patch('ads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar anuncio' })
  @ApiResponse({ status: 200, description: 'Anuncio actualizado' })
  updateAd(@Param('id') id: string, @CurrentUser() user: User, @Body() updateDto: UpdateAdDto) {
    return this.adsService.updateAd(id, user.id, updateDto);
  }

  @Delete('ads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar anuncio' })
  @ApiResponse({ status: 204, description: 'Anuncio eliminado' })
  deleteAd(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adsService.deleteAd(id, user.id);
  }

  @Get('ads/:id/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener métricas de anuncio' })
  @ApiResponse({ status: 200, description: 'Métricas del anuncio' })
  getAdMetrics(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adsService.getAdMetrics(id, user.id, startDate, endDate);
  }

  // ========== Tracking (público) ==========

  @Post('track/impression')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Registrar impresión de anuncio (público)' })
  @ApiResponse({ status: 204, description: 'Impresión registrada' })
  recordImpression(@Body() dto: RecordImpressionDto) {
    return this.adsService.recordImpression(dto);
  }

  @Post('track/click')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Registrar clic en anuncio (público)' })
  @ApiResponse({ status: 204, description: 'Clic registrado' })
  recordClick(@Body() dto: RecordClickDto) {
    return this.adsService.recordClick(dto);
  }

  @Post('track/conversion')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Registrar conversión (reserva generada)' })
  @ApiResponse({ status: 204, description: 'Conversión registrada' })
  recordConversion(@Body() dto: RecordConversionDto) {
    return this.adsService.recordConversion(dto);
  }

  // ========== Endpoints Admin ==========

  @Get('admin/campaigns/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar campañas pendientes de aprobación (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de campañas pendientes' })
  getPendingCampaigns(@Query() filters: FilterCampaignsDto) {
    return this.adsService.getPendingCampaigns(filters);
  }

  @Post('admin/campaigns/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprobar campaña (admin)' })
  @ApiResponse({ status: 200, description: 'Campaña aprobada' })
  approveCampaign(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adsService.approveCampaign(id, user.id);
  }

  @Post('admin/campaigns/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechazar campaña (admin)' })
  @ApiResponse({ status: 200, description: 'Campaña rechazada' })
  rejectCampaign(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adsService.rejectCampaign(id, reason);
  }

  @Get('admin/campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las campañas (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de campañas' })
  getAllCampaigns(@Query() filters: FilterCampaignsDto) {
    return this.adsService.getAllCampaigns(filters);
  }

  @Post('admin/check-budgets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar presupuestos diarios (admin/cron)' })
  @ApiResponse({ status: 200, description: 'Presupuestos verificados' })
  checkDailyBudgets() {
    return this.adsService.checkDailyBudgets();
  }
}
