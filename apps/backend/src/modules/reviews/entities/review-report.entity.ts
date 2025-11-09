import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReportReason } from '@travelink/types';
import { Review } from './review.entity';

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Entity('review_reports')
export class ReviewReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reviewId: string;

  @ManyToOne(() => Review, (review) => review.reports)
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  // Usuario que reportó
  @Column('uuid')
  reporterId: string;

  @Column({
    type: 'enum',
    enum: ReportReason,
  })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  // Moderación
  @Column('uuid', { nullable: true })
  reviewedBy?: string; // Admin que revisó

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'text', nullable: true })
  resolution?: string; // Acción tomada

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
