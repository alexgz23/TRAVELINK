import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FollowDocument = Follow & Document;

@Schema({ timestamps: true })
export class Follow {
  @Prop({ required: true, type: MongooseSchema.Types.String })
  followerId: string;

  @Prop({ required: true, type: MongooseSchema.Types.String })
  followingId: string;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// Indices - Unique para evitar follows duplicados
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followerId: 1 });
FollowSchema.index({ followingId: 1 });
