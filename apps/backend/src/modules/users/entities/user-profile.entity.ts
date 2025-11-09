import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Gender, BadgeCode } from '@viajero-conectado/types';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryColumn('uuid')
  userId: string;

  @Column({ nullable: true, length: 100 })
  displayName?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true, length: 500 })
  avatarUrl?: string;

  @Column({ nullable: true, length: 500 })
  coverUrl?: string;

  @Column({ nullable: true, length: 2 })
  countryCode?: string;

  @Column({ nullable: true, length: 100 })
  city?: string;

  @Column('simple-array', { nullable: true })
  languages?: string[];

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender?: Gender;

  // Gamification fields
  @Column({ type: 'int', default: 0 })
  currentPoints: number;

  @Column({ type: 'int', default: 0 })
  totalPointsEarned: number;

  @Column({ type: 'int', default: 1 })
  currentLevel: number;

  @Column('simple-array', { nullable: true })
  badges?: BadgeCode[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
