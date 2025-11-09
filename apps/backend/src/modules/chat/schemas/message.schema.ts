import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  SYSTEM = 'system', // Mensajes del sistema (usuario se unió, salió, etc.)
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

/**
 * Esquema de Mensaje
 * Representa un mensaje individual en una conversación
 */
@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: String, required: true })
  senderId: string; // ID del usuario que envió el mensaje

  @Prop({ type: String, enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Prop({ required: true })
  content: string; // Texto del mensaje o URL si es multimedia

  @Prop({ type: String, enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  @Prop({ type: [String], default: [] })
  readBy: string[]; // IDs de usuarios que leyeron el mensaje

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: [String], default: [] })
  deliveredTo: string[]; // IDs de usuarios a los que se entregó

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyTo?: Types.ObjectId; // ID del mensaje al que responde

  @Prop({ type: Object })
  metadata?: {
    filename?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number; // Para audio/video
    thumbnailUrl?: string; // Para video/imagen
    latitude?: number; // Para location
    longitude?: number; // Para location
  };

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ type: Date })
  editedAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Índices
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ conversationId: 1, status: 1 });
