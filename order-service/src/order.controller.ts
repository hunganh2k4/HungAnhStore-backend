import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Get,
  Req
} from '@nestjs/common';
import { OrderService } from './order.service';
import { PaymentMethod } from './entities/order.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';


@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // CREATE ORDER
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: {
    items: {
      productId: number;
      quantity: number;
      price: number;
    }[];
    paymentMethod: PaymentMethod;
  }, @CurrentUser() user: { userId: string }) {
    return this.orderService.create({ ...body, userId: user.userId });
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

  // ================================
  // GET ALL ORDERS OF USER
  // ================================
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(@CurrentUser() user: { userId: string }) {
    return this.orderService.getOrdersByUser(user.userId);
  }

  // ================================
  // GET ORDER DETAIL
  // ================================
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getDetail(@Param('id') id: string, @Req() req: any) {
    const user = req.user;

    return this.orderService.getOrderDetail(id, user.userId);
  }
}