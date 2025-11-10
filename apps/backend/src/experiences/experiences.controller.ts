import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExperiencesService } from './experiences.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(private experiencesService: ExperiencesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all experiences' })
  findAll(@Query() filters: any) {
    return this.experiencesService.findAll(filters);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get experience by ID' })
  findOne(@Param('id') id: string) {
    return this.experiencesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create experience' })
  create(@GetUser('id') userId: string, @Body() data: any) {
    return this.experiencesService.create(userId, data);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update experience' })
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.experiencesService.update(id, userId, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete experience' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.experiencesService.remove(id, userId);
  }
}
