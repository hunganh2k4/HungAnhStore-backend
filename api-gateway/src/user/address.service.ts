import {
  Injectable,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AddressService {
  private readonly userUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.userUrl =
      this.config.get<string>('USER_SERVICE_URL')!;
  }

  // CREATE
  async createAddress(authHeader: string, body: any) {
    try {
      const res = await firstValueFrom(
        this.http.post(
          `${this.userUrl}/addresses`,
          body,
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

  // GET ALL
  async getAddresses(authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(
          `${this.userUrl}/addresses`,
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

  // UPDATE
  async updateAddress(
    authHeader: string,
    addressId: string,
    body: any,
  ) {
    try {
      const res = await firstValueFrom(
        this.http.put(
          `${this.userUrl}/addresses/${addressId}`,
          body,
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

  // DELETE
  async deleteAddress(authHeader: string, addressId: string) {
    try {
      const res = await firstValueFrom(
        this.http.delete(
          `${this.userUrl}/addresses/${addressId}`,
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

  // SET DEFAULT
  async setDefaultAddress(authHeader: string, addressId: string) {
    try {
      const res = await firstValueFrom(
        this.http.post(
          `${this.userUrl}/addresses/${addressId}/default`,
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

  // GET DEFAULT
  async getDefaultAddress(authHeader: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(
          `${this.userUrl}/addresses/default`,
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

  private handleError(error: any): never {
    if (error.response) {
      throw new HttpException(
        error.response.data,
        error.response.status,
      );
    }

    throw new ServiceUnavailableException(
      'User service is unavailable',
    );
  }
}