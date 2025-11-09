import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ReviewStatus } from '@travelink/types';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;
}
