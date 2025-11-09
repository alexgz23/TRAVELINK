import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review, ReviewResponse, ReviewReport, ReviewHelpful } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewResponse, ReviewReport, ReviewHelpful]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
