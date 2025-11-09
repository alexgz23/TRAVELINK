import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

/**
 * Esquema de Conversación
 * Representa una conversación entre dos o más usuarios
 */
@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [{ type: String, required: true }], required: true })
  participants: string[]; // IDs de usuarios participantes

  @Prop({ default: false })
  isGroup: boolean;

  @Prop()
  groupName?: string;

  @Prop()
  groupAvatar?: string;

  @Prop({ type: String })
  groupAdmin?: string; // ID del admin del grupo (si es grupo)

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop({ type: Map, of: Date, default: {} })
  readBy: Map<string, Date>; // userId -> timestamp de última lectura

  @Prop({ type: Map, of: Boolean, default: {} })
  mutedBy: Map<string, boolean>; // userId -> si tiene muted la conversación

  @Prop({ type: [String], default: [] })
  blockedBy: string[]; // IDs de usuarios que bloquearon la conversación
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Índices
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ 'participants': 1, 'isGroup': 1 });
