import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  @Post('image')
  uploadImage() {
    return { message: 'Upload image - To be implemented' };
  }
}
