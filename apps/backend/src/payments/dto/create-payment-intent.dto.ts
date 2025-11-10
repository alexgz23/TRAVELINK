import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Booking ID to create payment for',
    example: 'clxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    description: 'Payment method',
    enum: ['card', 'cash', 'transfer'],
    default: 'card',
  })
  @IsEnum(['card', 'cash', 'transfer'])
  @IsOptional()
  method?: string = 'card';

  @ApiProperty({
    description: 'Currency code',
    example: 'COP',
    default: 'COP',
  })
  @IsString()
  @IsOptional()
  currency?: string = 'COP';
}
