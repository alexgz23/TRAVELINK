import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

/**
 * S3/MinIO Configuration Factory
 * Supports both AWS S3 and MinIO (S3-compatible storage)
 */
export const createS3Client = (configService: ConfigService): S3Client => {
  const endpoint = configService.get<string>('AWS_ENDPOINT');
  const region = configService.get<string>('AWS_REGION', 'us-east-1');
  const accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID');
  const secretAccessKey = configService.get<string>('AWS_SECRET_ACCESS_KEY');

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // For MinIO compatibility
    endpoint: endpoint,
    forcePathStyle: !!endpoint, // Required for MinIO
  });
};

/**
 * Storage configuration constants
 */
export const StorageConfig = {
  // Allowed file types
  ALLOWED_IMAGE_MIMETYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],

  ALLOWED_VIDEO_MIMETYPES: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ],

  ALLOWED_DOCUMENT_MIMETYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],

  // Size limits (in bytes)
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024, // 20MB

  // Image processing sizes
  IMAGE_SIZES: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 320, height: 320 },
    medium: { width: 640, height: 640 },
    large: { width: 1280, height: 1280 },
    original: null, // Keep original size
  },

  // S3 folders
  FOLDERS: {
    avatars: 'avatars',
    experiences: 'experiences',
    posts: 'posts',
    stories: 'stories',
    reviews: 'reviews',
    documents: 'documents',
    temp: 'temp',
  },

  // CDN/CloudFront URLs
  getCdnUrl: (configService: ConfigService, key: string): string => {
    const cdnDomain = configService.get<string>('CDN_DOMAIN');
    if (cdnDomain) {
      return `https://${cdnDomain}/${key}`;
    }

    const endpoint = configService.get<string>('AWS_ENDPOINT');
    const bucket = configService.get<string>('AWS_S3_BUCKET');

    if (endpoint) {
      // MinIO/local development
      return `${endpoint}/${bucket}/${key}`;
    }

    // AWS S3
    const region = configService.get<string>('AWS_REGION', 'us-east-1');
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  },
};

/**
 * Multer file filter for validating file types
 */
export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!StorageConfig.ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
    return callback(
      new Error(
        `Invalid file type. Allowed types: ${StorageConfig.ALLOWED_IMAGE_MIMETYPES.join(', ')}`,
      ),
      false,
    );
  }
  callback(null, true);
};

export const videoFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!StorageConfig.ALLOWED_VIDEO_MIMETYPES.includes(file.mimetype)) {
    return callback(
      new Error(
        `Invalid file type. Allowed types: ${StorageConfig.ALLOWED_VIDEO_MIMETYPES.join(', ')}`,
      ),
      false,
    );
  }
  callback(null, true);
};

export const documentFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!StorageConfig.ALLOWED_DOCUMENT_MIMETYPES.includes(file.mimetype)) {
    return callback(
      new Error(
        `Invalid file type. Allowed types: ${StorageConfig.ALLOWED_DOCUMENT_MIMETYPES.join(', ')}`,
      ),
      false,
    );
  }
  callback(null, true);
};
