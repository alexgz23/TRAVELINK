import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { UploadImageDto, DeleteImageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload single image to Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
        folder: {
          type: 'string',
          enum: ['experiences', 'users', 'reviews', 'profile', 'documents'],
          description: 'Folder to organize image',
        },
        width: {
          type: 'number',
          description: 'Width for resize',
        },
        height: {
          type: 'number',
          description: 'Height for resize',
        },
        quality: {
          type: 'number',
          description: 'Quality percentage (1-100)',
          default: 80,
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      example: {
        public_id: 'travelink/experiences/abc123',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/...',
        url: 'http://res.cloudinary.com/demo/image/upload/...',
        width: 1920,
        height: 1080,
        format: 'jpg',
        resource_type: 'image',
        bytes: 245678,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid file' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.uploadsService.uploadImage(file, uploadImageDto);
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple images (max 10)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Image files to upload (max 10)',
        },
        folder: {
          type: 'string',
          enum: ['experiences', 'users', 'reviews', 'profile', 'documents'],
        },
        width: { type: 'number' },
        height: { type: 'number' },
        quality: { type: 'number', default: 80 },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          public_id: 'travelink/experiences/abc123',
          secure_url: 'https://res.cloudinary.com/demo/image/upload/...',
          width: 1920,
          height: 1080,
          format: 'jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - No files or too many files',
  })
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadImageDto: UploadImageDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    return this.uploadsService.uploadMultipleImages(files, uploadImageDto);
  }

  @Delete('image')
  @ApiOperation({ summary: 'Delete image from Cloudinary' })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      example: {
        result: 'ok',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid public_id' })
  async deleteImage(@Body() deleteImageDto: DeleteImageDto) {
    return this.uploadsService.deleteImage(deleteImageDto.publicId);
  }

  @Post('delete-multiple')
  @ApiOperation({ summary: 'Delete multiple images from Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        publicIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of Cloudinary public_ids to delete',
          example: [
            'travelink/experiences/abc123',
            'travelink/experiences/def456',
          ],
        },
      },
      required: ['publicIds'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Deletion results',
    schema: {
      example: {
        deleted: ['travelink/experiences/abc123'],
        failed: ['travelink/experiences/def456'],
      },
    },
  })
  async deleteMultipleImages(@Body('publicIds') publicIds: string[]) {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('No public IDs provided');
    }

    return this.uploadsService.deleteMultipleImages(publicIds);
  }

  @Get('optimize')
  @ApiOperation({ summary: 'Generate optimized URL for an image' })
  @ApiResponse({
    status: 200,
    description: 'Optimized URL generated',
    schema: {
      example: {
        url: 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/...',
      },
    },
  })
  generateOptimizedUrl(
    @Query('publicId') publicId: string,
    @Query('width') width?: number,
    @Query('height') height?: number,
    @Query('quality') quality?: number,
    @Query('format') format?: string,
  ) {
    if (!publicId) {
      throw new BadRequestException('publicId is required');
    }

    const url = this.uploadsService.generateOptimizedUrl(publicId, {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      quality: quality ? Number(quality) : undefined,
      format,
    });

    return { url };
  }
}
