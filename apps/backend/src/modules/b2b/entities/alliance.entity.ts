import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AllianceType, AllianceStatus } from '@travelink/types';
import { UserProfile } from '../../users/entities/user-profile.entity';
import { AllianceContract } from './alliance-contract.entity';
import { AllianceTransaction } from './alliance-transaction.entity';

@Entity('alliances')
export class Alliance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Agencia que solicita/gestiona la alianza
  @Column('uuid')
  agencyId: string;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'agencyId' })
  agency: UserProfile;

  // Proveedor (hotel, guía, conductor)
  @Column('uuid')
  providerId: string;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'providerId' })
  provider: UserProfile;

  @Column({
    type: 'enum',
    enum: AllianceType,
  })
  type: AllianceType;

  @Column({
    type: 'enum',
    enum: AllianceStatus,
    default: AllianceStatus.PENDING,
  })
  status: AllianceStatus;

  // Información básica
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Términos de comisión por defecto (se pueden personalizar en el contrato)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  defaultCommissionRate?: number; // Porcentaje de comisión (ej: 15.00 = 15%)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultFixedCommission?: number; // Comisión fija por transacción

  // Metadatos
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    services?: string[]; // Servicios específicos incluidos
    exclusivityZones?: string[]; // Zonas de exclusividad
    minimumBookings?: number; // Mínimo de reservas mensuales
    preferredPartner?: boolean; // Si es socio preferente
    [key: string]: any;
  };

  // Razones de rechazo/terminación
  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'text', nullable: true })
  terminationReason?: string;

  // Relaciones
  @OneToMany(() => AllianceContract, (contract) => contract.alliance)
  contracts: AllianceContract[];

  @OneToMany(() => AllianceTransaction, (transaction) => transaction.alliance)
  transactions: AllianceTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  terminatedAt?: Date;
}
