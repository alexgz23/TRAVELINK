import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Review } from './review.entity';

@Entity('review_helpful')
@Index(['reviewId', 'userId'], { unique: true })
export class ReviewHelpful {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reviewId: string;

  @ManyToOne(() => Review, (review) => review.helpfulVotes)
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column('uuid')
  userId: string; // Usuario que votó

  @Column({ type: 'boolean' })
  isHelpful: boolean; // true = útil, false = no útil

  @CreateDateColumn()
  createdAt: Date;
}
