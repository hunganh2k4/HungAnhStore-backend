import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';

@Controller('variants')
export class VariantController {
  constructor(private readonly service: ProductService) {}

  // =============================
  // STOCK IN
  // =============================
  // @Post(':variantId/stock-in')
  // stockIn(
  //   @Param('variantId', ParseIntPipe) variantId: number,
  //   @Body('quantity') quantity: number,
  // ) {
  //   return this.service.stockIn(variantId, quantity);
  // }

  // // =============================
  // // STOCK OUT
  // // =============================
  // @Post(':variantId/stock-out')
  // stockOut(
  //   @Param('variantId', ParseIntPipe) variantId: number,
  //   @Body('quantity') quantity: number,
  // ) {
  //   return this.service.stockOut(variantId, quantity);
  // }
}