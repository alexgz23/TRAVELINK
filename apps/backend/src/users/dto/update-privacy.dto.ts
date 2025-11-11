import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePrivacyDto {
  @ApiPropertyOptional({
    description: 'Make profile public/private',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;

  @ApiPropertyOptional({
    description: 'Show map with visited countries',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  showMap?: boolean;

  @ApiPropertyOptional({
    description: 'Show trips and bookings',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  showTrips?: boolean;
}
