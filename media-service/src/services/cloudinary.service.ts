import { Injectable, Inject } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class CloudinaryService {

  constructor(
    @Inject('CLOUDINARY')
    private cloudinary: typeof Cloudinary,
  ) {}

  async uploadFile(file: Express.Multer.File) {

    return new Promise((resolve, reject) => {

      this.cloudinary.uploader
        .upload_stream(
          {
            folder: 'hastore/temp',
          },
          (error, result) => {

            if (error || !result) {
              return reject(error);
            }

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              type: result.resource_type,
            });
          },
        )
        .end(file.buffer);
    });
  }

  async moveFromTemp(publicId: string) {

    const newPublicId = publicId.replace(
      'hastore/temp',
      'hastore/used',
    );

    try {
      const result = await this.cloudinary.uploader.rename(
        publicId,
        newPublicId,
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };

    } catch (error) {

      if (error?.message?.includes('Resource not found')) {
        throw new NotFoundException(
          `Media ${publicId} not found in Cloudinary`,
        );
      }

      // lỗi khác
      throw new InternalServerErrorException(
        `Cloudinary error: ${error.message}`,
      );
    }
  }

  async delete(publicId: string) {

    return this.cloudinary.uploader.destroy(publicId);
  }
}