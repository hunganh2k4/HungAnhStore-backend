import { Injectable, Inject } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private cloudinary: typeof Cloudinary,
  ) {}

  async uploadFile(file: Express.Multer.File) {
    const resourceType = file.mimetype.startsWith('video')
      ? 'video'
      : 'image';

    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          {
            resource_type: resourceType,
            folder: 'hastore',
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Upload failed'));
            }

            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              type: resourceType,
            });
          },
        )
        .end(file.buffer);
    });
  }

  async deleteFile(publicId: string) {
    return this.cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  }
}