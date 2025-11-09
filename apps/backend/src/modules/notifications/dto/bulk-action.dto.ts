import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export enum BulkAction {
  MARK_AS_READ = 'mark_as_read',
  MARK_AS_UNREAD = 'mark_as_unread',
  ARCHIVE = 'archive',
  UNARCHIVE = 'unarchive',
  DELETE = 'delete',
}

export class BulkActionDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notificationIds?: string[];

  @IsEnum(BulkAction)
  action: BulkAction;

  @IsOptional()
  all?: boolean; // Si es true, aplica a todas las notificaciones del usuario
}
