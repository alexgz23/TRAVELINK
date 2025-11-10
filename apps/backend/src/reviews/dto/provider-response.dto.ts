import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ProviderResponseDto {
  @ApiProperty({
    description: 'Provider response to the review',
    example: 'Thank you for your kind words! We are glad you enjoyed the experience.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  response: string;
}
