import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationType, NotificationChannel } from '@travelink/types';

export class UpdatePreferencesDto {
  @IsBoolean()
  @IsOptional()
  enableInApp?: boolean;

  @IsBoolean()
  @IsOptional()
  enableEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  enablePush?: boolean;

  @IsBoolean()
  @IsOptional()
  enableSms?: boolean;

  @IsObject()
  @IsOptional()
  typePreferences?: Record<
    NotificationType,
    {
      enabled: boolean;
      channels: NotificationChannel[];
    }
  >;

  @IsObject()
  @IsOptional()
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };

  @IsBoolean()
  @IsOptional()
  enableEmailDigest?: boolean;

  @IsEnum(['daily', 'weekly'])
  @IsOptional()
  emailDigestFrequency?: string;
}
