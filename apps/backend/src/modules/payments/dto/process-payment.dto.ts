import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'ID del pago del proveedor (Stripe, Mercado Pago, etc.)' })
  @IsNotEmpty()
  @IsString()
  providerPaymentId: string;

  @ApiPropertyOptional({ description: 'ID del cliente en el proveedor' })
  @IsOptional()
  @IsString()
  providerCustomerId?: string;

  @ApiPropertyOptional({ description: 'Metadata adicional del proveedor' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
