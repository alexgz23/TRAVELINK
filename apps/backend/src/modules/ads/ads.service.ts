import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { Campaign, Ad, AdMetrics } from './entities';
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
import {
  CampaignStatus,
  AdStatus,
  BillingType,
} from '@viajero-conectado/types';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>,
    @InjectRepository(AdMetrics)
    private readonly metricsRepository: Repository<AdMetrics>,
  ) {}

  // ========== Campañas ==========

  /**
   * Crear campaña
   */
  async createCampaign(agencyId: string, createDto: CreateCampaignDto): Promise<Campaign> {
    // Validar fechas
    if (createDto.endDate <= createDto.startDate) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Validar presupuesto diario
    if (createDto.dailyBudget && createDto.dailyBudget > createDto.totalBudget) {
      throw new BadRequestException('El presupuesto diario no puede ser mayor al presupuesto total');
    }

    const campaign = this.campaignRepository.create({
      agencyId,
      ...createDto,
      status: CampaignStatus.DRAFT,
    });

    return this.campaignRepository.save(campaign);
  }

  /**
   * Obtener campañas de una agencia
   */
  async getMyCampaigns(agencyId: string, filters: FilterCampaignsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Campaign> = { agencyId };

    if (filters.status) {
      where.status = filters.status;
    }

    const [items, total] = await this.campaignRepository.findAndCount({
      where,
      relations: ['ads'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener campaña por ID
   */
  async getCampaign(id: string, agencyId?: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['ads', 'ads.metrics'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaña no encontrada');
    }

    // Si es agencia, verificar que sea dueña
    if (agencyId && campaign.agencyId !== agencyId) {
      throw new ForbiddenException('No tienes permisos para ver esta campaña');
    }

    return campaign;
  }

  /**
   * Actualizar campaña
   */
  async updateCampaign(id: string, agencyId: string, updateDto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.getCampaign(id, agencyId);

    // No permitir actualizar si ya está aprobada o activa
    if ([CampaignStatus.ACTIVE, CampaignStatus.COMPLETED].includes(campaign.status)) {
      throw new BadRequestException('No se puede actualizar una campaña activa o completada');
    }

    Object.assign(campaign, updateDto);

    // Si se modificó, volver a draft
    if (campaign.status === CampaignStatus.PENDING_APPROVAL) {
      campaign.status = CampaignStatus.DRAFT;
    }

    return this.campaignRepository.save(campaign);
  }

  /**
   * Eliminar campaña
   */
  async deleteCampaign(id: string, agencyId: string): Promise<void> {
    const campaign = await this.getCampaign(id, agencyId);

    if (campaign.status === CampaignStatus.ACTIVE) {
      throw new BadRequestException('No se puede eliminar una campaña activa');
    }

    await this.campaignRepository.remove(campaign);
  }

  /**
   * Enviar campaña a aprobación
   */
  async submitForApproval(id: string, agencyId: string): Promise<Campaign> {
    const campaign = await this.getCampaign(id, agencyId);

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Solo se pueden enviar campañas en borrador');
    }

    // Verificar que tenga al menos un anuncio
    if (!campaign.ads || campaign.ads.length === 0) {
      throw new BadRequestException('La campaña debe tener al menos un anuncio');
    }

    campaign.status = CampaignStatus.PENDING_APPROVAL;
    return this.campaignRepository.save(campaign);
  }

  /**
   * Pausar/reanudar campaña
   */
  async toggleCampaignStatus(id: string, agencyId: string): Promise<Campaign> {
    const campaign = await this.getCampaign(id, agencyId);

    if (campaign.status === CampaignStatus.ACTIVE) {
      campaign.status = CampaignStatus.PAUSED;
    } else if (campaign.status === CampaignStatus.PAUSED) {
      campaign.status = CampaignStatus.ACTIVE;
    } else {
      throw new BadRequestException('Solo se pueden pausar/reanudar campañas activas o pausadas');
    }

    return this.campaignRepository.save(campaign);
  }

  // ========== Anuncios ==========

  /**
   * Crear anuncio
   */
  async createAd(agencyId: string, createDto: CreateAdDto): Promise<Ad> {
    // Verificar que la campaña existe y pertenece a la agencia
    const campaign = await this.getCampaign(createDto.campaignId, agencyId);

    // Validar que el anuncio tenga imagen o video según formato
    if (createDto.format === 'story' && !createDto.imageUrl && !createDto.videoUrl) {
      throw new BadRequestException('Los anuncios tipo story requieren imagen o video');
    }

    const ad = this.adRepository.create({
      ...createDto,
      status: AdStatus.DRAFT,
    });

    return this.adRepository.save(ad);
  }

  /**
   * Obtener anuncios
   */
  async getMyAds(agencyId: string, filters: FilterAdsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    let query = this.adRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.campaign', 'campaign')
      .leftJoinAndSelect('ad.experience', 'experience')
      .where('campaign.agencyId = :agencyId', { agencyId });

    if (filters.status) {
      query = query.andWhere('ad.status = :status', { status: filters.status });
    }

    if (filters.campaignId) {
      query = query.andWhere('ad.campaignId = :campaignId', { campaignId: filters.campaignId });
    }

    query = query.orderBy('ad.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener anuncio por ID
   */
  async getAd(id: string, agencyId?: string): Promise<Ad> {
    const ad = await this.adRepository.findOne({
      where: { id },
      relations: ['campaign', 'experience', 'metrics'],
    });

    if (!ad) {
      throw new NotFoundException('Anuncio no encontrado');
    }

    if (agencyId && ad.campaign.agencyId !== agencyId) {
      throw new ForbiddenException('No tienes permisos para ver este anuncio');
    }

    return ad;
  }

  /**
   * Actualizar anuncio
   */
  async updateAd(id: string, agencyId: string, updateDto: UpdateAdDto): Promise<Ad> {
    const ad = await this.getAd(id, agencyId);

    if ([AdStatus.ACTIVE, AdStatus.REJECTED].includes(ad.status)) {
      throw new BadRequestException('No se puede actualizar un anuncio activo o rechazado');
    }

    Object.assign(ad, updateDto);

    if (ad.status === AdStatus.PENDING_APPROVAL) {
      ad.status = AdStatus.DRAFT;
    }

    return this.adRepository.save(ad);
  }

  /**
   * Eliminar anuncio
   */
  async deleteAd(id: string, agencyId: string): Promise<void> {
    const ad = await this.getAd(id, agencyId);

    if (ad.status === AdStatus.ACTIVE) {
      throw new BadRequestException('No se puede eliminar un anuncio activo');
    }

    await this.adRepository.remove(ad);
  }

  // ========== Métricas ==========

  /**
   * Registrar impresión
   */
  async recordImpression(dto: RecordImpressionDto): Promise<void> {
    const ad = await this.adRepository.findOne({
      where: { id: dto.adId },
      relations: ['campaign'],
    });

    if (!ad || ad.status !== AdStatus.ACTIVE) {
      return; // Silently ignore for inactive ads
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let metrics = await this.metricsRepository.findOne({
      where: { adId: dto.adId, date: today },
    });

    if (!metrics) {
      metrics = this.metricsRepository.create({
        adId: dto.adId,
        date: today,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spent: 0,
        reach: 0,
      });
    }

    metrics.impressions += 1;

    // Calcular costo por impresión (CPM)
    if (ad.campaign.billingType === BillingType.CPM && ad.cpmBid) {
      const costPerImpression = ad.cpmBid / 1000;
      metrics.spent += costPerImpression;

      // Actualizar presupuesto gastado de la campaña
      await this.updateCampaignSpent(ad.campaign.id, costPerImpression);
    }

    await this.metricsRepository.save(metrics);
  }

  /**
   * Registrar clic
   */
  async recordClick(dto: RecordClickDto): Promise<void> {
    const ad = await this.adRepository.findOne({
      where: { id: dto.adId },
      relations: ['campaign'],
    });

    if (!ad || ad.status !== AdStatus.ACTIVE) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let metrics = await this.metricsRepository.findOne({
      where: { adId: dto.adId, date: today },
    });

    if (!metrics) {
      metrics = this.metricsRepository.create({
        adId: dto.adId,
        date: today,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spent: 0,
        reach: 0,
      });
    }

    metrics.clicks += 1;

    // Calcular costo por clic (CPC)
    if (ad.campaign.billingType === BillingType.CPC && ad.cpcBid) {
      metrics.spent += ad.cpcBid;

      // Actualizar presupuesto gastado de la campaña
      await this.updateCampaignSpent(ad.campaign.id, ad.cpcBid);
    }

    await this.metricsRepository.save(metrics);
  }

  /**
   * Registrar conversión (reserva generada)
   */
  async recordConversion(dto: RecordConversionDto): Promise<void> {
    const ad = await this.adRepository.findOne({
      where: { id: dto.adId },
    });

    if (!ad) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let metrics = await this.metricsRepository.findOne({
      where: { adId: dto.adId, date: today },
    });

    if (!metrics) {
      metrics = this.metricsRepository.create({
        adId: dto.adId,
        date: today,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spent: 0,
        reach: 0,
      });
    }

    metrics.conversions += 1;

    await this.metricsRepository.save(metrics);
  }

  /**
   * Obtener métricas de anuncio
   */
  async getAdMetrics(adId: string, agencyId: string, startDate?: string, endDate?: string) {
    await this.getAd(adId, agencyId); // Verificar permisos

    const where: any = { adId };

    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }

    const metrics = await this.metricsRepository.find({
      where,
      order: { date: 'DESC' },
    });

    // Calcular totales
    const totals = metrics.reduce(
      (acc, m) => ({
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
        spent: acc.spent + Number(m.spent),
        reach: acc.reach + m.reach,
      }),
      { impressions: 0, clicks: 0, conversions: 0, spent: 0, reach: 0 },
    );

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spent / totals.clicks : 0;
    const cpm = totals.impressions > 0 ? (totals.spent / totals.impressions) * 1000 : 0;

    return {
      metrics,
      totals,
      analytics: {
        ctr: Number(ctr.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
        cpc: Number(cpc.toFixed(2)),
        cpm: Number(cpm.toFixed(2)),
      },
    };
  }

  /**
   * Obtener métricas de campaña
   */
  async getCampaignMetrics(campaignId: string, agencyId: string) {
    const campaign = await this.getCampaign(campaignId, agencyId);

    const metrics = await this.metricsRepository
      .createQueryBuilder('metrics')
      .leftJoin('metrics.ad', 'ad')
      .where('ad.campaignId = :campaignId', { campaignId })
      .select('SUM(metrics.impressions)', 'impressions')
      .addSelect('SUM(metrics.clicks)', 'clicks')
      .addSelect('SUM(metrics.conversions)', 'conversions')
      .addSelect('SUM(metrics.spent)', 'spent')
      .addSelect('SUM(metrics.reach)', 'reach')
      .getRawOne();

    const totals = {
      impressions: Number(metrics.impressions) || 0,
      clicks: Number(metrics.clicks) || 0,
      conversions: Number(metrics.conversions) || 0,
      spent: Number(metrics.spent) || 0,
      reach: Number(metrics.reach) || 0,
    };

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalBudget: campaign.totalBudget,
        spentBudget: campaign.spentBudget,
        remainingBudget: Number(campaign.totalBudget) - Number(campaign.spentBudget),
      },
      totals,
      analytics: {
        ctr: Number(ctr.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
        budgetUsed: ((Number(campaign.spentBudget) / Number(campaign.totalBudget)) * 100).toFixed(2),
      },
    };
  }

  // ========== Admin ==========

  /**
   * Listar todas las campañas pendientes (admin)
   */
  async getPendingCampaigns(filters: FilterCampaignsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.campaignRepository.findAndCount({
      where: { status: CampaignStatus.PENDING_APPROVAL },
      relations: ['agency', 'agency.profile', 'ads'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Aprobar campaña (admin)
   */
  async approveCampaign(id: string, adminId: string): Promise<Campaign> {
    const campaign = await this.getCampaign(id);

    if (campaign.status !== CampaignStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Solo se pueden aprobar campañas pendientes');
    }

    campaign.status = CampaignStatus.ACTIVE;
    campaign.approvedAt = new Date();
    campaign.approvedBy = adminId;

    // Activar todos los anuncios de la campaña
    await this.adRepository.update(
      { campaignId: id, status: AdStatus.PENDING_APPROVAL },
      { status: AdStatus.ACTIVE, approvedAt: new Date() },
    );

    return this.campaignRepository.save(campaign);
  }

  /**
   * Rechazar campaña (admin)
   */
  async rejectCampaign(id: string, reason: string): Promise<Campaign> {
    const campaign = await this.getCampaign(id);

    if (campaign.status !== CampaignStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Solo se pueden rechazar campañas pendientes');
    }

    campaign.status = CampaignStatus.REJECTED;
    campaign.rejectionReason = reason;

    // Rechazar todos los anuncios de la campaña
    await this.adRepository.update(
      { campaignId: id, status: AdStatus.PENDING_APPROVAL },
      { status: AdStatus.REJECTED, rejectionReason: reason },
    );

    return this.campaignRepository.save(campaign);
  }

  /**
   * Listar todas las campañas (admin)
   */
  async getAllCampaigns(filters: FilterCampaignsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Campaign> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    const [items, total] = await this.campaignRepository.findAndCount({
      where,
      relations: ['agency', 'agency.profile'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========== Métodos auxiliares ==========

  /**
   * Actualizar presupuesto gastado de campaña
   */
  private async updateCampaignSpent(campaignId: string, amount: number) {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });

    if (!campaign) {
      return;
    }

    campaign.spentBudget = Number(campaign.spentBudget) + amount;

    // Si se alcanzó el presupuesto, pausar la campaña
    if (campaign.spentBudget >= campaign.totalBudget) {
      campaign.status = CampaignStatus.COMPLETED;
    }

    await this.campaignRepository.save(campaign);
  }

  /**
   * Verificar presupuesto diario (cron job)
   */
  async checkDailyBudgets() {
    const activeCampaigns = await this.campaignRepository.find({
      where: { status: CampaignStatus.ACTIVE },
      relations: ['ads', 'ads.metrics'],
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const campaign of activeCampaigns) {
      if (!campaign.dailyBudget) continue;

      // Calcular gasto del día
      const dailySpent = await this.metricsRepository
        .createQueryBuilder('metrics')
        .leftJoin('metrics.ad', 'ad')
        .where('ad.campaignId = :campaignId', { campaignId: campaign.id })
        .andWhere('metrics.date = :date', { date: today })
        .select('SUM(metrics.spent)', 'total')
        .getRawOne();

      const spent = Number(dailySpent.total) || 0;

      // Si excedió el presupuesto diario, pausar
      if (spent >= campaign.dailyBudget) {
        campaign.status = CampaignStatus.PAUSED;
        await this.campaignRepository.save(campaign);
      }
    }
  }
}
