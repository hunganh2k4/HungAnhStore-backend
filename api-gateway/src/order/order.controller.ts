import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Headers,
} from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // CREATE ORDER
  @Post()
  create(
    @Body() body: {
      items: {
        productId: number;
        quantity: number;
        price: number;
      }[];
      paymentMethod: string;
    },
    @Headers('authorization') authHeader: string,
  ) {
    return this.orderService.create(body, authHeader);
  }

  // CANCEL ORDER
  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.orderService.cancel(id, authHeader);
  }

  // MARK SHIPPING
  @Patch(':id/ship')
  ship(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.orderService.markAsShipping(id, authHeader);
  }

  // MARK DELIVERED
  @Patch(':id/deliver')
  deliver(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.orderService.markAsDelivered(id, authHeader);
  }

  // GET MY ORDERS
  @Get('my-orders')
  getMyOrders(@Headers('authorization') authHeader: string) {
    return this.orderService.getMyOrders(authHeader);
  }

  // GET ORDER DETAIL
  @Get(':id')
  getDetail(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.orderService.getDetail(id, authHeader);
  }
}