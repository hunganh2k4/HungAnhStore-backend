import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('trending')
  getTrending() {
    return this.recommendationService.getTrending();
  }

  @Get('similar/:productLineId')
  getSimilar(
    @Param('productLineId') productLineId: number,
  ) {
    return this.recommendationService.getSimilar(productLineId);
  }

  @Get('user/:userId')
  getForUser(@Param('userId') userId: string) {
    return this.recommendationService.getForUser(userId);
  }
}
