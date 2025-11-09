import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';
import { User } from '@/modules/users/entities';

@ApiTags('social/follows')
@Controller('social/follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Seguir a un usuario' })
  @ApiResponse({ status: 201, description: 'Ahora sigues a este usuario' })
  @ApiResponse({ status: 400, description: 'No puedes seguirte a ti mismo' })
  follow(@CurrentUser() user: User, @Param('userId') followingId: string) {
    return this.followsService.follow(user.id, followingId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dejar de seguir a un usuario' })
  @ApiResponse({ status: 204, description: 'Ya no sigues a este usuario' })
  @ApiResponse({ status: 404, description: 'No estás siguiendo a este usuario' })
  unfollow(@CurrentUser() user: User, @Param('userId') followingId: string) {
    return this.followsService.unfollow(user.id, followingId);
  }

  @Get('following')
  @ApiOperation({ summary: 'Obtener usuarios que sigo' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios que sigo' })
  getFollowing(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.followsService.getFollowing(user.id, page, limit);
  }

  @Get('followers')
  @ApiOperation({ summary: 'Obtener mis seguidores' })
  @ApiResponse({ status: 200, description: 'Lista de mis seguidores' })
  getFollowers(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.followsService.getFollowers(user.id, page, limit);
  }

  @Get('counts')
  @ApiOperation({ summary: 'Obtener contadores de seguidos/seguidores' })
  @ApiResponse({ status: 200, description: 'Contadores' })
  getCounts(@CurrentUser() user: User) {
    return this.followsService.getCounts(user.id);
  }

  @Get('is-following/:userId')
  @ApiOperation({ summary: 'Verificar si sigo a un usuario' })
  @ApiResponse({ status: 200, description: 'true o false' })
  isFollowing(@CurrentUser() user: User, @Param('userId') followingId: string) {
    return this.followsService.isFollowing(user.id, followingId);
  }
}
