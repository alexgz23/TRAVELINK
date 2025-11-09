import { PartialType } from '@nestjs/mapped-types';
import { CreateAllianceDto } from './create-alliance.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AllianceStatus } from '@travelink/types';

export class UpdateAllianceDto extends PartialType(CreateAllianceDto) {
  @IsEnum(AllianceStatus)
  @IsOptional()
  status?: AllianceStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  terminationReason?: string;
}
