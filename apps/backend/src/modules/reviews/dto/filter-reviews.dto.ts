import { IsEnum, IsUUID, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewableType, ReviewStatus, ReviewSortBy } from '@travelink/types';

export class FilterReviewsDto {
  @IsEnum(ReviewableType)
  @IsOptional()
  reviewableType?: ReviewableType;

  @IsUUID()
  @IsOptional()
  reviewableId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  minRating?: number;

  @IsInt()
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  maxRating?: number;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isVerifiedPurchase?: boolean;

  @IsEnum(ReviewSortBy)
  @IsOptional()
  sortBy?: ReviewSortBy;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
