import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../../../../packages/types/src/enums/user.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new RolesGuard(reflector);

    mockRequest = {};
    mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should return true if user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.VIAJERO]);
      mockRequest.user = { id: '123', role: UserRole.VIAJERO };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true if user has one of multiple required roles', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.AGENCIA, UserRole.ADMIN]);
      mockRequest.user = { id: '123', role: UserRole.ADMIN };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user is not authenticated', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockRequest.user = null;

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Usuario no autenticado');
    });

    it('should throw ForbiddenException if user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockRequest.user = { id: '123', role: UserRole.VIAJERO };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'No tienes permisos para acceder a este recurso',
      );
    });

    it('should throw ForbiddenException if user role does not match any required roles', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.ALIADO_PRODUCTOS]);
      mockRequest.user = { id: '123', role: UserRole.VIAJERO };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
    });

    it('should handle undefined user object', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockRequest.user = undefined;

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Usuario no autenticado');
    });

    it('should validate against metadata from both handler and class', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.VIAJERO]);
      mockRequest.user = { id: '123', role: UserRole.VIAJERO };

      guard.canActivate(mockExecutionContext);

      expect(mockExecutionContext.getHandler).toHaveBeenCalled();
      expect(mockExecutionContext.getClass).toHaveBeenCalled();
    });

    it('should correctly check for AGENCIA role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.AGENCIA]);
      mockRequest.user = { id: '123', role: UserRole.AGENCIA };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should correctly check for HOTEL role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.HOTEL]);
      mockRequest.user = { id: '123', role: UserRole.HOTEL };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should correctly check for GUIA role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.GUIA]);
      mockRequest.user = { id: '123', role: UserRole.GUIA };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should correctly check for CONDUCTOR role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.CONDUCTOR]);
      mockRequest.user = { id: '123', role: UserRole.CONDUCTOR };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access to endpoints with multiple allowed roles', () => {
      reflector.getAllAndOverride.mockReturnValue([
        UserRole.AGENCIA,
        UserRole.HOTEL,
        UserRole.GUIA,
        UserRole.CONDUCTOR,
      ]);
      mockRequest.user = { id: '123', role: UserRole.GUIA };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });
});
