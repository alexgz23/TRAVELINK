import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  IsObject,
  IsDate,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardType, RewardStatus } from '@viajero-conectado/types';

export class CreateRewardDto {
  @ApiProperty({ description: 'Nombre de la recompensa', example: 'Descuento 10% en próximo viaje' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Descripción detallada' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Tipo de recompensa',
    enum: RewardType,
    example: RewardType.DISCOUNT,
  })
  @IsNotEmpty()
  @IsEnum(RewardType)
  type: RewardType;

  @ApiProperty({ description: 'Costo en puntos', example: 500 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  pointsCost: number;

  @ApiPropertyOptional({ description: 'URL de imagen de la recompensa' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Estado',
    enum: RewardStatus,
    default: RewardStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(RewardStatus)
  status?: RewardStatus;

  @ApiPropertyOptional({ description: 'Stock disponible (null = ilimitado)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Nivel mínimo requerido (1-5)', example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minLevel?: number;

  @ApiPropertyOptional({ description: 'Metadata adicional (códigos, condiciones, etc.)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Fecha de inicio de validez' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validFrom?: Date;

  @ApiPropertyOptional({ description: 'Fecha de fin de validez' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validUntil?: Date;
}
