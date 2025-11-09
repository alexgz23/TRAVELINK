import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsUrl, Min } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({ enum: ['image', 'video'], example: 'image' })
  @IsEnum(['image', 'video'])
  type: 'image' | 'video';

  @ApiProperty({ example: 'https://cdn.example.com/image.jpg' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'https://cdn.example.com/thumb.jpg', required: false })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: 'Vista del mar Caribe', required: false })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiProperty({ example: 1, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  displayOrder?: number;
}
