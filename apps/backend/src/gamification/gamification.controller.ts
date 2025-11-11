import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('points/balance')
  @ApiOperation({ summary: 'Get user points balance and level info' })
  @ApiResponse({
    status: 200,
    description: 'Points balance retrieved successfully',
    schema: {
      example: {
        currentPoints: 1250,
        totalEarned: 1500,
        totalSpent: 250,
        expiringSoon: 100,
        currentLevel: {
          level: 'WALKER',
          minPoints: 1000,
          maxPoints: 4999,
          name: 'Caminante',
          benefits: ['5% descuento en reservas', 'Badge especial'],
          progress: 6.25,
        },
        nextLevel: {
          level: 'ACTIVE_TRAVELER',
          minPoints: 5000,
          maxPoints: 14999,
          name: 'Viajero Activo',
        },
        pointsToNextLevel: 3750,
      },
    },
  })
  async getPointsBalance(@Req() req: any) {
    return this.gamificationService.getPointsBalance(req.user.userId);
  }

  @Get('points/history')
  @ApiOperation({ summary: 'Get user points transaction history' })
  @ApiResponse({
    status: 200,
    description: 'Points history retrieved successfully',
  })
  async getPointsHistory(@Req() req: any) {
    return this.gamificationService.getPointsHistory(req.user.userId);
  }

  @Get('levels')
  @ApiOperation({ summary: 'Get all levels information' })
  @ApiResponse({
    status: 200,
    description: 'Levels info retrieved successfully',
  })
  getLevelsInfo() {
    return this.gamificationService.getLevelsInfo();
  }

  @Get('points/rules')
  @ApiOperation({ summary: 'Get points earning/spending rules' })
  @ApiResponse({
    status: 200,
    description: 'Points rules retrieved successfully',
  })
  getPointsRules() {
    return this.gamificationService.getPointsRules();
  }
}
