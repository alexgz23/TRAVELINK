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
import {
  ExperienceCategory,
  DifficultyLevel,
  ExperienceStatus,
  Currency,
} from '@viajero-conectado/types';
import { User } from '../../users/entities/user.entity';
import { ExperienceVariant } from './experience-variant.entity';
import { ExperienceMedia } from './experience-media.entity';
import { ExperienceItinerary } from './experience-itinerary.entity';

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  agencyId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column('text')
  description: string;

  @Column({ nullable: true, length: 500 })
  shortDescription?: string;

  @Column({
    type: 'enum',
    enum: ExperienceCategory,
  })
  category: ExperienceCategory;

  @Column({ nullable: true, length: 100 })
  subcategory?: string;

  @Column({ length: 2 })
  locationCountry: string;

  @Column({ nullable: true, length: 100 })
  locationCity?: string;

  @Column({ type: 'text', nullable: true })
  locationAddress?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  locationLat?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  locationLng?: number;

  @Column({ nullable: true })
  durationHours?: number;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    nullable: true,
  })
  difficultyLevel?: DifficultyLevel;

  @Column({ nullable: true })
  minAge?: number;

  @Column({ nullable: true })
  maxGroupSize?: number;

  @Column('simple-array', { nullable: true })
  languages?: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceFrom: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.COP,
  })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: ExperienceStatus,
    default: ExperienceStatus.DRAFT,
  })
  status: ExperienceStatus;

  @Column({ default: false })
  featured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'agencyId' })
  agency: User;

  @OneToMany(() => ExperienceVariant, (variant) => variant.experience, { cascade: true })
  variants?: ExperienceVariant[];

  @OneToMany(() => ExperienceMedia, (media) => media.experience, { cascade: true })
  media?: ExperienceMedia[];

  @OneToMany(() => ExperienceItinerary, (itinerary) => itinerary.experience, {
    cascade: true,
  })
  itineraries?: ExperienceItinerary[];
}
