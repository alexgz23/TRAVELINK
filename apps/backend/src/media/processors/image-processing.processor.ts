import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as sharp from 'sharp';
import { StorageService } from '../storage.service';
import { MediaService } from '../media.service';
import { StorageConfig } from '../../config/storage.config';
import { QueueName, JobName } from '../../queues/constants';
import * as path from 'path';

interface ImageProcessingData {
  mediaId: string;
  key: string;
  userId: string;
}

@Processor(QueueName.IMAGE_PROCESSING)
export class ImageProcessingProcessor {
  private readonly logger = new Logger(ImageProcessingProcessor.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
  ) {}

  @Process(JobName.IMAGE_PROCESS)
  async processImage(job: Job<ImageProcessingData>): Promise<void> {
    const { mediaId, key, userId } = job.data;

    this.logger.log(`Processing image: ${mediaId}`);

    try {
      // Download original image from S3
      const imageBuffer = await this.storageService.getFile(key);

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();

      // Generate variants
      const variants: Record<string, string> = {};

      for (const [sizeName, sizeConfig] of Object.entries(
        StorageConfig.IMAGE_SIZES,
      )) {
        if (sizeName === 'original') continue;

        const variantKey = this.generateVariantKey(key, sizeName);
        const variantBuffer = await this.resizeImage(
          imageBuffer,
          sizeConfig.width,
          sizeConfig.height,
        );

        const variantUrl = await this.storageService.uploadFile(
          variantKey,
          variantBuffer,
          'image/jpeg',
          {
            userId,
            mediaId,
            variant: sizeName,
          },
        );

        variants[sizeName] = variantUrl;

        this.logger.log(`Generated variant ${sizeName} for image ${mediaId}`);
      }

      // Update media record
      await this.mediaService.updateAfterProcessing(mediaId, {
        width: metadata.width,
        height: metadata.height,
        variants,
        metadata: {
          format: metadata.format,
          space: metadata.space,
          channels: metadata.channels,
          depth: metadata.depth,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha,
          orientation: metadata.orientation,
        },
      });

      this.logger.log(`Image processed successfully: ${mediaId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process image ${mediaId}: ${error.message}`,
        error.stack,
      );

      // Mark media as failed
      await this.mediaService.markAsFailed(mediaId, error.message);

      throw error; // Rethrow to trigger Bull retry mechanism
    }
  }

  /**
   * Resize and optimize image
   */
  private async resizeImage(
    imageBuffer: Buffer,
    width: number,
    height: number,
  ): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize(width, height, {
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true, // Don't upscale smaller images
      })
      .jpeg({
        quality: 85, // Good balance between quality and size
        progressive: true,
        mozjpeg: true, // Use mozjpeg for better compression
      })
      .toBuffer();
  }

  /**
   * Generate variant key
   */
  private generateVariantKey(originalKey: string, variant: string): string {
    const ext = path.extname(originalKey);
    const basename = path.basename(originalKey, ext);
    const dirname = path.dirname(originalKey);
    return `${dirname}/${basename}-${variant}${ext}`;
  }
}
