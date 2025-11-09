import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEnum,
  IsOptional,
  IsUUID,
  IsUrl,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdFormat, AudienceGender } from '@viajero-conectado/types';

export class CreateAdDto {
  @ApiProperty({ description: 'ID de la campaña' })
  @IsNotEmpty()
  @IsUUID()
  campaignId: string;

  @ApiPropertyOptional({ description: 'ID de la experiencia a promocionar' })
  @IsOptional()
  @IsUUID()
  experienceId?: string;

  @ApiProperty({ description: 'Título del anuncio', example: 'Tour por Cartagena - 30% OFF' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Descripción del anuncio' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Formato del anuncio',
    enum: AdFormat,
    example: AdFormat.FEED,
  })
  @IsNotEmpty()
  @IsEnum(AdFormat)
  format: AdFormat;

  @ApiPropertyOptional({ description: 'URL de la imagen' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'URL del video' })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'URL de destino del CTA' })
  @IsOptional()
  @IsUrl()
  ctaUrl?: string;

  @ApiPropertyOptional({ description: 'Texto del botón CTA', example: 'Reservar ahora' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaText?: string;

  // Targeting
  @ApiPropertyOptional({ description: 'Países objetivo', type: [String], example: ['CO', 'MX'] })
  @IsOptional()
  @IsArray()
  targetCountries?: string[];

  @ApiPropertyOptional({ description: 'Ciudades objetivo', type: [String] })
  @IsOptional()
  @IsArray()
  targetCities?: string[];

  @ApiPropertyOptional({ description: 'Edad mínima', example: 18 })
  @IsOptional()
  @IsNumber()
  @Min(13)
  @Max(100)
  targetAgeMin?: number;

  @ApiPropertyOptional({ description: 'Edad máxima', example: 65 })
  @IsOptional()
  @IsNumber()
  @Min(13)
  @Max(100)
  targetAgeMax?: number;

  @ApiPropertyOptional({
    description: 'Género objetivo',
    enum: AudienceGender,
    default: AudienceGender.ALL,
  })
  @IsOptional()
  @IsEnum(AudienceGender)
  targetGender?: AudienceGender;

  @ApiPropertyOptional({
    description: 'Intereses objetivo',
    type: [String],
    example: ['adventure', 'beach', 'culture'],
  })
  @IsOptional()
  @IsArray()
  targetInterests?: string[];

  @ApiPropertyOptional({ description: 'Puja por clic (CPC)', example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  cpcBid?: number;

  @ApiPropertyOptional({ description: 'Puja por mil impresiones (CPM)', example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  cpmBid?: number;
}
