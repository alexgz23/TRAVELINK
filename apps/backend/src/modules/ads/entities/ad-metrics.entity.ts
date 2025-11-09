import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ad } from './ad.entity';

@Entity('ad_metrics')
@Index(['adId', 'date'], { unique: true })
export class AdMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  adId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', default: 0 })
  impressions: number;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ type: 'int', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spent: number;

  @Column({ type: 'int', default: 0 })
  reach: number; // Unique users reached

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Ad, (ad) => ad.metrics)
  @JoinColumn({ name: 'adId' })
  ad: Ad;
}
