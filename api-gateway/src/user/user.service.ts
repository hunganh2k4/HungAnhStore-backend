import {
  Injectable,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  private readonly userUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.userUrl =
      this.config.get<string>('USER_SERVICE_URL')!;
  }

  // CREATE USER
  async createUser(body: any) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.userUrl}/internal/users`, body),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // PUBLIC USER INFO
  async findByEmail(email: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(
          `${this.userUrl}/internal/users/email/${email}`,
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // RAW USER (for Auth login)
  async findRawByEmail(email: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(
          `${this.userUrl}/internal/users/raw/${email}`,
        ),
      );
      return res.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // ENABLE USER
  async enableUser(id: string) {
    try {
      const res = await firstValueFrom(
        this.http.put(
          `${this.userUrl}/internal/users/${id}/enable`,
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