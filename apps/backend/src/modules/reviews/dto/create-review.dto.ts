import {
  IsString,
  IsEnum,
  IsInt,
  IsUUID,
  IsOptional,
  IsArray,
  IsObject,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ReviewableType } from '@travelink/types';

export class CreateReviewDto {
  @IsEnum(ReviewableType)
  reviewableType: ReviewableType;

  @IsUUID()
  reviewableId: string;

  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(2000)
  comment: string;

  @IsObject()
  @IsOptional()
  detailedRatings?: {
    cleanliness?: number;
    communication?: number;
    accuracy?: number;
    value?: number;
    location?: number;
    service?: number;
    [key: string]: number;
  };

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];
}
