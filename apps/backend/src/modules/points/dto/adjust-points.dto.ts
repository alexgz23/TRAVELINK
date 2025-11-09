import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustPointsDto {
  @ApiProperty({ description: 'Cantidad de puntos (positivo = agregar, negativo = quitar)', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Razón del ajuste', example: 'Compensación por error' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Descripción adicional' })
  @IsOptional()
  @IsString()
  description?: string;
}
