import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Contenido del post', example: '¡Increíble experiencia en Cartagena! 🌴' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: 'URLs de fotos/videos', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ description: 'Tags/etiquetas', type: [String], example: ['cartagena', 'tour', 'playa'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Nombre de la ubicación', example: 'Cartagena, Colombia' })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional({ description: 'Latitud de la ubicación', example: 10.3910485 })
  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @ApiPropertyOptional({ description: 'Longitud de la ubicación', example: -75.4794257 })
  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @ApiPropertyOptional({ description: 'ID de experiencia relacionada' })
  @IsOptional()
  @IsUUID()
  experienceId?: string;

  @ApiPropertyOptional({ description: 'ID de reserva relacionada' })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional({ description: 'Público o privado', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
