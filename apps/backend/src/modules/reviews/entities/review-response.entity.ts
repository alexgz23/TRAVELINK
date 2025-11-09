import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Review } from './review.entity';

@Entity('review_responses')
export class ReviewResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reviewId: string;

  @ManyToOne(() => Review, (review) => review.responses)
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  // Usuario que responde (generalmente el proveedor del servicio)
  @Column('uuid')
  responderId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
