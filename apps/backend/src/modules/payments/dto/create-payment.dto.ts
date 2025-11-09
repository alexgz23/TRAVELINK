import { IsNotEmpty, IsUUID, IsNumber, Min, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, PaymentMethod, Currency } from '@viajero-conectado/types';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID de la reserva' })
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @ApiProperty({ description: 'Monto del pago', example: 450000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Moneda',
    enum: Currency,
    default: Currency.COP,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({
    description: 'Proveedor de pago',
    enum: PaymentProvider,
    example: PaymentProvider.STRIPE,
  })
  @IsNotEmpty()
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({
    description: 'Método de pago',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Metadata adicional' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
