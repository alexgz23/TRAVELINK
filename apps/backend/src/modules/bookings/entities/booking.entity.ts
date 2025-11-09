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
import { BookingStatus, Currency } from '@viajero-conectado/types';
import { User } from '../../users/entities/user.entity';
import { Experience } from '../../experiences/entities/experience.entity';
import { BookingTraveler } from './booking-traveler.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  bookingNumber: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  experienceId: string;

  @Column({ type: 'uuid', nullable: true })
  variantId?: string;

  @Column({ type: 'uuid', nullable: true })
  availabilityId?: string;

  @Column({ type: 'date' })
  bookingDate: Date;

  @Column({ type: 'time', nullable: true })
  bookingTime?: string;

  @Column({ default: 1 })
  numAdults: number;

  @Column({ default: 0 })
  numChildren: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.COP,
  })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Experience)
  @JoinColumn({ name: 'experienceId' })
  experience: Experience;

  @OneToMany(() => BookingTraveler, (traveler) => traveler.booking, { cascade: true })
  travelers?: BookingTraveler[];
}
