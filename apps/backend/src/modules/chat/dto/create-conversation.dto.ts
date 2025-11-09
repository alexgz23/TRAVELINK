import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @IsString({ each: true })
  participants: string[];

  @IsBoolean()
  @IsOptional()
  isGroup?: boolean;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsString()
  @IsOptional()
  groupAvatar?: string;
}
