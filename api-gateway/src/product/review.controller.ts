import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  createReview(@Body() body: any, @Req() req: any) {
    const user = req.user;

    const reviewData = {
      ...body,
      userId: user.id || user.userId,
      userName: user.name,
      userAvatar: user.avatar,
    };

    return this.reviewService.createReview(reviewData);
  }

  @Get('/product-line/:productLineId')
  getReviews(@Param('productLineId', ParseIntPipe) productLineId: number) {
    return this.reviewService.getReviews(productLineId);
  }
}
