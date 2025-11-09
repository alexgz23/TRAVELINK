import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDate,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@viajero-conectado/types';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID de la experiencia a reservar' })
  @IsNotEmpty()
  @IsUUID()
  experienceId: string;

  @ApiPropertyOptional({ description: 'ID de la variante seleccionada' })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiProperty({ description: 'Fecha de la reserva', example: '2025-12-15' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  bookingDate: Date;

  @ApiPropertyOptional({ description: 'Hora de la reserva', example: '09:00' })
  @IsOptional()
  @IsString()
  bookingTime?: string;

  @ApiProperty({ description: 'Número de adultos', example: 2, default: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  numAdults: number;

  @ApiPropertyOptional({ description: 'Número de niños', example: 1, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  numChildren?: number;

  @ApiProperty({ description: 'Monto total de la reserva', example: 300000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({
    description: 'Moneda',
    enum: Currency,
    default: Currency.COP,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}
