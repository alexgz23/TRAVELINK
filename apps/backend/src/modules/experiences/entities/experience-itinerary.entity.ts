import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Experience } from './experience.entity';

@Entity('experience_itineraries')
export class ExperienceItinerary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  experienceId: string;

  @Column()
  dayNumber: number;

  @Column({ nullable: true, length: 255 })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true, length: 255 })
  location?: string;

  @Column('simple-array', { nullable: true })
  meals?: string[];

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Experience, (experience) => experience.itineraries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'experienceId' })
  experience: Experience;
}
