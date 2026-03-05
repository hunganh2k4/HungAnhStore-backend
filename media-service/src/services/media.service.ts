import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class MediaService {

  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadMany(files: Express.Multer.File[]) {

    const result: {
        url: string;
        publicId: string;
        type?: string;
      }[] = [];

    for (const file of files) {

      const uploaded =
        await this.cloudinaryService.uploadFile(file);

      result.push(uploaded as any);
    }

    return result;
  }

  async moveToReview(publicIds: string[]) {

    const result: {
      url: string;
      publicId: string;
      type?: string;
    }[] = [];

    for (const id of publicIds) {

      const moved =
        await this.cloudinaryService.moveFromTemp(id);

      result.push(moved);
    }

    return result;
  }

  async delete(publicId: string) {
    return this.cloudinaryService.delete(publicId);
  }
}