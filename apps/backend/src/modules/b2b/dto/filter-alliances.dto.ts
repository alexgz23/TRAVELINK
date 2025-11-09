import { IsEnum, IsUUID, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AllianceType, AllianceStatus } from '@travelink/types';

export class FilterAlliancesDto {
  @IsEnum(AllianceType)
  @IsOptional()
  type?: AllianceType;

  @IsEnum(AllianceStatus)
  @IsOptional()
  status?: AllianceStatus;

  @IsUUID()
  @IsOptional()
  providerId?: string;

  @IsUUID()
  @IsOptional()
  agencyId?: string;

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
