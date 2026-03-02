import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { PaymentMethod } from './entities/order.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // CREATE ORDER
  @Post()
  create(@Body() body: {
    items: {
      productId: number;
      quantity: number;
      price: number;
    }[];
    paymentMethod: PaymentMethod;
  }) {
    return this.orderService.create(body);
  }

  // CANCEL ORDER
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.orderService.cancel(id);
  }

  // MARK SHIPPING (nhân viên set)
  @Patch(':id/ship')
  async ship(@Param('id') id: string) {
    return this.orderService.markAsShipping(id);
  }

  // MARK DELIVERED
  @Patch(':id/deliver')
  async deliver(@Param('id') id: string) {
    return this.orderService.markAsDelivered(id);
  }
}