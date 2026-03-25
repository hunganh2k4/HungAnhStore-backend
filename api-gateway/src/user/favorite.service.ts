import {
  Injectable,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FavoriteService {
  private readonly userUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.userUrl = this.config.get<string>('USER_SERVICE_URL')!;
  }

  async addFavorite(productId: number, authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.post(
          `${this.userUrl}/favorites`,
          { productId },
          { headers: { authorization: authHeader } },
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async removeFavorite(productId: number, authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.delete(`${this.userUrl}/favorites/${productId}`, {
          headers: { authorization: authHeader },
        }),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getMyFavorites(authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.userUrl}/favorites/my-favorites`, {
          headers: { authorization: authHeader },
        }),
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

    throw new ServiceUnavailableException('User service is unavailable');
  }
}
