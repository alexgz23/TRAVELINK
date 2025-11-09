import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../../../packages/types/src/enums/user.enum';

export const ROLES_KEY = 'roles';

/**
 * Especifica qué roles pueden acceder a un endpoint
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
