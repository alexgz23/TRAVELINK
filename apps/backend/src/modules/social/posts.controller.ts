import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { FollowsService } from './follows.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, FilterPostDto } from './dto';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';
import { User } from '@/modules/users/entities';
import { LikeableType } from './schemas';

@ApiTags('social/posts')
@Controller('social/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly followsService: FollowsService,
  ) {}

  // ========== Posts ==========

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo post' })
  @ApiResponse({ status: 201, description: 'Post creado exitosamente' })
  create(@CurrentUser() user: User, @Body() createDto: CreatePostDto) {
    return this.postsService.create(user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener posts públicos' })
  @ApiResponse({ status: 200, description: 'Lista de posts' })
  findAll(@Query() filters: FilterPostDto) {
    return this.postsService.findAll(filters);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi feed (posts de usuarios que sigo)' })
  @ApiResponse({ status: 200, description: 'Feed personalizado' })
  async getFeed(@CurrentUser() user: User, @Query() filters: FilterPostDto) {
    const followingIds = await this.followsService.getFollowingIds(user.id);
    return this.postsService.getFeed(user.id, followingIds, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener post por ID' })
  @ApiResponse({ status: 200, description: 'Post encontrado' })
  @ApiResponse({ status: 404, description: 'Post no encontrado' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar post' })
  @ApiResponse({ status: 200, description: 'Post actualizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() updateDto: UpdatePostDto) {
    return this.postsService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar post' })
  @ApiResponse({ status: 204, description: 'Post eliminado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.postsService.remove(id, user.id);
  }

  // ========== Comentarios ==========

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar comentario a un post' })
  @ApiResponse({ status: 201, description: 'Comentario agregado' })
  addComment(
    @Param('id') postId: string,
    @CurrentUser() user: User,
    @Body() createDto: CreateCommentDto,
  ) {
    return this.postsService.addComment(postId, user.id, createDto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Obtener comentarios de un post' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios' })
  getComments(
    @Param('id') postId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getComments(postId, page, limit);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar comentario' })
  @ApiResponse({ status: 204, description: 'Comentario eliminado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  removeComment(@Param('commentId') commentId: string, @CurrentUser() user: User) {
    return this.postsService.removeComment(commentId, user.id);
  }

  // ========== Likes ==========

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dar like a un post' })
  @ApiResponse({ status: 201, description: 'Like agregado' })
  likePost(@Param('id') postId: string, @CurrentUser() user: User) {
    return this.postsService.like(user.id, postId, LikeableType.POST);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quitar like de un post' })
  @ApiResponse({ status: 204, description: 'Like eliminado' })
  unlikePost(@Param('id') postId: string, @CurrentUser() user: User) {
    return this.postsService.unlike(user.id, postId, LikeableType.POST);
  }

  @Get(':id/likes')
  @ApiOperation({ summary: 'Obtener usuarios que dieron like' })
  @ApiResponse({ status: 200, description: 'Lista de likes' })
  getLikes(
    @Param('id') postId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getLikes(postId, LikeableType.POST, page, limit);
  }

  @Post('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dar like a un comentario' })
  @ApiResponse({ status: 201, description: 'Like agregado' })
  likeComment(@Param('commentId') commentId: string, @CurrentUser() user: User) {
    return this.postsService.like(user.id, commentId, LikeableType.COMMENT);
  }

  @Delete('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quitar like de un comentario' })
  @ApiResponse({ status: 204, description: 'Like eliminado' })
  unlikeComment(@Param('commentId') commentId: string, @CurrentUser() user: User) {
    return this.postsService.unlike(user.id, commentId, LikeableType.COMMENT);
  }
}
