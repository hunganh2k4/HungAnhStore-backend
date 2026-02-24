import {
  Injectable,
  ServiceUnavailableException,
  HttpException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductService {
  private readonly productUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.productUrl =
      this.configService.get<string>('PRODUCT_SERVICE_URL')!;
  }

  async findAll() {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.productUrl}/products`),
      );
      return res.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.productUrl}/products/${id}`),
      );
      return res.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.response){
      throw new HttpException(error.response.data, error.response.status);
    }
    throw new ServiceUnavailableException('Product service is unavailable');
  }
}