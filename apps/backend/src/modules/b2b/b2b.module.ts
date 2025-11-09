import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { B2BService } from './b2b.service';
import { B2BController } from './b2b.controller';
import { Alliance, AllianceContract, AllianceTransaction } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alliance, AllianceContract, AllianceTransaction]),
  ],
  controllers: [B2BController],
  providers: [B2BService],
  exports: [B2BService],
})
export class B2BModule {}
