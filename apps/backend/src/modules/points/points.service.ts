import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThan } from 'typeorm';
import { PointTransaction, Reward, RewardRedemption } from './entities';
import { UserProfile } from '../users/entities';
import {
  RedeemRewardDto,
  CreateRewardDto,
  UpdateRewardDto,
  AdjustPointsDto,
  FilterTransactionsDto,
} from './dto';
import {
  PointsTransactionType,
  PointsEarnReason,
  PointsRedeemReason,
  RewardStatus,
  RedemptionStatus,
} from '@viajero-conectado/types';

// Configuración de puntos por acción
const POINTS_CONFIG = {
  [PointsEarnReason.BOOKING_COMPLETED]: 100,
  [PointsEarnReason.REVIEW_WITH_PHOTO]: 50,
  [PointsEarnReason.REVIEW_WITH_VIDEO]: 75,
  [PointsEarnReason.POST_PUBLISHED]: 20,
  [PointsEarnReason.REFERRAL]: 200,
  [PointsEarnReason.PROFILE_COMPLETED]: 50,
  [PointsEarnReason.EXPERIENCE_SHARED]: 10,
};

// Configuración de niveles
const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Explorador', minPoints: 0 },
  { level: 2, name: 'Caminante', minPoints: 500 },
  { level: 3, name: 'Viajero Activo', minPoints: 2000 },
  { level: 4, name: 'Viajero Experto', minPoints: 5000 },
  { level: 5, name: 'Embajador', minPoints: 10000 },
];

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly transactionRepository: Repository<PointTransaction>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(RewardRedemption)
    private readonly redemptionRepository: Repository<RewardRedemption>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}

  /**
   * Ganar puntos por una acción
   */
  async earnPoints(
    userId: string,
    reason: PointsEarnReason,
    relatedEntityId?: string,
    relatedEntityType?: string,
    customAmount?: number,
  ): Promise<PointTransaction> {
    const amount = customAmount || POINTS_CONFIG[reason] || 0;

    if (amount === 0) {
      throw new BadRequestException('No hay puntos configurados para esta acción');
    }

    // Crear transacción
    const transaction = this.transactionRepository.create({
      userId,
      amount,
      type: PointsTransactionType.EARNED,
      reason,
      relatedEntityId,
      relatedEntityType,
      expiresAt: this.calculateExpirationDate(),
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Actualizar balance del usuario
    await this.updateUserBalance(userId, amount, amount);

    // Verificar y actualizar nivel
    await this.checkAndUpdateLevel(userId);

    return savedTransaction;
  }

  /**
   * Canjear recompensa
   */
  async redeemReward(userId: string, redeemDto: RedeemRewardDto): Promise<RewardRedemption> {
    const reward = await this.rewardRepository.findOne({
      where: { id: redeemDto.rewardId },
    });

    if (!reward) {
      throw new NotFoundException('Recompensa no encontrada');
    }

    if (reward.status !== RewardStatus.ACTIVE) {
      throw new BadRequestException('Esta recompensa no está disponible');
    }

    // Verificar stock
    if (reward.stock !== null && reward.stock <= 0) {
      throw new BadRequestException('Esta recompensa está agotada');
    }

    // Obtener perfil del usuario
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // Verificar nivel mínimo
    if (reward.minLevel && profile.currentLevel < reward.minLevel) {
      throw new ForbiddenException(`Necesitas nivel ${reward.minLevel} o superior`);
    }

    // Verificar puntos suficientes
    if (profile.currentPoints < reward.pointsCost) {
      throw new BadRequestException('No tienes suficientes puntos');
    }

    // Verificar vigencia
    const now = new Date();
    if (reward.validFrom && reward.validFrom > now) {
      throw new BadRequestException('Esta recompensa aún no está disponible');
    }
    if (reward.validUntil && reward.validUntil < now) {
      throw new BadRequestException('Esta recompensa ya no está disponible');
    }

    // Crear transacción de gasto
    const transaction = this.transactionRepository.create({
      userId,
      amount: -reward.pointsCost,
      type: PointsTransactionType.REDEEMED,
      reason: PointsRedeemReason.DISCOUNT_VOUCHER, // Puede variar según tipo de reward
      relatedEntityId: reward.id,
      relatedEntityType: 'Reward',
    });

    await this.transactionRepository.save(transaction);

    // Actualizar balance
    await this.updateUserBalance(userId, -reward.pointsCost, 0);

    // Crear redención
    const redemption = this.redemptionRepository.create({
      userId,
      rewardId: reward.id,
      pointsSpent: reward.pointsCost,
      deliveryNotes: redeemDto.deliveryNotes,
      status: RedemptionStatus.PENDING,
    });

    const savedRedemption = await this.redemptionRepository.save(redemption);

    // Decrementar stock si aplica
    if (reward.stock !== null) {
      reward.stock -= 1;
      if (reward.stock === 0) {
        reward.status = RewardStatus.OUT_OF_STOCK;
      }
      await this.rewardRepository.save(reward);
    }

    return savedRedemption;
  }

  /**
   * Obtener balance de puntos del usuario
   */
  async getBalance(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const currentLevelInfo = this.getLevelInfo(profile.totalPointsEarned);
    const nextLevelInfo = LEVEL_THRESHOLDS.find(l => l.level === currentLevelInfo.level + 1);

    return {
      currentPoints: profile.currentPoints,
      totalPointsEarned: profile.totalPointsEarned,
      currentLevel: currentLevelInfo.level,
      currentLevelName: currentLevelInfo.name,
      nextLevel: nextLevelInfo?.level,
      nextLevelName: nextLevelInfo?.name,
      pointsToNextLevel: nextLevelInfo ? nextLevelInfo.minPoints - profile.totalPointsEarned : 0,
      badges: profile.badges || [],
    };
  }

  /**
   * Obtener historial de transacciones
   */
  async getTransactions(userId: string, filters: FilterTransactionsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<PointTransaction> = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    const [items, total] = await this.transactionRepository.findAndCount({
      where,
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
   * Obtener recompensas disponibles
   */
  async getAvailableRewards(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const rewards = await this.rewardRepository.find({
      where: {
        status: RewardStatus.ACTIVE,
      },
      order: { pointsCost: 'ASC' },
    });

    const now = new Date();

    // Filtrar por vigencia y nivel
    return rewards
      .filter(reward => {
        // Verificar vigencia
        if (reward.validFrom && reward.validFrom > now) return false;
        if (reward.validUntil && reward.validUntil < now) return false;

        // Verificar nivel
        if (reward.minLevel && profile.currentLevel < reward.minLevel) return false;

        return true;
      })
      .map(reward => ({
        ...reward,
        canAfford: profile.currentPoints >= reward.pointsCost,
        meetsLevelRequirement: !reward.minLevel || profile.currentLevel >= reward.minLevel,
      }));
  }

  /**
   * Obtener mis canjes
   */
  async getMyRedemptions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.redemptionRepository.findAndCount({
      where: { userId },
      relations: ['reward'],
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

  // ========== Métodos Admin ==========

  /**
   * Ajustar puntos manualmente (admin)
   */
  async adjustPoints(userId: string, adjustDto: AdjustPointsDto): Promise<PointTransaction> {
    const transaction = this.transactionRepository.create({
      userId,
      amount: adjustDto.amount,
      type: PointsTransactionType.ADJUSTED,
      reason: adjustDto.reason,
      description: adjustDto.description,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Actualizar balance
    const earnedAmount = adjustDto.amount > 0 ? adjustDto.amount : 0;
    await this.updateUserBalance(userId, adjustDto.amount, earnedAmount);

    // Verificar nivel si es ajuste positivo
    if (adjustDto.amount > 0) {
      await this.checkAndUpdateLevel(userId);
    }

    return savedTransaction;
  }

  /**
   * Crear recompensa (admin)
   */
  async createReward(createDto: CreateRewardDto): Promise<Reward> {
    const reward = this.rewardRepository.create(createDto);
    return this.rewardRepository.save(reward);
  }

  /**
   * Actualizar recompensa (admin)
   */
  async updateReward(id: string, updateDto: UpdateRewardDto): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({ where: { id } });

    if (!reward) {
      throw new NotFoundException('Recompensa no encontrada');
    }

    Object.assign(reward, updateDto);
    return this.rewardRepository.save(reward);
  }

  /**
   * Eliminar recompensa (admin)
   */
  async deleteReward(id: string): Promise<void> {
    const reward = await this.rewardRepository.findOne({ where: { id } });

    if (!reward) {
      throw new NotFoundException('Recompensa no encontrada');
    }

    await this.rewardRepository.remove(reward);
  }

  /**
   * Listar todas las recompensas (admin)
   */
  async getAllRewards() {
    return this.rewardRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Procesar canje (admin)
   */
  async processRedemption(redemptionId: string, status: RedemptionStatus): Promise<RewardRedemption> {
    const redemption = await this.redemptionRepository.findOne({
      where: { id: redemptionId },
      relations: ['reward', 'user'],
    });

    if (!redemption) {
      throw new NotFoundException('Canje no encontrado');
    }

    redemption.status = status;

    if (status === RedemptionStatus.PROCESSING) {
      redemption.processedAt = new Date();
    } else if (status === RedemptionStatus.COMPLETED) {
      redemption.completedAt = new Date();
    } else if (status === RedemptionStatus.CANCELLED) {
      redemption.cancelledAt = new Date();

      // Reembolsar puntos
      await this.updateUserBalance(redemption.userId, redemption.pointsSpent, 0);

      // Restaurar stock
      if (redemption.reward.stock !== null) {
        redemption.reward.stock += 1;
        if (redemption.reward.status === RewardStatus.OUT_OF_STOCK) {
          redemption.reward.status = RewardStatus.ACTIVE;
        }
        await this.rewardRepository.save(redemption.reward);
      }
    }

    return this.redemptionRepository.save(redemption);
  }

  /**
   * Listar todos los canjes (admin)
   */
  async getAllRedemptions(filters: FilterTransactionsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<RewardRedemption> = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const [items, total] = await this.redemptionRepository.findAndCount({
      where,
      relations: ['reward', 'user', 'user.profile'],
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
   * Actualizar balance de puntos del usuario
   */
  private async updateUserBalance(userId: string, pointsChange: number, earnedChange: number) {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    profile.currentPoints += pointsChange;
    profile.totalPointsEarned += earnedChange;

    // No permitir puntos negativos
    if (profile.currentPoints < 0) {
      profile.currentPoints = 0;
    }

    await this.profileRepository.save(profile);
  }

  /**
   * Verificar y actualizar nivel del usuario
   */
  private async checkAndUpdateLevel(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      return;
    }

    const newLevel = this.getLevelInfo(profile.totalPointsEarned);

    if (newLevel.level !== profile.currentLevel) {
      profile.currentLevel = newLevel.level;
      await this.profileRepository.save(profile);
    }
  }

  /**
   * Obtener información de nivel basado en puntos totales
   */
  private getLevelInfo(totalPoints: number) {
    let currentLevel = LEVEL_THRESHOLDS[0];

    for (const levelInfo of LEVEL_THRESHOLDS) {
      if (totalPoints >= levelInfo.minPoints) {
        currentLevel = levelInfo;
      } else {
        break;
      }
    }

    return currentLevel;
  }

  /**
   * Calcular fecha de expiración de puntos (ejemplo: 12 meses)
   */
  private calculateExpirationDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 12);
    return date;
  }

  /**
   * Procesar expiración de puntos (cron job)
   */
  async processExpiredPoints() {
    const now = new Date();

    const expiredTransactions = await this.transactionRepository.find({
      where: {
        type: PointsTransactionType.EARNED,
        isExpired: false,
        expiresAt: MoreThan(now),
      },
    });

    for (const transaction of expiredTransactions) {
      // Marcar como expirado
      transaction.isExpired = true;
      await this.transactionRepository.save(transaction);

      // Crear transacción de expiración
      await this.transactionRepository.save(
        this.transactionRepository.create({
          userId: transaction.userId,
          amount: -transaction.amount,
          type: PointsTransactionType.EXPIRED,
          description: `Puntos expirados de transacción ${transaction.id}`,
          relatedEntityId: transaction.id,
          relatedEntityType: 'PointTransaction',
        }),
      );

      // Actualizar balance
      await this.updateUserBalance(transaction.userId, -transaction.amount, 0);
    }

    return expiredTransactions.length;
  }
}
