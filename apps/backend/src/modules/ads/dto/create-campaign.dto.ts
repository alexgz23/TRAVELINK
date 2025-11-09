import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingType } from '@viajero-conectado/types';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Nombre de la campaña', example: 'Promoción Verano 2025' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción de la campaña' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tipo de facturación',
    enum: BillingType,
    example: BillingType.CPC,
  })
  @IsNotEmpty()
  @IsEnum(BillingType)
  billingType: BillingType;

  @ApiProperty({ description: 'Presupuesto total de la campaña', example: 500000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  totalBudget: number;

  @ApiPropertyOptional({ description: 'Presupuesto diario máximo', example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  dailyBudget?: number;

  @ApiProperty({ description: 'Fecha de inicio', example: '2025-12-01' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Fecha de fin', example: '2025-12-31' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
