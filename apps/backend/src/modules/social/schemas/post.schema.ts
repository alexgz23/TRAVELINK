import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, type: MongooseSchema.Types.String })
  userId: string;

  @Prop({ required: true, maxlength: 2000 })
  content: string;

  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  locationName?: string;

  @Prop({ type: Number })
  locationLat?: number;

  @Prop({ type: Number })
  locationLng?: number;

  @Prop({ type: String })
  experienceId?: string;

  @Prop({ type: String })
  bookingId?: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ default: 0 })
  sharesCount: number;

  @Prop({ default: true })
  isPublic: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indices
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ experienceId: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });
