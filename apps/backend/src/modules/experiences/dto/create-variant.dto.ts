import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({ example: 'Tour Privado' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Experiencia exclusiva con guía privado' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 6, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxPeople?: number;

  @ApiProperty({ example: ['Guía privado', 'Transporte', 'Entradas'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includes?: string[];

  @ApiProperty({ example: ['Comidas', 'Propinas'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excludes?: string[];

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
