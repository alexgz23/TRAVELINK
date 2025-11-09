import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchSortBy {
  RELEVANCE = '_text_match',
  PRICE_ASC = 'price:asc',
  PRICE_DESC = 'price:desc',
  RATING_DESC = 'rating:desc',
  CREATED_DESC = 'createdAt:desc',
  CREATED_ASC = 'createdAt:asc',
}

export class SearchExperiencesDto {
  @ApiProperty({
    description: 'Search query',
    example: 'tour ciudad perdida',
  })
  @IsString()
  q: string;

  @ApiPropertyOptional({
    description: 'Category filter',
    example: 'adventure',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'City filter',
    example: 'Cartagena',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Country filter',
    example: 'Colombia',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Minimum price',
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price',
    example: 500000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Minimum rating',
    example: 4.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Tags filter (comma-separated)',
    example: 'naturaleza,aventura',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: SearchSortBy,
    default: SearchSortBy.RELEVANCE,
  })
  @IsOptional()
  @IsEnum(SearchSortBy)
  sortBy?: SearchSortBy = SearchSortBy.RELEVANCE;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SearchUsersDto {
  @ApiProperty({
    description: 'Search query',
    example: 'juan',
  })
  @IsString()
  q: string;

  @ApiPropertyOptional({
    description: 'Role filter',
    example: 'GUIDE',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Verified users only',
    example: true,
  })
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AutocompleteDto {
  @ApiProperty({
    description: 'Autocomplete query',
    example: 'cart',
  })
  @IsString()
  q: string;

  @ApiPropertyOptional({
    description: 'Limit results',
    default: 5,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  limit?: number = 5;
}

export class SearchResponseDto {
  @ApiProperty({ description: 'Total results found' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Results per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Search results' })
  results: any[];

  @ApiProperty({ description: 'Facet counts (filters)' })
  facets?: Record<string, any>;

  @ApiProperty({ description: 'Search time in ms' })
  searchTimeMs: number;
}
