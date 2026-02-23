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

@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  // CREATE
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  // GET ALL
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // UPDATE
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.service.update(id, body);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // STOCK IN
  @Post(':id/stock-in')
  stockIn(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
  ) {
    return this.service.stockIn(id, quantity);
  }

  // STOCK OUT
  @Post(':id/stock-out')
  stockOut(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
  ) {
    return this.service.stockOut(id, quantity);
  }
}