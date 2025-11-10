import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @ApiProperty({
    description: 'Booking status',
    enum: BookingStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({
    description: 'Provider notes (only for providers)',
    example: 'Customer requested early check-in',
    required: false,
  })
  @IsOptional()
  @IsString()
  providerNotes?: string;

  @ApiProperty({
    description: 'New start date (if modification is requested)',
    example: '2025-12-26T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'New end date (if modification is requested)',
    example: '2025-12-28T18:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
