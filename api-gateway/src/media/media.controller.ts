import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Delete,
  Param,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    return this.mediaService.uploadMany(files);
  }

  @Post('confirm-review')
  confirmReview(@Body() body: { publicIds: string[] }) {
    return this.mediaService.confirmReview(body);
  }

  @Delete(':publicId')
  delete(@Param('publicId') publicId: string) {
    return this.mediaService.delete(publicId);
  }
}
