import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteImageDto {
  @ApiProperty({
    description: 'Cloudinary public_id of the image to delete',
    example: 'experiences/abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  publicId: string;
}
