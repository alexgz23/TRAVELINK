import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserProfile } from './entities';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserRole, UserStatus } from '@viajero-conectado/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crear usuario
    const user = this.userRepository.create({
      email: createUserDto.email,
      passwordHash: createUserDto.passwordHash,
      role: createUserDto.role || UserRole.VIAJERO,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Crear perfil asociado
    if (createUserDto.displayName) {
      const profile = this.profileRepository.create({
        userId: savedUser.id,
        displayName: createUserDto.displayName,
      });
      await this.profileRepository.save(profile);
    }

    return savedUser;
  }

  /**
   * Encontrar todos los usuarios
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['profile'],
    });
  }

  /**
   * Encontrar usuario por ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Encontrar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
      select: ['id', 'email', 'passwordHash', 'role', 'status', 'emailVerified'],
    });
  }

  /**
   * Encontrar usuario por email (con password para auth)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.profile', 'profile')
      .getOne();
  }

  /**
   * Actualizar usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.status = UserStatus.DELETED;
    await this.userRepository.save(user);
  }

  /**
   * Verificar email
   */
  async verifyEmail(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Actualizar perfil
   */
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.profileRepository.create({
        userId,
        ...profileData,
      });
    } else {
      Object.assign(profile, profileData);
    }

    return this.profileRepository.save(profile);
  }
}
