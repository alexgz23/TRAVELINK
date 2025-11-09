import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AdFormat, AdStatus, AudienceGender } from '@viajero-conectado/types';
import { Campaign } from './campaign.entity';
import { Experience } from '../../experiences/entities/experience.entity';
import { AdMetrics } from './ad-metrics.entity';

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  campaignId: string;

  @Column({ type: 'uuid', nullable: true })
  experienceId?: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AdFormat,
  })
  format: AdFormat;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ctaUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ctaText?: string;

  @Column({
    type: 'enum',
    enum: AdStatus,
    default: AdStatus.DRAFT,
  })
  status: AdStatus;

  // Targeting/Segmentation
  @Column({ type: 'simple-array', nullable: true })
  targetCountries?: string[];

  @Column({ type: 'simple-array', nullable: true })
  targetCities?: string[];

  @Column({ type: 'int', nullable: true })
  targetAgeMin?: number;

  @Column({ type: 'int', nullable: true })
  targetAgeMax?: number;

  @Column({
    type: 'enum',
    enum: AudienceGender,
    default: AudienceGender.ALL,
  })
  targetGender: AudienceGender;

  @Column({ type: 'simple-array', nullable: true })
  targetInterests?: string[];

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cpcBid?: number; // Cost per click

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cpmBid?: number; // Cost per thousand impressions

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Campaign, (campaign) => campaign.ads)
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @ManyToOne(() => Experience, { nullable: true })
  @JoinColumn({ name: 'experienceId' })
  experience?: Experience;

  @OneToMany(() => AdMetrics, (metrics) => metrics.ad)
  metrics?: AdMetrics[];
}
