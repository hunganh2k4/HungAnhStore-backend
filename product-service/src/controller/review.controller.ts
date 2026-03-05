import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { CreateReviewDto } from '../dto/create-review.dto';

@Controller('reviews')
export class ReviewController {

  constructor(
    private reviewService: ReviewService,
  ) {}

  @Post()
  async createReview(@Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(dto);
  }

  @Get(':productLineId')
  async getReviews(@Param('productLineId') id: number) {
    return this.reviewService.getReviews(id);
  }
}