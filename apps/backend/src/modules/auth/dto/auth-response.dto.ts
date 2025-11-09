import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@viajero-conectado/types';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    displayName?: string;
    avatarUrl?: string;
  };

  @ApiProperty()
  expiresIn: number;
}
