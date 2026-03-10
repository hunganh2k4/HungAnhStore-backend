import {
  Injectable,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CartService {
  private readonly cartUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.cartUrl =
      this.config.get<string>('CART_SERVICE_URL')!;
  }

  // GET CART
  async getCart(token: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.cartUrl}/cart`, {
          headers: { Authorization: token },
        }),
      );

      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // ADD ITEM
  async addItem(token: string, body: any) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.cartUrl}/cart/items`, body, {
          headers: { Authorization: token },
        }),
      );

      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // REMOVE ITEM
  async removeItem(token: string, id: number) {
    try {
      const res = await firstValueFrom(
        this.http.delete(
          `${this.cartUrl}/cart/items/${id}`,
          {
            headers: { Authorization: token },
          },
        ),
      );

      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.response) {
      throw new HttpException(
        error.response.data,
        error.response.status,
      );
    }

    throw new ServiceUnavailableException(
      'Cart service is unavailable',
    );
  }
}