import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { Campaign, Ad, AdMetrics } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, Ad, AdMetrics])],
  controllers: [AdsController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}
