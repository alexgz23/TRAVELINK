import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsString,
  IsOptional,
  IsObject,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { CommissionType, ContractDuration } from '@travelink/types';

export class CreateContractDto {
  @IsUUID()
  allianceId: string;

  @IsString()
  @MaxLength(100)
  contractNumber: string;

  @IsEnum(CommissionType)
  commissionType: CommissionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionPercentage?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  fixedCommission?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minimumCommission?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maximumCommission?: number;

  @IsEnum(ContractDuration)
  duration: ContractDuration;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsObject()
  @IsOptional()
  serviceLevels?: {
    responseTime?: number;
    availabilityRate?: number;
    cancellationPolicy?: string;
    paymentTerms?: string;
    [key: string]: any;
  };

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyBookingTarget?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  bonusCommissionRate?: number;
}
