import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking, BookingTraveler } from './entities';
import { ExperiencesModule } from '../experiences/experiences.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingTraveler]), ExperiencesModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
