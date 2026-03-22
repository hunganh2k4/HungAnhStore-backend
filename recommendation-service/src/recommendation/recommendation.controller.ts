import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) { }

  @Get('trending')
  getTrending() {
    return this.recommendationService.getTrendingProducts();
  }

  @Get('similar/:productLineId')
  getSimilar(
    @Param('productLineId') productLineId: number,
  ) {
    return this.recommendationService.getSimilarProducts(productLineId);
  }

  @Get('user/:userId')
  getRecommendedForUser(@Param('userId') userId: string) {
    return this.recommendationService.getRecommendedForUser(userId);
  }
}
