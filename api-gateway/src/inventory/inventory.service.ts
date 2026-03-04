import {
  Injectable,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InventoryService {
  private readonly inventoryUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.inventoryUrl =
      this.config.get<string>('INVENTORY_SERVICE_URL') ||
      'http://localhost:4003';
  }

  // STOCK IN
  async stockIn(body: any) {
    try {
      const res = await firstValueFrom(
        this.http.post(
          `${this.inventoryUrl}/inventory/stock-in`,
          body,
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // GET BULK STOCK
  async getStockBulk(productIds: number[]) {
    try {
      const res = await firstValueFrom(
        this.http.get(
          `${this.inventoryUrl}/inventory/bulk`,
          {
            params: {
              ids: productIds.join(','),
            },
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
      'Inventory service is unavailable',
    );
  }
}