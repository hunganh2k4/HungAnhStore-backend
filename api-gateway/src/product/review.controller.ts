import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  createReview(@Body() body: any) {
    return this.productService.createReview(body);
  }

  @Get(':productLineId')
  getReviews(@Param('productLineId', ParseIntPipe) productLineId: number) {
    return this.productService.getReviews(productLineId);
  }
}
