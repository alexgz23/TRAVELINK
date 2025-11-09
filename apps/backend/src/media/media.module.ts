import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { StorageService } from './storage.service';
import { ImageProcessingProcessor } from './processors/image-processing.processor';
import { QueueName } from '../queues/constants';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Media]),
    BullModule.registerQueue({
      name: QueueName.IMAGE_PROCESSING,
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, StorageService, ImageProcessingProcessor],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
