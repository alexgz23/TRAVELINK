import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import {
  Media,
  MediaType,
  MediaCategory,
  MediaStatus,
} from './entities/media.entity';
import { StorageService } from './storage.service';
import { StorageConfig } from '../config/storage.config';
import { QueueName, JobName } from '../queues/constants';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly storageService: StorageService,
    @InjectQueue(QueueName.IMAGE_PROCESSING)
    private readonly imageQueue: Queue,
  ) {}

  /**
   * Upload a single file
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    category: MediaCategory,
    entityId?: string,
    entityType?: string,
  ): Promise<Media> {
    try {
      // Validate file
      this.validateFile(file);

      // Determine media type
      const mediaType = this.getMediaType(file.mimetype);

      // Generate unique key
      const key = this.generateFileKey(category, file.originalname);

      // Create media record
      const media = this.mediaRepository.create({
        originalName: file.originalname,
        key,
        url: '', // Will be set after upload
        type: mediaType,
        category,
        status: MediaStatus.UPLOADING,
        mimeType: file.mimetype,
        size: file.size,
        userId,
        entityId,
        entityType,
      });

      await this.mediaRepository.save(media);

      try {
        // Upload to S3/MinIO
        const url = await this.storageService.uploadFile(
          key,
          file.buffer,
          file.mimetype,
          {
            userId,
            mediaId: media.id,
            category,
          },
        );

        // Update media record
        media.url = url;
        media.status = MediaStatus.PROCESSING;
        await this.mediaRepository.save(media);

        // Queue for image processing if it's an image
        if (mediaType === MediaType.IMAGE) {
          await this.imageQueue.add(
            JobName.IMAGE_PROCESS,
            {
              mediaId: media.id,
              key,
              userId,
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
            },
          );

          this.logger.log(`Image queued for processing: ${media.id}`);
        } else {
          // Mark as ready if not an image
          media.status = MediaStatus.READY;
          await this.mediaRepository.save(media);
        }

        this.logger.log(`File uploaded successfully: ${media.id}`);
        return media;
      } catch (uploadError) {
        // Clean up database record if upload fails
        await this.mediaRepository.delete(media.id);
        throw uploadError;
      }
    } catch (error) {
      this.logger.error(
        `Failed to upload file: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    userId: string,
    category: MediaCategory,
    entityId?: string,
    entityType?: string,
  ): Promise<Media[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, userId, category, entityId, entityType),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Find media by ID
   */
  async findOne(id: string, userId: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id, userId },
    });

    if (!media) {
      throw new NotFoundException(`Media not found: ${id}`);
    }

    return media;
  }

  /**
   * Find all media for a user
   */
  async findAll(
    userId: string,
    category?: MediaCategory,
    limit: number = 50,
  ): Promise<Media[]> {
    const query = this.mediaRepository
      .createQueryBuilder('media')
      .where('media.userId = :userId', { userId })
      .andWhere('media.deletedAt IS NULL')
      .orderBy('media.createdAt', 'DESC')
      .take(limit);

    if (category) {
      query.andWhere('media.category = :category', { category });
    }

    return query.getMany();
  }

  /**
   * Find media by entity
   */
  async findByEntity(
    entityId: string,
    entityType: string,
  ): Promise<Media[]> {
    return this.mediaRepository.find({
      where: {
        entityId,
        entityType,
        deletedAt: null,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Delete media (soft delete)
   */
  async deleteMedia(id: string, userId: string): Promise<void> {
    const media = await this.findOne(id, userId);

    try {
      // Soft delete in database
      media.deletedAt = new Date();
      await this.mediaRepository.save(media);

      // Optionally delete from S3 immediately
      // Or schedule for deletion after grace period
      // await this.storageService.deleteFile(media.key);

      this.logger.log(`Media soft deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete media: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Permanently delete media
   */
  async permanentlyDeleteMedia(id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });

    if (!media) {
      throw new NotFoundException(`Media not found: ${id}`);
    }

    try {
      // Delete from S3
      await this.storageService.deleteFile(media.key);

      // Delete variants
      if (media.variants) {
        for (const variant of Object.values(media.variants)) {
          if (variant && typeof variant === 'string') {
            const variantKey = this.extractKeyFromUrl(variant);
            if (variantKey) {
              await this.storageService.deleteFile(variantKey);
            }
          }
        }
      }

      // Delete from database
      await this.mediaRepository.delete(id);

      this.logger.log(`Media permanently deleted: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to permanently delete media: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update media after processing
   */
  async updateAfterProcessing(
    mediaId: string,
    data: {
      width?: number;
      height?: number;
      variants?: Record<string, string>;
      metadata?: Record<string, any>;
    },
  ): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id: mediaId } });

    if (!media) {
      throw new NotFoundException(`Media not found: ${mediaId}`);
    }

    media.width = data.width;
    media.height = data.height;
    media.variants = data.variants;
    media.metadata = data.metadata;
    media.status = MediaStatus.READY;

    return this.mediaRepository.save(media);
  }

  /**
   * Mark media as failed
   */
  async markAsFailed(mediaId: string, error: string): Promise<void> {
    await this.mediaRepository.update(mediaId, {
      status: MediaStatus.FAILED,
      metadata: { error },
    });

    this.logger.error(`Media processing failed: ${mediaId} - ${error}`);
  }

  /**
   * Get storage statistics for user
   */
  async getUserStorageStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: Record<string, { count: number; size: number }>;
  }> {
    const media = await this.mediaRepository.find({
      where: { userId, deletedAt: null },
    });

    const stats = {
      totalFiles: media.length,
      totalSize: media.reduce((sum, m) => sum + m.size, 0),
      byCategory: {} as Record<string, { count: number; size: number }>,
    };

    media.forEach((m) => {
      if (!stats.byCategory[m.category]) {
        stats.byCategory[m.category] = { count: 0, size: 0 };
      }
      stats.byCategory[m.category].count++;
      stats.byCategory[m.category].size += m.size;
    });

    return stats;
  }

  /**
   * Validate file
   */
  private validateFile(file: Express.Multer.File): void {
    const mediaType = this.getMediaType(file.mimetype);

    switch (mediaType) {
      case MediaType.IMAGE:
        if (file.size > StorageConfig.MAX_IMAGE_SIZE) {
          throw new BadRequestException(
            `Image size exceeds maximum allowed (${StorageConfig.MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
          );
        }
        if (!StorageConfig.ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
          throw new BadRequestException(`Invalid image type: ${file.mimetype}`);
        }
        break;

      case MediaType.VIDEO:
        if (file.size > StorageConfig.MAX_VIDEO_SIZE) {
          throw new BadRequestException(
            `Video size exceeds maximum allowed (${StorageConfig.MAX_VIDEO_SIZE / 1024 / 1024}MB)`,
          );
        }
        if (!StorageConfig.ALLOWED_VIDEO_MIMETYPES.includes(file.mimetype)) {
          throw new BadRequestException(`Invalid video type: ${file.mimetype}`);
        }
        break;

      case MediaType.DOCUMENT:
        if (file.size > StorageConfig.MAX_DOCUMENT_SIZE) {
          throw new BadRequestException(
            `Document size exceeds maximum allowed (${StorageConfig.MAX_DOCUMENT_SIZE / 1024 / 1024}MB)`,
          );
        }
        if (!StorageConfig.ALLOWED_DOCUMENT_MIMETYPES.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid document type: ${file.mimetype}`,
          );
        }
        break;
    }
  }

  /**
   * Get media type from MIME type
   */
  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) {
      return MediaType.IMAGE;
    }
    if (mimeType.startsWith('video/')) {
      return MediaType.VIDEO;
    }
    return MediaType.DOCUMENT;
  }

  /**
   * Generate unique file key for S3
   */
  private generateFileKey(
    category: MediaCategory,
    originalName: string,
  ): string {
    const ext = path.extname(originalName);
    const filename = `${uuidv4()}${ext}`;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const folder = StorageConfig.FOLDERS[category] || 'uploads';
    return `${folder}/${year}/${month}/${filename}`;
  }

  /**
   * Extract S3 key from URL
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Remove leading slash
      return urlObj.pathname.substring(1);
    } catch {
      return null;
    }
  }
}
