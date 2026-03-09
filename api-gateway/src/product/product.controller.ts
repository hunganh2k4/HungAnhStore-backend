import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product-lines')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // CREATE PRODUCT LINE
  @Post()
  create(@Body() body: any) {
    return this.productService.createProductLine(body);
  }

  // GET ALL PRODUCT LINES
  @Get()
  findAll(@Query() query: any) {
    return this.productService.findAllProductLine(query);
  }

  
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  // GET ONE PRODUCT LINE
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOneProductLine(id);
  }

  // UPDATE PRODUCT LINE
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.productService.updateProductLine(id, body);
  }

  // DELETE PRODUCT LINE
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.removeProductLine(id);
  }

  // ADD PRODUCT TO PRODUCT LINE
  @Post(':id/products')
  addProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.productService.addProduct(id, body);
  }

}