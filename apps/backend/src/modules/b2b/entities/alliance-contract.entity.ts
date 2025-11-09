import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CommissionType, ContractDuration } from '@travelink/types';
import { Alliance } from './alliance.entity';

@Entity('alliance_contracts')
export class AllianceContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  allianceId: string;

  @ManyToOne(() => Alliance, (alliance) => alliance.contracts)
  @JoinColumn({ name: 'allianceId' })
  alliance: Alliance;

  // Información del contrato
  @Column({ type: 'varchar', length: 100 })
  contractNumber: string; // Número único del contrato (ej: CNT-2024-001)

  @Column({
    type: 'enum',
    enum: CommissionType,
    default: CommissionType.PERCENTAGE,
  })
  commissionType: CommissionType;

  // Comisiones
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionPercentage?: number; // Para PERCENTAGE o HYBRID

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedCommission?: number; // Para FIXED o HYBRID

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumCommission?: number; // Comisión mínima garantizada

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumCommission?: number; // Comisión máxima aplicable

  // Duración y vigencia
  @Column({
    type: 'enum',
    enum: ContractDuration,
    default: ContractDuration.ONE_YEAR,
  })
  duration: ContractDuration;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  autoRenew: boolean; // Se renueva automáticamente

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Términos y condiciones
  @Column({ type: 'text', nullable: true })
  terms?: string; // Términos específicos del contrato

  @Column({ type: 'jsonb', nullable: true })
  serviceLevels?: {
    responseTime?: number; // Tiempo de respuesta en horas
    availabilityRate?: number; // % de disponibilidad esperado
    cancellationPolicy?: string;
    paymentTerms?: string; // Términos de pago (ej: "NET 30")
    [key: string]: any;
  };

  // Objetivos y bonificaciones
  @Column({ type: 'int', nullable: true })
  monthlyBookingTarget?: number; // Meta mensual de reservas

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bonusCommissionRate?: number; // Comisión adicional al cumplir metas

  // Firmas digitales (URLs a documentos firmados)
  @Column({ type: 'varchar', length: 500, nullable: true })
  agencySignatureUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  providerSignatureUrl?: string;

  @Column({ type: 'timestamp', nullable: true })
  signedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
