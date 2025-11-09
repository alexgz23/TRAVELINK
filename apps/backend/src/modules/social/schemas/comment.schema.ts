import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Post' })
  postId: string;

  @Prop({ required: true, type: MongooseSchema.Types.String })
  userId: string;

  @Prop({ required: true, maxlength: 500 })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment' })
  parentCommentId?: string;

  @Prop({ default: 0 })
  likesCount: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Indices
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ parentCommentId: 1 });
