import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { UploadImageDto, ImageFolder } from './dto';

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

@Injectable()
export class UploadsService {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload single image to Cloudinary
   */
  async uploadImage(
    file: Express.Multer.File,
    options: UploadImageDto = {},
  ): Promise<CloudinaryUploadResult> {
    // Validate file
    this.validateImageFile(file);

    // Build transformation options
    const transformation: any[] = [];

    if (options.width || options.height) {
      transformation.push({
        width: options.width,
        height: options.height,
        crop: 'limit', // Maintain aspect ratio, don't exceed dimensions
      });
    }

    if (options.quality) {
      transformation.push({
        quality: options.quality,
      });
    }

    // Always optimize images
    transformation.push({
      fetch_format: 'auto', // Auto-select best format (WebP, AVIF, etc.)
    });

    try {
      const result = await this.uploadStream(file.buffer, {
        folder: `travelink/${options.folder || ImageFolder.EXPERIENCES}`,
        transformation: transformation.length > 0 ? transformation : undefined,
        resource_type: 'image',
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload image: ${error.message}`,
      );
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    options: UploadImageDto = {},
  ): Promise<CloudinaryUploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Limit to 10 images per upload
    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed per upload');
    }

    // Upload all images in parallel
    const uploadPromises = files.map((file) =>
      this.uploadImage(file, options),
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload images: ${error.message}`,
      );
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<{ result: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Deletion failed: ${result.result}`);
      }

      return { result: result.result };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete image: ${error.message}`,
      );
    }
  }

  /**
   * Delete multiple images
   */
  async deleteMultipleImages(
    publicIds: string[],
  ): Promise<{ deleted: string[]; failed: string[] }> {
    const results = await Promise.allSettled(
      publicIds.map((id) => this.deleteImage(id)),
    );

    const deleted: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        deleted.push(publicIds[index]);
      } else {
        failed.push(publicIds[index]);
      }
    });

    return { deleted, failed };
  }

  /**
   * Generate optimized URL for an image
   */
  generateOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    },
  ): string {
    const transformation: any = {
      fetch_format: options?.format || 'auto',
      quality: options?.quality || 'auto',
    };

    if (options?.width || options?.height) {
      transformation.width = options.width;
      transformation.height = options.height;
      transformation.crop = 'limit';
    }

    return cloudinary.url(publicId, transformation);
  }

  /**
   * Get image metadata from Cloudinary
   */
  async getImageMetadata(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get image metadata: ${error.message}`,
      );
    }
  }

  /**
   * Helper: Validate image file
   */
  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File too large. Maximum size is 10MB',
      );
    }

    // Check mime type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * Helper: Upload stream to Cloudinary
   */
  private uploadStream(
    buffer: Buffer,
    options: any,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }
}
