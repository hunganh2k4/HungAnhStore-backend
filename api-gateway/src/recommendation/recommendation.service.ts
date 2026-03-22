import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('RECOMMENDATION_SERVICE_URL') || 'http://localhost:4009';
  }

  async getTrending() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/recommendations/trending`),
    );
    return data;
  }

  async getSimilar(productLineId: number) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/recommendations/similar/${productLineId}`),
    );
    return data;
  }

  async getForUser(userId: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/recommendations/user/${userId}`),
    );
    return data;
  }
}
