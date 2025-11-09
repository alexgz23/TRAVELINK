import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserProfile } from './entities';
import { UserRole, UserStatus } from '../../../../../packages/types/src/enums/user.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;
  let profileRepository: jest.Mocked<Repository<UserProfile>>;

  // Mock data
  const mockUser: Partial<User> = {
    id: 'test-user-id',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.VIAJERO,
    status: UserStatus.ACTIVE,
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProfile: Partial<UserProfile> = {
    userId: 'test-user-id',
    displayName: 'Test User',
    bio: 'Test bio',
    avatarUrl: undefined,
    currentPoints: 0,
    totalPointsEarned: 0,
    currentLevel: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
    profileRepository = module.get(getRepositoryToken(UserProfile)) as jest.Mocked<Repository<UserProfile>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'newuser@example.com',
      passwordHash: 'hashed-password',
      role: UserRole.VIAJERO,
      displayName: 'New User',
    };

    it('should successfully create a new user with profile', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser as User);
      userRepository.save.mockResolvedValue(mockUser as User);
      profileRepository.create.mockReturnValue(mockProfile as UserProfile);
      profileRepository.save.mockResolvedValue(mockProfile as UserProfile);

      const result = await service.create(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
        relations: ['profile'],
        select: ['id', 'email', 'passwordHash', 'role', 'status', 'emailVerified'],
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        passwordHash: createUserDto.passwordHash,
        role: createUserDto.role,
        status: UserStatus.ACTIVE,
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(profileRepository.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        displayName: createUserDto.displayName,
      });
      expect(profileRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should create user without profile if displayName not provided', async () => {
      const dtoWithoutDisplayName = {
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: UserRole.VIAJERO,
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser as User);
      userRepository.save.mockResolvedValue(mockUser as User);

      await service.create(dtoWithoutDisplayName);

      expect(profileRepository.create).not.toHaveBeenCalled();
      expect(profileRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should default to VIAJERO role if not specified', async () => {
      const dtoWithoutRole = {
        email: 'test@example.com',
        passwordHash: 'hashed',
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser as User);
      userRepository.save.mockResolvedValue(mockUser as User);

      await service.create(dtoWithoutRole as any);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.VIAJERO,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users with profiles', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'user-2' }];
      userRepository.find.mockResolvedValue(mockUsers as User[]);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalledWith({
        relations: ['profile'],
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array if no users exist', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id with profile', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findOne(mockUser.id!);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['profile'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findByEmail(mockUser.email!);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        relations: ['profile'],
        select: ['id', 'email', 'passwordHash', 'role', 'status', 'emailVerified'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should return user with password hash', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findByEmailWithPassword(mockUser.email!);

      expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email: mockUser.email });
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.passwordHash');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('user.profile', 'profile');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findByEmailWithPassword('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateData = {
      email: 'updated@example.com',
      role: UserRole.AGENCIA,
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      userRepository.findOne.mockResolvedValue(mockUser as User);
      userRepository.save.mockResolvedValue(updatedUser as User);

      const result = await service.update(mockUser.id!, updateData);

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateData),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateData)).rejects.toThrow(NotFoundException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete user by changing status', async () => {
      const deletedUser = { ...mockUser, status: UserStatus.DELETED };
      userRepository.findOne.mockResolvedValue(mockUser as User);
      userRepository.save.mockResolvedValue(deletedUser as User);

      await service.remove(mockUser.id!);

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: UserStatus.DELETED }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should mark email as verified with timestamp', async () => {
      await service.verifyEmail(mockUser.id!);

      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        emailVerified: true,
        emailVerifiedAt: expect.any(Date),
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update lastLoginAt timestamp', async () => {
      await service.updateLastLogin(mockUser.id!);

      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        lastLoginAt: expect.any(Date),
      });
    });
  });

  describe('updateProfile', () => {
    const profileData = {
      displayName: 'Updated Name',
      bio: 'Updated bio',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    it('should update existing profile', async () => {
      const updatedProfile = { ...mockProfile, ...profileData };
      profileRepository.findOne.mockResolvedValue(mockProfile as UserProfile);
      profileRepository.save.mockResolvedValue(updatedProfile as UserProfile);

      const result = await service.updateProfile(mockUser.id!, profileData);

      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
      expect(profileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(profileData),
      );
      expect(result).toEqual(updatedProfile);
    });

    it('should create profile if it does not exist', async () => {
      profileRepository.findOne.mockResolvedValue(null);
      profileRepository.create.mockReturnValue(mockProfile as UserProfile);
      profileRepository.save.mockResolvedValue(mockProfile as UserProfile);

      const result = await service.updateProfile(mockUser.id!, profileData);

      expect(profileRepository.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        ...profileData,
      });
      expect(profileRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });
  });
});
