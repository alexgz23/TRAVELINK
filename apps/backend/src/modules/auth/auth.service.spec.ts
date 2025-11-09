import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole, UserStatus } from '../../../../../packages/types/src/enums/user.enum';

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
const bcrypt = require('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  // Mock user data
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.VIAJERO,
    status: UserStatus.ACTIVE,
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      userId: 'test-user-id',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockAuthResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      status: mockUser.status,
      displayName: mockUser.profile.displayName,
      avatarUrl: mockUser.profile.avatarUrl,
    },
    expiresIn: 604800, // 7 days in seconds
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    // Default mock implementations
    (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mock-token');
    configService.get.mockReturnValue('7d');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'Test123!',
      role: UserRole.VIAJERO,
      displayName: 'New User',
    };

    it('should successfully register a new user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        passwordHash: 'hashed-password',
        role: registerDto.role,
        displayName: registerDto.displayName,
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should hash password with 12 salt rounds', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Test123!',
    };

    it('should successfully login with valid credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(usersService.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should update last login timestamp on successful login', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);

      const result = await service.validateUser(mockUser.id);

      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      usersService.findOne.mockResolvedValue(null as any);

      const result = await service.validateUser('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens for valid user', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken(mockUser.id);

      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe(mockUser.id);
    });
  });

  describe('changePassword', () => {
    const currentPassword = 'OldPass123!';
    const newPassword = 'NewPass456!';

    it('should successfully change password with valid current password', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      await service.changePassword(mockUser.id, currentPassword, newPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.passwordHash);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, {
        passwordHash: 'new-hashed-password',
      });
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(mockUser.id, 'wrong-password', newPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user not found', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.changePassword(mockUser.id, currentPassword, newPassword)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should not throw error if user exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(service.requestPasswordReset(mockUser.email)).resolves.not.toThrow();
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should not throw error if user does not exist (security)', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.requestPasswordReset('nonexistent@example.com')).resolves.not.toThrow();
      expect(usersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('generateAuthResponse (via public methods)', () => {
    it('should generate tokens with correct payload', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);

      const signSpy = jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      await service.register({
        email: 'test@example.com',
        password: 'Test123!',
        role: UserRole.VIAJERO,
        displayName: 'Test',
      });

      expect(signSpy).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should parse expiresIn correctly for different time units', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('mock-token');

      // Test seconds - need to mock both JWT_SECRET and JWT_EXPIRES_IN
      configService.get.mockReturnValueOnce('test-secret').mockReturnValueOnce('3600s');
      let result = await service.refreshToken(mockUser.id);
      expect(result.expiresIn).toBe(3600);

      // Test minutes
      configService.get.mockReturnValueOnce('test-secret').mockReturnValueOnce('60m');
      result = await service.refreshToken(mockUser.id);
      expect(result.expiresIn).toBe(3600);

      // Test hours
      configService.get.mockReturnValueOnce('test-secret').mockReturnValueOnce('24h');
      result = await service.refreshToken(mockUser.id);
      expect(result.expiresIn).toBe(86400);

      // Test days
      configService.get.mockReturnValueOnce('test-secret').mockReturnValueOnce('7d');
      result = await service.refreshToken(mockUser.id);
      expect(result.expiresIn).toBe(604800);

      // Test invalid format (should return default 7 days)
      configService.get.mockReturnValueOnce('test-secret').mockReturnValueOnce('invalid');
      result = await service.refreshToken(mockUser.id);
      expect(result.expiresIn).toBe(604800);
    });
  });
});
