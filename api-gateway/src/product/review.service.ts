import {
    Injectable,
    HttpException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReviewService {
    private readonly productUrl: string;

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
    ) {
        this.productUrl =
            this.config.get<string>('PRODUCT_SERVICE_URL')!;
    }

    // REVIEWS
    async createReview(body: any) {
        try {
            const res = await firstValueFrom(
                this.http.post(`${this.productUrl}/reviews`, body),
            );
            return res.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getReviews(productLineId: number) {
        try {
            const res = await firstValueFrom(
                this.http.get(`${this.productUrl}/reviews/product-line/${productLineId}`),
            );
            return res.data;
        } catch (error: any) {
            this.handleError(error);
        }
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