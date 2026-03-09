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

import { ProductService } from '../services/product.service';

@Controller('product-lines')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  // CREATE ONE PRODUCT LINE
  @Post()
  createProductLine(@Body() body: any) {
    return this.service.createProductLine(body);
  }

  // GET ALL PRODUCT LINES
  @Get()
  findAllProductLine(@Query() query: any) {
    return this.service.findAllProductLine(query);
  }

  // GET ONE PRODUCT LINE
  @Get(':id')
  findOneProductLine(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneProductLine(id);
  }

  // UPDATE PRODUCT LINE
  @Put(':id')
  updateProductLine(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.service.updateProductLine(id, body);
  }

  // DELETE PRODUCT LINE
  @Delete(':id')
  removeProductLine(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeProductLine(id);
  }


  // ADD ONE PRODUCT TO PRODUCT LINE
  @Post(':id/products')
  addProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.service.addProduct(id, body);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findProductLineBySlug(slug);
  }
}