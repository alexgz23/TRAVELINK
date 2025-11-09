import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Experience } from './experience.entity';

@Entity('experience_variants')
export class ExperienceVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  experienceId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  maxPeople?: number;

  @Column('simple-array', { nullable: true })
  includes?: string[];

  @Column('simple-array', { nullable: true })
  excludes?: string[];

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Experience, (experience) => experience.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'experienceId' })
  experience: Experience;
}
