import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export enum MediaCategory {
  AVATAR = 'avatar',
  EXPERIENCE = 'experience',
  POST = 'post',
  STORY = 'story',
  REVIEW = 'review',
  DOCUMENT = 'document',
  TEMP = 'temp',
}

export enum MediaStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

@Entity('media')
@Index(['userId'])
@Index(['category'])
@Index(['status'])
@Index(['createdAt'])
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  originalName: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  key: string; // S3 key

  @Column({ type: 'varchar', length: 1000 })
  url: string; // Full URL (CDN or S3)

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column({ type: 'enum', enum: MediaCategory })
  category: MediaCategory;

  @Column({ type: 'enum', enum: MediaStatus, default: MediaStatus.UPLOADING })
  status: MediaStatus;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'int' })
  size: number; // Bytes

  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ type: 'int', nullable: true })
  duration?: number; // For videos (seconds)

  // Thumbnails and variants (JSON)
  @Column({ type: 'jsonb', nullable: true })
  variants?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
  };

  // Metadata (exif, location, etc.)
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Reference to entity using this media
  @Column({ type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityType?: string; // 'post', 'experience', 'review', etc.

  // Owner
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date; // Soft delete
}
