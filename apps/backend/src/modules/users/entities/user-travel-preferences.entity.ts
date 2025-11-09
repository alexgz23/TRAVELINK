import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_travel_preferences')
export class UserTravelPreferences {
  @PrimaryColumn('uuid')
  userId: string;

  @Column('simple-array', { nullable: true })
  travelStyles?: string[];

  @Column('simple-array', { nullable: true })
  interests?: string[];

  @Column({ nullable: true, length: 50 })
  budgetRange?: 'budget' | 'mid' | 'luxury';

  @Column('simple-array', { nullable: true })
  groupPreferences?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
