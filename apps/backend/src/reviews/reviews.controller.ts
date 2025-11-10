import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  @Get()
  findAll() {
    return { message: 'Reviews endpoint - To be implemented' };
  }

  @Post()
  create() {
    return { message: 'Create review - To be implemented' };
  }
}
