import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaCategory } from '../entities/media.entity';

export class UploadMediaDto {
  @ApiProperty({
    enum: MediaCategory,
    description: 'Category of the media file',
    example: MediaCategory.POST,
  })
  @IsEnum(MediaCategory)
  category: MediaCategory;

  @ApiPropertyOptional({
    description: 'ID of the entity this media belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Type of the entity this media belongs to',
    example: 'post',
  })
  @IsOptional()
  @IsString()
  entityType?: string;
}

export class MediaResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'photo.jpg' })
  originalName: string;

  @ApiProperty({ example: 'posts/2024/01/uuid-photo.jpg' })
  key: string;

  @ApiProperty({
    example: 'https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo.jpg',
  })
  url: string;

  @ApiProperty({ example: 'image' })
  type: string;

  @ApiProperty({ example: 'post' })
  category: string;

  @ApiProperty({ example: 'ready' })
  status: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 2048000 })
  size: number;

  @ApiProperty({ example: 1920, required: false })
  width?: number;

  @ApiProperty({ example: 1080, required: false })
  height?: number;

  @ApiProperty({
    example: {
      thumbnail: 'https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo-thumbnail.jpg',
      small: 'https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo-small.jpg',
    },
    required: false,
  })
  variants?: Record<string, string>;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;
}
