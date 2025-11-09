import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Experience } from './experience.entity';

@Entity('experience_media')
export class ExperienceMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  experienceId: string;

  @Column({
    type: 'enum',
    enum: ['image', 'video'],
  })
  type: 'image' | 'video';

  @Column({ length: 500 })
  url: string;

  @Column({ nullable: true, length: 500 })
  thumbnailUrl?: string;

  @Column({ type: 'text', nullable: true })
  caption?: string;

  @Column({ default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Experience, (experience) => experience.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'experienceId' })
  experience: Experience;
}
