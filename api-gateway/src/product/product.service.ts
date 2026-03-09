import {
  Injectable,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductService {
  private readonly productUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.productUrl =
      this.config.get<string>('PRODUCT_SERVICE_URL')!;
  }

  // CREATE
  async createProductLine(body: any) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.productUrl}/product-lines`, body),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // GET ALL
  async findAllProductLine(query: any) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.productUrl}/product-lines`, {
          params: query,
        }),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // GET ONE
  async findOneProductLine(id: number) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.productUrl}/product-lines/${id}`),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // UPDATE
  async updateProductLine(id: number, body: any) {
    try {
      const res = await firstValueFrom(
        this.http.put(
          `${this.productUrl}/product-lines/${id}`,
          body,
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // DELETE
  async removeProductLine(id: number) {
    try {
      const res = await firstValueFrom(
        this.http.delete(
          `${this.productUrl}/product-lines/${id}`,
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // ADD PRODUCT
  async addProduct(id: number, body: any) {
    try {
      const res = await firstValueFrom(
        this.http.post(
          `${this.productUrl}/product-lines/${id}/products`,
          body,
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async findBySlug(slug: string) {
    const response =  await firstValueFrom(
        this.http.get(
          `${this.productUrl}/product-lines/slug/${slug}`,
        ),
      );
    return response.data;
  }

  // SIMPLE ERROR HANDLER
  private handleError(error: any): never {
    if (error.response) {
      throw new HttpException(
        error.response.data,
        error.response.status,
      );
    }

    throw new ServiceUnavailableException(
      'Product service is unavailable',
    );
  }
}