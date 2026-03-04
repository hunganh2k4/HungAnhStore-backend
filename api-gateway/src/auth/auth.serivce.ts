import {
  Injectable,
  ServiceUnavailableException,
  HttpException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly authUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authUrl =
      this.configService.get<string>('AUTH_SERVICE_URL')!;
  }

  async register(body: any) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.authUrl}/auth/register`, body),
      );
      return res.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(body: any) {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.authUrl}/auth/login`, body, {
          withCredentials: true,
        }),
      );

      const rawCookies = response.headers['set-cookie'];

      let cookies: string[] | undefined;

      if (Array.isArray(rawCookies)) {
        cookies = rawCookies;
      }

      return {
        data: response.data,
        cookies,
      };

    } catch (error) {
      this.handleError(error);
    }
  }

  async refresh(cookie: string) {
    try {
      const res = await firstValueFrom(
        this.http.post(
          `${this.authUrl}/auth/refresh`,
          {},
          {
            headers: {
              Cookie: cookie, 
            },
          },
        ),
      );

      return res.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(token: string) {
    try {
      const res = await firstValueFrom(
        this.http.post(
          `${this.authUrl}/auth/logout`,
          {},
          {
            headers: {
              Authorization: token,
            },
          },
        ),
      );
      return res.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async validate(token: string) {
    try {
      const res = await firstValueFrom(
        this.http.post(
          `${this.authUrl}/auth/validate`,
          {},
          {
            headers: {
              Authorization: token,
            },
          },
        ),
      );
      return res.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async verify(token: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.authUrl}/auth/verify`, {
          params: { token },
        }),
      );

      return res.data;
    } catch (error) {
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
      'Auth service is unavailable',
    );
  }
}