import { IsBoolean, IsUUID } from 'class-validator';

export class VoteHelpfulDto {
  @IsUUID()
  reviewId: string;

  @IsBoolean()
  isHelpful: boolean; // true = útil, false = no útil
}
