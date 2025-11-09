import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ExperienceCategory,
  DifficultyLevel,
  Currency,
  AudienceType,
} from '@viajero-conectado/types';

class LocationDto {
  @ApiProperty({ example: 'CO' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'Cartagena' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Centro Histórico' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 10.3910485 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: -75.4794257 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class CreateExperienceDto {
  @ApiProperty({ example: 'Tour por el Centro Histórico de Cartagena' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Descubre la historia colonial de Cartagena...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Tour guiado por las calles más emblemáticas', required: false })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ enum: ExperienceCategory, example: ExperienceCategory.TOUR })
  @IsEnum(ExperienceCategory)
  category: ExperienceCategory;

  @ApiProperty({ example: 'city-tour', required: false })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ example: 4, description: 'Duración en horas', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0.5)
  durationHours?: number;

  @ApiProperty({ enum: DifficultyLevel, required: false })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @ApiProperty({ example: 5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minAge?: number;

  @ApiProperty({ example: 15, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxGroupSize?: number;

  @ApiProperty({ example: ['es', 'en'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  priceFrom: number;

  @ApiProperty({ enum: Currency, default: Currency.COP })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiProperty({ example: ['couple', 'family'], required: false })
  @IsArray()
  @IsEnum(AudienceType, { each: true })
  @IsOptional()
  audienceTypes?: AudienceType[];
}
