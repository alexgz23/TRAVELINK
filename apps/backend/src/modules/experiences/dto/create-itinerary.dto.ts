import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsArray } from 'class-validator';

export class CreateItineraryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  dayNumber: number;

  @ApiProperty({ example: 'Centro Histórico de Cartagena' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Recorrido por las calles coloniales...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Plaza de Bolívar' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: ['breakfast', 'lunch'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  meals?: string[];
}
