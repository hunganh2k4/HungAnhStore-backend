import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product-lines')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAll() {
    return this.productService.findAllProductLines();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.productService.findOneProductLine(id);
  }
}