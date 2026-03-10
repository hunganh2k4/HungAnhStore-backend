import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  Delete,
  Param
} from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    const token = req.headers.authorization;
    return this.cartService.getCart(token);
  }

  @Post('items')
  addItem(@Req() req, @Body() body) {
    const token = req.headers.authorization;
    return this.cartService.addItem(token, body);
  }

  @Delete('items/:id')
  removeItem(@Req() req, @Param('id') id: number) {
    const token = req.headers.authorization;
    return this.cartService.removeItem(token, id);
  }
}