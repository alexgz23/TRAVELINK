import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { PointTransaction, Reward, RewardRedemption } from './entities';
import { UserProfile } from '../users/entities';

@Module({
  imports: [TypeOrmModule.forFeature([PointTransaction, Reward, RewardRedemption, UserProfile])],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
