import { IsEnum, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationStatus } from '@travelink/types';

export class FilterNotificationsDto {
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isRead?: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isArchived?: boolean;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}
