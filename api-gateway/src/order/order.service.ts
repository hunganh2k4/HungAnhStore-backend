import {
  Injectable,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  private readonly orderUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.orderUrl = this.config.get<string>('ORDER_SERVICE_URL')!;
  }

  // CREATE ORDER
  async create(body: any, authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.orderUrl}/orders`, body, {
          headers: {
            Authorization: authHeader,
          },
        }),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // CANCEL ORDER
  async cancel(id: string, authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.patch(
          `${this.orderUrl}/orders/${id}/cancel`,
          {},
          {
            headers: {
              Authorization: authHeader,
            },
          },
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // MARK SHIPPING
  async markAsShipping(id: string, authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.patch(
          `${this.orderUrl}/orders/${id}/ship`,
          {},
          {
            headers: {
              Authorization: authHeader,
            },
          },
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // MARK DELIVERED
  async markAsDelivered(id: string, authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.patch(
          `${this.orderUrl}/orders/${id}/deliver`,
          {},
          {
            headers: {
              Authorization: authHeader,
            },
          },
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // GET MY ORDERS
  async getMyOrders(authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.orderUrl}/orders/my-orders`, {
          headers: {
            Authorization: authHeader,
          },
        }),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // GET ORDER DETAIL
  async getDetail(id: string, authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.orderUrl}/orders/${id}`, {
          headers: {
            Authorization: authHeader,
          },
        }),
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
      'Order service is unavailable',
    );
  }
}