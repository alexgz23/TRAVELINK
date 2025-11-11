import { IsOptional, IsString, IsArray, IsEnum, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum BudgetRange {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  LUXURY = 'luxury',
}

export class UpdateExtendedProfileDto {
  @ApiPropertyOptional({
    description: 'User bio/about me',
    example: 'Passionate traveler exploring the world one destination at a time',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'User country',
    example: 'Colombia',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'User city',
    example: 'Medellín',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Languages spoken',
    example: ['Spanish', 'English', 'Portuguese'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({
    description: 'Travel style preferences',
    example: ['Adventure', 'Cultural', 'Nature'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  travelStyle?: string[];

  @ApiPropertyOptional({
    description: 'Budget range for travel',
    enum: BudgetRange,
    example: 'medium',
  })
  @IsOptional()
  @IsEnum(BudgetRange)
  budgetRange?: string;

  @ApiPropertyOptional({
    description: 'Dream destinations',
    example: ['Japan', 'New Zealand', 'Iceland'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dreamDestinations?: string[];
}
