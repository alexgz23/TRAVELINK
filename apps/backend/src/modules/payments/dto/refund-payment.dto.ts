import { IsOptional, IsNumber, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiPropertyOptional({ description: 'Monto a reembolsar (parcial o total)', example: 450000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Razón del reembolso', example: 'Cancelación solicitada por el cliente' })
  @IsOptional()
  @IsString()
  reason?: string;
}
