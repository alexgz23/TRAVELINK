import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  @Get()
  findAll() {
    return { message: 'Posts endpoint - To be implemented' };
  }

  @Post()
  create() {
    return { message: 'Create post - To be implemented' };
  }
}
