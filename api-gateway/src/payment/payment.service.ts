import {
  Injectable,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
  private readonly paymentUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.paymentUrl =
      this.config.get<string>('PAYMENT_SERVICE_URL')!;
  }

  async getPaymentUrl(orderId: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.paymentUrl}/payment/${orderId}/url`),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getStatus(orderId: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.paymentUrl}/payment/${orderId}/status`),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async vnpayReturn(query: any) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.paymentUrl}/payment/vnpay/return`, { params: query }),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async vnpayIpn(payload: any) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.paymentUrl}/payment/vnpay/ipn`, payload),
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
      'Payment service is unavailable',
    );
  }
}
