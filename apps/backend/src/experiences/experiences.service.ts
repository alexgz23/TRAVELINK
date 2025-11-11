import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ExperienceCategory, Difficulty } from '@prisma/client';

@Injectable()
export class ExperiencesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    category?: ExperienceCategory;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    difficulty?: Difficulty;
    limit?: number;
  }) {
    const where: any = { isActive: true };

    if (filters?.category) where.category = filters.category;
    if (filters?.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters?.difficulty) where.difficulty = filters.difficulty;
    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    return this.prisma.experience.findMany({
      where,
      take: filters?.limit || 100,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.experience.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            phone: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async create(providerId: string, data: any) {
    return this.prisma.experience.create({
      data: {
        ...data,
        providerId,
        slug: this.generateSlug(data.title),
      },
    });
  }

  async update(id: string, providerId: string, data: any) {
    return this.prisma.experience.update({
      where: { id, providerId },
      data,
    });
  }

  async remove(id: string, providerId: string) {
    return this.prisma.experience.update({
      where: { id, providerId },
      data: { isActive: false },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
