import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ReviewableType, ReviewStatus } from '@travelink/types';
import { UserProfile } from '../../users/entities/user-profile.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { ReviewResponse } from './review-response.entity';
import { ReviewReport } from './review-report.entity';
import { ReviewHelpful } from './review-helpful.entity';

@Entity('reviews')
@Index(['reviewableType', 'reviewableId', 'status'])
@Index(['userId', 'createdAt'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Usuario que escribió la reseña
  @Column('uuid')
  userId: string;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'userId' })
  user: UserProfile;

  // Entidad siendo reseñada (polimórfica)
  @Column({
    type: 'enum',
    enum: ReviewableType,
  })
  reviewableType: ReviewableType;

  @Column('uuid')
  reviewableId: string; // ID de la experiencia, agencia, hotel, etc.

  // Reserva asociada (opcional, para verificar que el usuario realmente usó el servicio)
  @Column('uuid', { nullable: true })
  bookingId?: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'bookingId' })
  booking?: Booking;

  // Calificación y contenido
  @Column({ type: 'int' })
  rating: number; // 1-5 estrellas

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  comment: string;

  // Calificaciones detalladas (opcional)
  @Column({ type: 'jsonb', nullable: true })
  detailedRatings?: {
    cleanliness?: number; // Para hoteles
    communication?: number; // Para guías/conductores
    accuracy?: number; // Para experiencias
    value?: number; // Relación calidad-precio
    location?: number; // Para hoteles
    service?: number; // Servicio general
    [key: string]: number;
  };

  // Fotos/videos
  @Column({ type: 'simple-array', nullable: true })
  mediaUrls?: string[];

  // Estado
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  // Moderación
  @Column('uuid', { nullable: true })
  moderatedBy?: string; // Admin que moderó

  @Column({ type: 'timestamp', nullable: true })
  moderatedAt?: Date;

  @Column({ type: 'text', nullable: true })
  moderationReason?: string; // Razón de rechazo/ocultación

  // Métricas de utilidad
  @Column({ type: 'int', default: 0 })
  helpfulCount: number; // Cantidad de "útil"

  @Column({ type: 'int', default: 0 })
  notHelpfulCount: number; // Cantidad de "no útil"

  @Column({ type: 'int', default: 0 })
  reportCount: number; // Cantidad de reportes

  // Verificación
  @Column({ default: false })
  isVerifiedPurchase: boolean; // Si está vinculada a una reserva confirmada

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt?: Date;

  // Relaciones
  @OneToMany(() => ReviewResponse, (response) => response.review)
  responses: ReviewResponse[];

  @OneToMany(() => ReviewReport, (report) => report.review)
  reports: ReviewReport[];

  @OneToMany(() => ReviewHelpful, (helpful) => helpful.review)
  helpfulVotes: ReviewHelpful[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
