import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  IsEmail,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Experience ID to book',
    example: 'clxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  experienceId: string;

  @ApiProperty({
    description: 'Start date of the experience',
    example: '2025-12-25T10:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for multi-day experiences',
    example: '2025-12-27T18:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Number of people for the booking',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  numberOfPeople: number;

  @ApiProperty({
    description: 'Contact person full name',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  contactEmail: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+57 300 123 4567',
  })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiProperty({
    description: 'Special requests or notes',
    example: 'Vegetarian meal required',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({
    description: 'Points to use for discount',
    example: 100,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  pointsUsed?: number;
}
