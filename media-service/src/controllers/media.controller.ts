import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Delete,
  Param,
} from '@nestjs/common';

import {
  FilesInterceptor,
} from '@nestjs/platform-express';

import { MediaService } from '../services/media.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.mediaService.uploadMany(files);
  }

  @Delete(':publicId')
  async delete(@Param('publicId') publicId: string) {
    return this.mediaService.delete(publicId);
  }
}