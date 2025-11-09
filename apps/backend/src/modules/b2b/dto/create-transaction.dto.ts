import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsObject,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  allianceId: string;

  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  commissionRate?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commissionAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  taxAmount?: number;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  metadata?: {
    customerName?: string;
    serviceName?: string;
    serviceDate?: string;
    [key: string]: any;
  };
}
