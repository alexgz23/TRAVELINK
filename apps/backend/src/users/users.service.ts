import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        birthDate: true,
        points: true,
        isEmailVerified: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        avatar: data.avatar,
        preferences: data.preferences,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        birthDate: true,
        points: true,
        preferences: true,
      },
    });
  }

  async getUserStats(userId: string) {
    const [bookingsCount, reviewsCount, postsCount] = await Promise.all([
      this.prisma.booking.count({ where: { userId } }),
      this.prisma.review.count({ where: { userId } }),
      this.prisma.post.count({ where: { userId } }),
    ]);

    return {
      bookingsCount,
      reviewsCount,
      postsCount,
    };
  }
}
