import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { MessageType } from '../schemas/message.schema';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  replyTo?: string;

  @IsObject()
  @IsOptional()
  metadata?: {
    filename?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    thumbnailUrl?: string;
    latitude?: number;
    longitude?: number;
  };
}
