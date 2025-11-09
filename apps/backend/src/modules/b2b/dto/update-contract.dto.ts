import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateContractDto extends PartialType(CreateContractDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  agencySignatureUrl?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  providerSignatureUrl?: string;
}
