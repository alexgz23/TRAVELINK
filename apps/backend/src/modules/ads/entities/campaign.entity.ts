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
import { CampaignStatus, BillingType } from '@viajero-conectado/types';
import { User } from '../../users/entities/user.entity';
import { Ad } from './ad.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  agencyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({
    type: 'enum',
    enum: BillingType,
  })
  billingType: BillingType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalBudget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spentBudget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  dailyBudget?: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'agencyId' })
  agency: User;

  @OneToMany(() => Ad, (ad) => ad.campaign)
  ads?: Ad[];
}
