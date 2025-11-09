import { IsOptional, IsEnum, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PointsTransactionType } from '@viajero-conectado/types';

export class FilterTransactionsDto {
  @ApiPropertyOptional({
    description: 'Tipo de transacción',
    enum: PointsTransactionType,
  })
  @IsOptional()
  @IsEnum(PointsTransactionType)
  type?: PointsTransactionType;

  @ApiPropertyOptional({ description: 'Filtrar por usuario (solo admin)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

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
