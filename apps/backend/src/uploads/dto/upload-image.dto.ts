import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ImageFolder {
  EXPERIENCES = 'experiences',
  USERS = 'users',
  REVIEWS = 'reviews',
  PROFILE = 'profile',
  DOCUMENTS = 'documents',
}

export class UploadImageDto {
  @ApiPropertyOptional({
    enum: ImageFolder,
    description: 'Folder to organize uploaded images',
    default: ImageFolder.EXPERIENCES,
  })
  @IsOptional()
  @IsEnum(ImageFolder)
  folder?: ImageFolder = ImageFolder.EXPERIENCES;

  @ApiPropertyOptional({
    description: 'Width for image resize (maintains aspect ratio)',
    example: 1920,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(4000)
  width?: number;

  @ApiPropertyOptional({
    description: 'Height for image resize (maintains aspect ratio)',
    example: 1080,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(4000)
  height?: number;

  @ApiPropertyOptional({
    description: 'Quality percentage for compression (1-100)',
    example: 80,
    default: 80,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number = 80;
}
