import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationStatus,
} from '@travelink/types';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, index: true })
  userId: string; // UUID del usuario receptor

  @Prop({
    required: true,
    enum: NotificationType,
    index: true,
  })
  type: NotificationType;

  @Prop({
    required: true,
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Prop({
    type: [String],
    enum: NotificationChannel,
    default: [NotificationChannel.IN_APP],
  })
  channels: NotificationChannel[];

  @Prop({
    required: true,
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
    index: true,
  })
  status: NotificationStatus;

  // Contenido
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  data?: {
    entityId?: string; // ID de la entidad relacionada (booking, post, etc.)
    entityType?: string; // Tipo de entidad (booking, post, etc.)
    actionUrl?: string; // URL a la que redirigir al hacer clic
    imageUrl?: string; // Imagen asociada
    actorId?: string; // ID del usuario que generó la acción
    actorName?: string; // Nombre del usuario que generó la acción
    [key: string]: any;
  };

  // Timestamps de estado
  @Prop({ type: Date })
  sentAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date, index: true })
  readAt?: Date;

  @Prop({ type: Date })
  failedAt?: Date;

  @Prop()
  errorMessage?: string; // Mensaje de error si falló

  // Scheduling
  @Prop({ type: Date })
  scheduledFor?: Date; // Para notificaciones programadas

  @Prop({ type: Date })
  expiresAt?: Date; // Fecha de expiración

  // Agrupación
  @Prop()
  groupKey?: string; // Para agrupar notificaciones similares

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ default: false })
  isMuted: boolean; // Usuario silencio este tipo de notificación
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índices compuestos para queries eficientes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, scheduledFor: 1 });
NotificationSchema.index({ userId: 1, groupKey: 1 });
