import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Alliance } from './alliance.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum TransactionStatus {
  PENDING = 'pending', // Pendiente de pago
  PAID = 'paid', // Pagado
  CANCELLED = 'cancelled', // Cancelado
  DISPUTED = 'disputed', // En disputa
}

@Entity('alliance_transactions')
export class AllianceTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  allianceId: string;

  @ManyToOne(() => Alliance, (alliance) => alliance.transactions)
  @JoinColumn({ name: 'allianceId' })
  alliance: Alliance;

  // Referencia a la reserva que generó la transacción
  @Column('uuid', { nullable: true })
  bookingId?: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'bookingId' })
  booking?: Booking;

  // Montos
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseAmount: number; // Monto base de la transacción/reserva

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionRate?: number; // Tasa de comisión aplicada (%)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number; // Monto de comisión calculado

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number; // Impuestos sobre la comisión

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number; // Total a pagar (commissionAmount + taxAmount)

  // Estado del pago
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentReference?: string; // Referencia del pago (ID de transferencia, etc.)

  // Descripción y notas
  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Metadatos
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    customerName?: string;
    serviceName?: string;
    serviceDate?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
