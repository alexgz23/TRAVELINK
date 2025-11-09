import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NotificationType, NotificationChannel } from '@travelink/types';

export type NotificationPreferencesDocument = NotificationPreferences & Document;

@Schema({ timestamps: true })
export class NotificationPreferences {
  @Prop({ required: true, unique: true, index: true })
  userId: string; // UUID del usuario

  // Preferencias generales
  @Prop({ default: true })
  enableInApp: boolean;

  @Prop({ default: true })
  enableEmail: boolean;

  @Prop({ default: false })
  enablePush: boolean;

  @Prop({ default: false })
  enableSms: boolean;

  // Preferencias por tipo de notificación
  @Prop({
    type: Map,
    of: {
      enabled: { type: Boolean, default: true },
      channels: {
        type: [String],
        enum: NotificationChannel,
        default: [NotificationChannel.IN_APP],
      },
    },
    default: {},
  })
  typePreferences: Map<
    NotificationType,
    {
      enabled: boolean;
      channels: NotificationChannel[];
    }
  >;

  // Horarios de No Molestar
  @Prop({ type: Object })
  quietHours?: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
    timezone: string; // "America/Mexico_City"
  };

  // Email digest
  @Prop({ default: false })
  enableEmailDigest: boolean;

  @Prop({ enum: ['daily', 'weekly'], default: 'daily' })
  emailDigestFrequency?: string;

  @Prop()
  lastDigestSentAt?: Date;
}

export const NotificationPreferencesSchema =
  SchemaFactory.createForClass(NotificationPreferences);
