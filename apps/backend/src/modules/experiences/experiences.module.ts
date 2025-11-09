import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperiencesService } from './experiences.service';
import { ExperiencesController } from './experiences.controller';
import {
  Experience,
  ExperienceVariant,
  ExperienceMedia,
  ExperienceItinerary,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experience, ExperienceVariant, ExperienceMedia, ExperienceItinerary]),
  ],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
