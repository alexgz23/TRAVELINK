import { IsEnum, IsString } from 'class-validator';
import { MessageStatus } from '../schemas/message.schema';

export class UpdateMessageStatusDto {
  @IsString()
  messageId: string;

  @IsEnum(MessageStatus)
  status: MessageStatus;
}
