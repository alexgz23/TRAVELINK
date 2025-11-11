import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UpdateExtendedProfileDto, UpdatePrivacyDto } from './dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  getProfile(@GetUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update basic user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  updateProfile(@GetUser('id') userId: string, @Body() data: any) {
    return this.usersService.updateProfile(userId, data);
  }

  @Put('profile/extended')
  @ApiOperation({ summary: 'Update extended profile (bio, travel preferences)' })
  @ApiResponse({
    status: 200,
    description: 'Extended profile updated successfully',
  })
  updateExtendedProfile(
    @GetUser('id') userId: string,
    @Body() data: UpdateExtendedProfileDto,
  ) {
    return this.usersService.updateExtendedProfile(userId, data);
  }

  @Put('privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  @ApiResponse({
    status: 200,
    description: 'Privacy settings updated successfully',
  })
  updatePrivacy(
    @GetUser('id') userId: string,
    @Body() data: UpdatePrivacyDto,
  ) {
    return this.usersService.updatePrivacy(userId, data);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get comprehensive user statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        totalTrips: 12,
        totalBookings: 15,
        completedBookings: 12,
        activeBookings: 3,
        countriesVisited: 8,
        citiesVisited: 24,
        reviewsCount: 10,
        postsCount: 25,
        experiencesSaved: 5,
        points: 1250,
        level: 'WALKER',
        memberSince: '2024-01-15T00:00:00.000Z',
        upcomingTrip: {
          id: 'booking123',
          startDate: '2024-12-25T00:00:00.000Z',
          experience: {
            title: 'Tour por Guatapé',
            city: 'Guatapé',
            country: 'Colombia',
          },
        },
      },
    },
  })
  getStats(@GetUser('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Get(':id/map')
  @ApiOperation({ summary: 'Get user travel map' })
  @ApiResponse({
    status: 200,
    description: 'Travel map retrieved successfully',
  })
  getUserMap(@Param('id') id: string) {
    return this.usersService.getUserMap(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
