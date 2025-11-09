import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TravelerType, DocumentType } from '@viajero-conectado/types';

export class AddTravelerDto {
  @ApiProperty({
    description: 'Tipo de viajero',
    enum: TravelerType,
    example: TravelerType.ADULT,
  })
  @IsNotEmpty()
  @IsEnum(TravelerType)
  type: TravelerType;

  @ApiPropertyOptional({ description: 'Nombre del viajero', example: 'Juan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellido del viajero', example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Tipo de documento',
    enum: DocumentType,
    example: DocumentType.CC,
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({ description: 'Número de documento', example: '1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento', example: '1990-05-15' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Nacionalidad (código de 2 letras)', example: 'CO' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  nationality?: string;
}
