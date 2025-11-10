import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  @Get()
  findAll() {
    return { message: 'Bookings endpoint - To be implemented' };
  }

  @Post()
  create() {
    return { message: 'Create booking - To be implemented' };
  }
}
