import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';


@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  // CREATE ORDER
  @Post()
  create(@Body() body: {
    items: {
      productId: number;
      quantity: number;
      price: number;
    }[];
    paymentMethod: String;
  }) {
    return this.orderService.create(body);
  }

  // CANCEL ORDER
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.orderService.cancel(id);
  }

  // MARK SHIPPING
  @Patch(':id/ship')
  ship(@Param('id') id: string) {
    return this.orderService.markAsShipping(id);
  }

  // MARK DELIVERED
  @Patch(':id/deliver')
  deliver(@Param('id') id: string) {
    return this.orderService.markAsDelivered(id);
  }
}