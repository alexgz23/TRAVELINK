import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RedeemRewardDto {
  @ApiProperty({ description: 'ID de la recompensa a canjear' })
  @IsNotEmpty()
  @IsUUID()
  rewardId: string;

  @ApiPropertyOptional({ description: 'Notas de entrega o detalles adicionales' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}
