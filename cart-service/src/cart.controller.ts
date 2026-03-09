import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  addItem(
    @Request() req,
    @Body() dto: AddCartItemDto,
  ) {
    console.log(req.user);
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: number) {
    return this.cartService.removeItem(id);
  }
}