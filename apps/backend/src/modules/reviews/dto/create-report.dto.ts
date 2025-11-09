import { IsString, IsUUID, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ReportReason } from '@travelink/types';

export class CreateReportDto {
  @IsUUID()
  reviewId: string;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  details?: string;
}
