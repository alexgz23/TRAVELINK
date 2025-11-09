import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, StorageConfig } from '../config/storage.config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = createS3Client(configService);
    this.bucket = configService.get<string>('AWS_S3_BUCKET');

    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET not configured');
    }

    this.logger.log(`Storage initialized with bucket: ${this.bucket}`);
  }

  /**
   * Upload file to S3/MinIO
   */
  async uploadFile(
    key: string,
    file: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
        // ACL: 'public-read', // Optional: make files public
      });

      await this.s3Client.send(command);

      const url = StorageConfig.getCdnUrl(this.configService, key);
      this.logger.log(`File uploaded successfully: ${key}`);

      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from S3/MinIO
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Get file from S3/MinIO
   */
  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as any;
      const chunks: Uint8Array[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`, error.stack);
      throw new Error(`Get file failed: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL: ${error.message}`,
        error.stack,
      );
      throw new Error(`Signed URL generation failed: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<Record<string, any>> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
        etag: response.ETag,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get file metadata: ${error.message}`,
        error.stack,
      );
      throw new Error(`Get metadata failed: ${error.message}`);
    }
  }

  /**
   * Copy file within bucket
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<string> {
    try {
      // Get source file
      const sourceFile = await this.getFile(sourceKey);
      const metadata = await this.getFileMetadata(sourceKey);

      // Upload to destination
      const url = await this.uploadFile(
        destinationKey,
        sourceFile,
        metadata.contentType,
      );

      this.logger.log(`File copied: ${sourceKey} -> ${destinationKey}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to copy file: ${error.message}`, error.stack);
      throw new Error(`Copy failed: ${error.message}`);
    }
  }
}
