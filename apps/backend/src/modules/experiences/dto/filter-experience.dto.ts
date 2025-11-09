import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceCategory, DifficultyLevel, Currency } from '@viajero-conectado/types';

export class FilterExperienceDto {
  @ApiPropertyOptional({ enum: ExperienceCategory })
  @IsEnum(ExperienceCategory)
  @IsOptional()
  category?: ExperienceCategory;

  @ApiPropertyOptional({ example: 'CO' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'Cartagena' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: Currency, default: Currency.COP })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiPropertyOptional({ example: 'es' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ example: 'tour histórico' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'createdAt', default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'DESC', default: 'DESC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ example: 'true', description: 'Solo experiencias destacadas' })
  @IsOptional()
  featured?: boolean;
}
