import { IsNotEmpty, IsString, MaxLength, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Contenido del comentario', example: '¡Qué bonito!' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  content: string;

  @ApiPropertyOptional({ description: 'ID del comentario padre (para respuestas)' })
  @IsOptional()
  @IsMongoId()
  parentCommentId?: string;
}
