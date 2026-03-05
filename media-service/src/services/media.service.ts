import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadMany(files: Express.Multer.File[]) {
    const uploads = files.map((file) =>
      this.cloudinaryService.uploadFile(file),
    );

    return Promise.all(uploads);
  }

  async delete(publicId: string) {
    return this.cloudinaryService.deleteFile(publicId);
  }
}