import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateResponseDto {
  @IsUUID()
  reviewId: string;

  @IsString()
  @MaxLength(1000)
  message: string;
}
