import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '@travelink/types';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  channels?: NotificationChannel[];

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(1000)
  message: string;

  @IsObject()
  @IsOptional()
  data?: {
    entityId?: string;
    entityType?: string;
    actionUrl?: string;
    imageUrl?: string;
    actorId?: string;
    actorName?: string;
    [key: string]: any;
  };

  @IsDateString()
  @IsOptional()
  scheduledFor?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  @IsOptional()
  groupKey?: string;
}
