import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LikeDocument = Like & Document;

export enum LikeableType {
  POST = 'Post',
  COMMENT = 'Comment',
}

@Schema({ timestamps: true })
export class Like {
  @Prop({ required: true, type: MongooseSchema.Types.String })
  userId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  likeableId: string;

  @Prop({ required: true, enum: LikeableType })
  likeableType: LikeableType;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// Indices - Unique para evitar likes duplicados
LikeSchema.index({ userId: 1, likeableId: 1, likeableType: 1 }, { unique: true });
LikeSchema.index({ likeableId: 1, likeableType: 1 });
