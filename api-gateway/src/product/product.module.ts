import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ReviewController } from './review.controller';
import { ProductService } from './product.service';
import { ReviewService } from './review.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ProductController, ReviewController],
  providers: [ProductService, ReviewService],
})
export class ProductModule { }