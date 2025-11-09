import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpStatus,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';
import { UploadMediaDto, MediaResponseDto } from './dto/upload-media.dto';
import { MediaCategory } from './entities/media.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly storageService: StorageService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        category: {
          type: 'string',
          enum: Object.values(MediaCategory),
          description: 'Media category',
        },
        entityId: {
          type: 'string',
          format: 'uuid',
          description: 'Related entity ID (optional)',
        },
        entityType: {
          type: 'string',
          description: 'Related entity type (optional)',
        },
      },
      required: ['file', 'category'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File uploaded successfully',
    type: MediaResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadMediaDto,
    @CurrentUser() user: any,
  ): Promise<MediaResponseDto> {
    const media = await this.mediaService.uploadFile(
      file,
      user.sub,
      uploadDto.category,
      uploadDto.entityId,
      uploadDto.entityType,
    );

    return this.toResponseDto(media);
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
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
          description: 'Files to upload (max 10)',
        },
        category: {
          type: 'string',
          enum: Object.values(MediaCategory),
        },
        entityId: {
          type: 'string',
          format: 'uuid',
        },
        entityType: {
          type: 'string',
        },
      },
      required: ['files', 'category'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Files uploaded successfully',
    type: [MediaResponseDto],
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadMediaDto,
    @CurrentUser() user: any,
  ): Promise<MediaResponseDto[]> {
    const mediaList = await this.mediaService.uploadFiles(
      files,
      user.sub,
      uploadDto.category,
      uploadDto.entityId,
      uploadDto.entityType,
    );

    return mediaList.map((media) => this.toResponseDto(media));
  }

  @Get()
  @ApiOperation({ summary: 'Get all media for current user' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: MediaCategory,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit results (default: 50)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of media files',
    type: [MediaResponseDto],
  })
  async findAll(
    @CurrentUser() user: any,
    @Query('category') category?: MediaCategory,
    @Query('limit') limit?: number,
  ): Promise<MediaResponseDto[]> {
    const mediaList = await this.mediaService.findAll(
      user.sub,
      category,
      limit ? parseInt(limit.toString()) : 50,
    );

    return mediaList.map((media) => this.toResponseDto(media));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get storage statistics for current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Storage statistics',
    schema: {
      type: 'object',
      properties: {
        totalFiles: { type: 'number', example: 125 },
        totalSize: { type: 'number', example: 52428800 },
        totalSizeMB: { type: 'number', example: 50 },
        byCategory: {
          type: 'object',
          example: {
            avatar: { count: 1, size: 524288, sizeMB: 0.5 },
            post: { count: 50, size: 20971520, sizeMB: 20 },
          },
        },
      },
    },
  })
  async getStats(@CurrentUser() user: any) {
    const stats = await this.mediaService.getUserStorageStats(user.sub);

    return {
      totalFiles: stats.totalFiles,
      totalSize: stats.totalSize,
      totalSizeMB: Math.round((stats.totalSize / 1024 / 1024) * 100) / 100,
      byCategory: Object.entries(stats.byCategory).reduce(
        (acc, [category, data]) => {
          acc[category] = {
            count: data.count,
            size: data.size,
            sizeMB: Math.round((data.size / 1024 / 1024) * 100) / 100,
          };
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get media for a specific entity' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of media files for entity',
    type: [MediaResponseDto],
  })
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ): Promise<MediaResponseDto[]> {
    const mediaList = await this.mediaService.findByEntity(entityId, entityType);
    return mediaList.map((media) => this.toResponseDto(media));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media file details',
    type: MediaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Media not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<MediaResponseDto> {
    const media = await this.mediaService.findOne(id, user.sub);
    return this.toResponseDto(media);
  }

  @Get(':id/signed-url')
  @ApiOperation({ summary: 'Get signed URL for temporary access' })
  @ApiQuery({
    name: 'expiresIn',
    required: false,
    type: Number,
    description: 'Expiration time in seconds (default: 3600)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Signed URL generated',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://s3.amazonaws.com/bucket/file.jpg?X-Amz-Signature=...',
        },
        expiresIn: { type: 'number', example: 3600 },
      },
    },
  })
  async getSignedUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('expiresIn') expiresIn: number = 3600,
    @CurrentUser() user: any,
  ) {
    const media = await this.mediaService.findOne(id, user.sub);
    const signedUrl = await this.storageService.getSignedUrl(
      media.key,
      expiresIn,
    );

    return {
      url: signedUrl,
      expiresIn,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media (soft delete)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Media not found',
  })
  async deleteMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    await this.mediaService.deleteMedia(id, user.sub);
    return {
      message: 'Media deleted successfully',
      id,
    };
  }

  /**
   * Convert Media entity to response DTO
   */
  private toResponseDto(media: any): MediaResponseDto {
    return {
      id: media.id,
      originalName: media.originalName,
      key: media.key,
      url: media.url,
      type: media.type,
      category: media.category,
      status: media.status,
      mimeType: media.mimeType,
      size: media.size,
      width: media.width,
      height: media.height,
      variants: media.variants,
      createdAt: media.createdAt,
    };
  }
}
