import { IsString, IsBoolean } from 'class-validator';

export class TypingIndicatorDto {
  @IsString()
  conversationId: string;

  @IsBoolean()
  isTyping: boolean;
}
