import {
  Injectable,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class MediaService {
  private readonly mediaUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.mediaUrl = this.config.get<string>('MEDIA_SERVICE_URL')!;
  }

  async uploadMany(files: Express.Multer.File[]) {
    try {
      const form = new FormData();
      for (const file of files) {
        form.append('files', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      }

      const res = await firstValueFrom(
        this.http.post(`${this.mediaUrl}/media/upload`, form, {
          headers: {
            ...form.getHeaders(),
          },
        }),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async confirmReview(body: { publicIds: string[] }) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.mediaUrl}/media/confirm-review`, body),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async delete(publicId: string) {
    try {
      const res = await firstValueFrom(
        this.http.delete(`${this.mediaUrl}/media/${publicId}`),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.response) {
      throw new HttpException(error.response.data, error.response.status);
    }
    throw new ServiceUnavailableException('Media service is unavailable');
  }
}
