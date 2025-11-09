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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExperiencesService } from './experiences.service';
import {
  CreateExperienceDto,
  UpdateExperienceDto,
  FilterExperienceDto,
  CreateVariantDto,
  CreateMediaDto,
  CreateItineraryDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Public, Roles, CurrentUser, CacheKey, CacheTTL } from '@/common/decorators';
import { CacheInterceptor } from '@/common/interceptors/cache.interceptor';
import { UserRole } from '@viajero-conectado/types';
import { User } from '@/modules/users/entities';

@ApiTags('experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  // ========== Endpoints Públicos ==========

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('experiences:list')
  @CacheTTL(300) // 5 minutos
  @ApiOperation({ summary: 'Listar experiencias con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de experiencias' })
  findAll(@Query() filters: FilterExperienceDto) {
    return this.experiencesService.findAll(filters);
  }

  @Public()
  @Get('slug/:slug')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('experience:slug:{slug}')
  @CacheTTL(600) // 10 minutos
  @ApiOperation({ summary: 'Obtener experiencia por slug' })
  @ApiResponse({ status: 200, description: 'Experiencia encontrada' })
  @ApiResponse({ status: 404, description: 'Experiencia no encontrada' })
  findBySlug(@Param('slug') slug: string) {
    return this.experiencesService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('experience:{id}')
  @CacheTTL(600) // 10 minutos
  @ApiOperation({ summary: 'Obtener experiencia por ID' })
  @ApiResponse({ status: 200, description: 'Experiencia encontrada' })
  @ApiResponse({ status: 404, description: 'Experiencia no encontrada' })
  findOne(@Param('id') id: string) {
    return this.experiencesService.findOne(id);
  }

  // ========== Endpoints de Agencia ==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva experiencia' })
  @ApiResponse({ status: 201, description: 'Experiencia creada' })
  @ApiResponse({ status: 403, description: 'Solo agencias pueden crear experiencias' })
  create(@CurrentUser() user: User, @Body() createDto: CreateExperienceDto) {
    return this.experiencesService.create(user.id, createDto);
  }

  @Get('agency/my-experiences')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis experiencias' })
  findMyExperiences(@CurrentUser() user: User) {
    return this.experiencesService.findByAgency(user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar experiencia' })
  @ApiResponse({ status: 200, description: 'Experiencia actualizada' })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateDto: UpdateExperienceDto,
  ) {
    return this.experiencesService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar experiencia' })
  @ApiResponse({ status: 204, description: 'Experiencia eliminada' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.experiencesService.remove(id, user.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publicar experiencia' })
  @ApiResponse({ status: 200, description: 'Experiencia publicada' })
  publish(@Param('id') id: string, @CurrentUser() user: User) {
    return this.experiencesService.publish(id, user.id);
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pausar experiencia' })
  @ApiResponse({ status: 200, description: 'Experiencia pausada' })
  pause(@Param('id') id: string, @CurrentUser() user: User) {
    return this.experiencesService.pause(id, user.id);
  }

  // ========== Variantes ==========

  @Post(':id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar variante a experiencia' })
  addVariant(@Param('id') experienceId: string, @Body() createDto: CreateVariantDto) {
    return this.experiencesService.addVariant(experienceId, createDto);
  }

  @Patch('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar variante' })
  updateVariant(@Param('variantId') variantId: string, @Body() updateDto: Partial<CreateVariantDto>) {
    return this.experiencesService.updateVariant(variantId, updateDto);
  }

  @Delete('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar variante' })
  removeVariant(@Param('variantId') variantId: string) {
    return this.experiencesService.removeVariant(variantId);
  }

  // ========== Media ==========

  @Post(':id/media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar foto/video a experiencia' })
  addMedia(@Param('id') experienceId: string, @Body() createDto: CreateMediaDto) {
    return this.experiencesService.addMedia(experienceId, createDto);
  }

  @Delete('media/:mediaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar foto/video' })
  removeMedia(@Param('mediaId') mediaId: string) {
    return this.experiencesService.removeMedia(mediaId);
  }

  // ========== Itinerario ==========

  @Post(':id/itinerary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar día al itinerario' })
  addItinerary(@Param('id') experienceId: string, @Body() createDto: CreateItineraryDto) {
    return this.experiencesService.addItinerary(experienceId, createDto);
  }

  @Patch('itinerary/:itineraryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar día del itinerario' })
  updateItinerary(
    @Param('itineraryId') itineraryId: string,
    @Body() updateDto: Partial<CreateItineraryDto>,
  ) {
    return this.experiencesService.updateItinerary(itineraryId, updateDto);
  }

  @Delete('itinerary/:itineraryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCIA, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar día del itinerario' })
  removeItinerary(@Param('itineraryId') itineraryId: string) {
    return this.experiencesService.removeItinerary(itineraryId);
  }
}
