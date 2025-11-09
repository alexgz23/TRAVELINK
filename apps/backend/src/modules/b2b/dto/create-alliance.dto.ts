import { IsEnum, IsUUID, IsString, IsOptional, IsNumber, IsObject, Min, Max, MaxLength } from 'class-validator';
import { AllianceType } from '@travelink/types';

export class CreateAllianceDto {
  @IsUUID()
  providerId: string;

  @IsEnum(AllianceType)
  type: AllianceType;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  defaultCommissionRate?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  defaultFixedCommission?: number;

  @IsObject()
  @IsOptional()
  metadata?: {
    services?: string[];
    exclusivityZones?: string[];
    minimumBookings?: number;
    preferredPartner?: boolean;
    [key: string]: any;
  };
}
