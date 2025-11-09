import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import { User } from '@/modules/users/entities';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar si el email ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await this.hashPassword(registerDto.password);

    // Crear usuario
    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      role: registerDto.role,
      displayName: registerDto.displayName,
    });

    // Generar tokens
    return this.generateAuthResponse(user);
  }

  /**
   * Login de usuario
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuario con password
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await this.comparePassword(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.usersService.updateLastLogin(user.id);

    // Generar tokens
    return this.generateAuthResponse(user);
  }

  /**
   * Validar usuario (usado por JWT strategy)
   */
  async validateUser(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  /**
   * Refresh token
   */
  async refreshToken(userId: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findOne(userId);
    return this.generateAuthResponse(user);
  }

  /**
   * Hash de contraseña
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Comparar contraseña
   */
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generar respuesta de autenticación con tokens
   */
  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    const expiresIn = this.configService.get('JWT_EXPIRES_IN', '7d');
    const expiresInSeconds = this.parseExpiresIn(expiresIn);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        displayName: user.profile?.displayName,
        avatarUrl: user.profile?.avatarUrl,
      },
      expiresIn: expiresInSeconds,
    };
  }

  /**
   * Parsear tiempo de expiración a segundos
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 604800; // 7 días por defecto

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 604800;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findByEmailWithPassword(
      (
        await this.usersService.findOne(userId)
      ).email,
    );

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await this.comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hash de nueva contraseña
    const newPasswordHash = await this.hashPassword(newPassword);

    // Actualizar
    await this.usersService.update(userId, { passwordHash: newPasswordHash });
  }

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // No revelar si el email existe o no
      return;
    }

    // TODO: Generar token de reset
    // TODO: Enviar email con link de reset
    // Por ahora solo logging
    console.log(`Password reset requested for: ${email}`);
  }

  /**
   * Reset de contraseña con token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Validar token
    // TODO: Obtener userId del token
    // TODO: Actualizar contraseña

    throw new BadRequestException('Funcionalidad no implementada aún');
  }
}
