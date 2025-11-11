import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  UpdateExtendedProfileDto,
  UpdatePrivacyDto,
} from './dto';

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
        level: true,
        isEmailVerified: true,
        preferences: true,
        bio: true,
        country: true,
        city: true,
        languages: true,
        travelStyle: true,
        budgetRange: true,
        dreamDestinations: true,
        countriesVisited: true,
        citiesVisited: true,
        totalTrips: true,
        isProfilePublic: true,
        showMap: true,
        showTrips: true,
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
        level: true,
        preferences: true,
      },
    });
  }

  /**
   * Update extended profile (bio, travel preferences, etc.)
   */
  async updateExtendedProfile(
    userId: string,
    data: UpdateExtendedProfileDto,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        bio: true,
        country: true,
        city: true,
        languages: true,
        travelStyle: true,
        budgetRange: true,
        dreamDestinations: true,
      },
    });
  }

  /**
   * Update privacy settings
   */
  async updatePrivacy(userId: string, data: UpdatePrivacyDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        isProfilePublic: true,
        showMap: true,
        showTrips: true,
      },
    });
  }

  /**
   * Get comprehensive user stats
   */
  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalTrips: true,
        countriesVisited: true,
        citiesVisited: true,
        points: true,
        level: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get detailed counts
    const [
      totalBookings,
      completedBookings,
      activeBookings,
      reviewsCount,
      postsCount,
      experiencesSaved,
    ] = await Promise.all([
      this.prisma.booking.count({ where: { userId } }),
      this.prisma.booking.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.booking.count({
        where: {
          userId,
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.review.count({ where: { userId } }),
      this.prisma.post.count({ where: { userId } }),
      // Assuming there's a favorites/saved experiences feature
      0, // Placeholder
    ]);

    // Get upcoming trip
    const upcomingTrip = await this.prisma.booking.findFirst({
      where: {
        userId,
        startDate: { gte: new Date() },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      orderBy: { startDate: 'asc' },
      include: {
        experience: {
          select: {
            title: true,
            city: true,
            country: true,
            images: true,
          },
        },
      },
    });

    return {
      totalTrips: user.totalTrips,
      totalBookings,
      completedBookings,
      activeBookings,
      countriesVisited: user.countriesVisited.length,
      citiesVisited: user.citiesVisited.length,
      reviewsCount,
      postsCount,
      experiencesSaved,
      points: user.points,
      level: user.level,
      memberSince: user.createdAt,
      upcomingTrip,
    };
  }

  /**
   * Get user's travel map data
   */
  async getUserMap(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        countriesVisited: true,
        citiesVisited: true,
        showMap: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.showMap) {
      return {
        available: false,
        message: 'User has disabled map visibility',
      };
    }

    // Get bookings with location data
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        experience: {
          select: {
            city: true,
            country: true,
            latitude: true,
            longitude: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    // Build map data
    const visitedLocations = bookings.map((booking) => ({
      city: booking.experience.city,
      country: booking.experience.country,
      latitude: booking.experience.latitude,
      longitude: booking.experience.longitude,
      experienceTitle: booking.experience.title,
      visitedAt: booking.completedAt,
      image: booking.experience.images?.[0],
    }));

    return {
      available: true,
      countriesVisited: user.countriesVisited,
      citiesVisited: user.citiesVisited,
      totalCountries: user.countriesVisited.length,
      totalCities: user.citiesVisited.length,
      locations: visitedLocations,
    };
  }

  /**
   * Add visited location (called after booking completion)
   */
  async addVisitedLocation(userId: string, country: string, city: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        countriesVisited: true,
        citiesVisited: true,
        totalTrips: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const countriesVisited = user.countriesVisited.includes(country)
      ? user.countriesVisited
      : [...user.countriesVisited, country];

    const citiesVisited = user.citiesVisited.includes(city)
      ? user.citiesVisited
      : [...user.citiesVisited, city];

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        countriesVisited,
        citiesVisited,
        totalTrips: { increment: 1 },
      },
    });
  }
}
