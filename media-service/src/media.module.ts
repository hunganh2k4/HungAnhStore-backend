import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.service';
import { CloudinaryService } from './services/cloudinary.service';
import { CloudinaryProvider } from './config/cloudinary.config';

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    CloudinaryService,
    CloudinaryProvider,
  ],
})
export class MediaModule {}