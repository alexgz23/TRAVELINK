import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserLevel, PointsTransactionType } from '@prisma/client';

interface LevelRequirement {
  level: UserLevel;
  minPoints: number;
  maxPoints: number | null;
  name: string;
  benefits: string[];
}

interface PointsRule {
  type: PointsTransactionType;
  points: number;
  description: string;
}

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  // Level requirements configuration
  private readonly LEVEL_REQUIREMENTS: LevelRequirement[] = [
    {
      level: 'EXPLORER',
      minPoints: 0,
      maxPoints: 999,
      name: 'Explorador',
      benefits: ['Acceso básico a la plataforma'],
    },
    {
      level: 'WALKER',
      minPoints: 1000,
      maxPoints: 4999,
      name: 'Caminante',
      benefits: ['5% descuento en reservas', 'Badge especial'],
    },
    {
      level: 'ACTIVE_TRAVELER',
      minPoints: 5000,
      maxPoints: 14999,
      name: 'Viajero Activo',
      benefits: ['10% descuento', 'Acceso prioritario', 'Eventos exclusivos'],
    },
    {
      level: 'EXPERT_TRAVELER',
      minPoints: 15000,
      maxPoints: 49999,
      name: 'Viajero Experto',
      benefits: [
        '15% descuento',
        'Concierge personal',
        'Early access',
        'Regalos mensuales',
      ],
    },
    {
      level: 'AMBASSADOR',
      minPoints: 50000,
      maxPoints: null,
      name: 'Embajador',
      benefits: [
        '20% descuento',
        'Viajes gratis',
        'Influencer program',
        'VIP treatment',
      ],
    },
  ];

  // Points earning/spending rules
  private readonly POINTS_RULES: Record<string, PointsRule> = {
    BOOKING_COMPLETED: {
      type: 'EARNED_BOOKING',
      points: 100,
      description: 'Por completar una reserva',
    },
    REVIEW_CREATED: {
      type: 'EARNED_REVIEW',
      points: 50,
      description: 'Por escribir una reseña',
    },
    POST_CREATED: {
      type: 'EARNED_POST',
      points: 25,
      description: 'Por publicar en la red social',
    },
    REFERRAL: {
      type: 'EARNED_REFERRAL',
      points: 500,
      description: 'Por referir un amigo',
    },
  };

  /**
   * Add points to user and update level
   */
  async addPoints(
    userId: string,
    type: PointsTransactionType,
    amount: number,
    reason: string,
    referenceId?: string,
    referenceType?: string,
  ) {
    // Create transaction
    const transaction = await this.prisma.pointsTransaction.create({
      data: {
        userId,
        amount,
        type,
        reason,
        referenceId,
        referenceType,
        // Points expire after 1 year
        expiresAt:
          type.toString().startsWith('EARNED')
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : null,
      },
    });

    // Update user points
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: amount,
        },
      },
      select: {
        id: true,
        points: true,
        level: true,
      },
    });

    // Check if level should be updated
    const newLevel = this.calculateLevel(user.points);
    if (newLevel !== user.level) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });

      // Record level up event
      await this.prisma.pointsTransaction.create({
        data: {
          userId,
          amount: 0,
          type: 'ADMIN_ADJUSTMENT',
          reason: `Level up to ${newLevel}`,
        },
      });
    }

    return {
      transaction,
      newPoints: user.points,
      newLevel,
      leveledUp: newLevel !== user.level,
    };
  }

  /**
   * Spend points (e.g., booking discount, rewards)
   */
  async spendPoints(
    userId: string,
    amount: number,
    reason: string,
    referenceId?: string,
    referenceType?: string,
  ) {
    // Check if user has enough points
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user || user.points < amount) {
      throw new Error('Insufficient points');
    }

    // Create negative transaction
    const transaction = await this.prisma.pointsTransaction.create({
      data: {
        userId,
        amount: -amount,
        type: 'SPENT_BOOKING',
        reason,
        referenceId,
        referenceType,
      },
    });

    // Update user points
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          decrement: amount,
        },
      },
    });

    return transaction;
  }

  /**
   * Get user points history
   */
  async getPointsHistory(userId: string, limit = 50) {
    return this.prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get points balance and breakdown
   */
  async getPointsBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, level: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentLevelInfo = this.LEVEL_REQUIREMENTS.find(
      (l) => l.level === user.level,
    );
    const nextLevelInfo = this.getNextLevel(user.level);

    // Get points breakdown
    const earned = await this.prisma.pointsTransaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
      },
      _sum: { amount: true },
    });

    const spent = await this.prisma.pointsTransaction.aggregate({
      where: {
        userId,
        amount: { lt: 0 },
      },
      _sum: { amount: true },
    });

    const expiringSoon = await this.prisma.pointsTransaction.findMany({
      where: {
        userId,
        expiresAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
        isExpired: false,
      },
      select: {
        amount: true,
        expiresAt: true,
      },
    });

    return {
      currentPoints: user.points,
      totalEarned: earned._sum.amount || 0,
      totalSpent: Math.abs(spent._sum.amount || 0),
      expiringSoon: expiringSoon.reduce((sum, t) => sum + t.amount, 0),
      currentLevel: {
        ...currentLevelInfo,
        progress:
          nextLevelInfo
            ? ((user.points - (currentLevelInfo?.minPoints || 0)) /
                ((nextLevelInfo.minPoints || 0) - (currentLevelInfo?.minPoints || 0))) *
              100
            : 100,
      },
      nextLevel: nextLevelInfo,
      pointsToNextLevel: nextLevelInfo
        ? nextLevelInfo.minPoints - user.points
        : 0,
    };
  }

  /**
   * Calculate level based on points
   */
  private calculateLevel(points: number): UserLevel {
    for (let i = this.LEVEL_REQUIREMENTS.length - 1; i >= 0; i--) {
      const level = this.LEVEL_REQUIREMENTS[i];
      if (points >= level.minPoints) {
        return level.level;
      }
    }
    return 'EXPLORER';
  }

  /**
   * Get next level info
   */
  private getNextLevel(currentLevel: UserLevel): LevelRequirement | null {
    const currentIndex = this.LEVEL_REQUIREMENTS.findIndex(
      (l) => l.level === currentLevel,
    );
    if (currentIndex === -1 || currentIndex === this.LEVEL_REQUIREMENTS.length - 1) {
      return null;
    }
    return this.LEVEL_REQUIREMENTS[currentIndex + 1];
  }

  /**
   * Get all levels info
   */
  getLevelsInfo() {
    return this.LEVEL_REQUIREMENTS;
  }

  /**
   * Get points earning rules
   */
  getPointsRules() {
    return this.POINTS_RULES;
  }

  /**
   * Expire old points (cron job should call this)
   */
  async expirePoints() {
    const expiredTransactions = await this.prisma.pointsTransaction.findMany({
      where: {
        expiresAt: { lte: new Date() },
        isExpired: false,
      },
    });

    for (const transaction of expiredTransactions) {
      // Mark as expired
      await this.prisma.pointsTransaction.update({
        where: { id: transaction.id },
        data: { isExpired: true },
      });

      // Deduct points from user
      await this.prisma.user.update({
        where: { id: transaction.userId },
        data: {
          points: {
            decrement: transaction.amount,
          },
        },
      });

      // Create expiration transaction
      await this.prisma.pointsTransaction.create({
        data: {
          userId: transaction.userId,
          amount: -transaction.amount,
          type: 'EXPIRED',
          reason: `Points expired from transaction ${transaction.id}`,
          referenceId: transaction.id,
        },
      });
    }

    return { expiredCount: expiredTransactions.length };
  }
}
