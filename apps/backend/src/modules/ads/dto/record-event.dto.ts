import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordImpressionDto {
  @ApiProperty({ description: 'ID del anuncio' })
  @IsNotEmpty()
  @IsUUID()
  adId: string;

  @ApiPropertyOptional({ description: 'ID del usuario (si está autenticado)' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class RecordClickDto {
  @ApiProperty({ description: 'ID del anuncio' })
  @IsNotEmpty()
  @IsUUID()
  adId: string;

  @ApiPropertyOptional({ description: 'ID del usuario (si está autenticado)' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class RecordConversionDto {
  @ApiProperty({ description: 'ID del anuncio' })
  @IsNotEmpty()
  @IsUUID()
  adId: string;

  @ApiProperty({ description: 'ID de la reserva generada' })
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @ApiProperty({ description: 'ID del usuario' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
