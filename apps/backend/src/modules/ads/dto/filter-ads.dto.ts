import { IsOptional, IsEnum, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus, AdStatus } from '@viajero-conectado/types';

export class FilterCampaignsDto {
  @ApiPropertyOptional({
    description: 'Estado de la campaña',
    enum: CampaignStatus,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'Número de página', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items por página', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class FilterAdsDto {
  @ApiPropertyOptional({
    description: 'Estado del anuncio',
    enum: AdStatus,
  })
  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;

  @ApiPropertyOptional({ description: 'ID de campaña' })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Número de página', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items por página', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
