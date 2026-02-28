import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderService } from '../order.service';

@Controller()
export class OrderConsumer {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern('inventory.reserved')
  async handleInventoryReserved(@Payload() data: any) {
    await this.orderService.handleInventoryReserved(data);
  }

  @EventPattern('inventory.confirmed')
  async handleInventoryConfirmed(@Payload() data: any) {
    await this.orderService.handleInventoryConfirmed(data);
  }

  @EventPattern('payment.succeeded')
  async handlePaymentSuccess(@Payload() data: any) {
    await this.orderService.handlePaymentSuccess(data);
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(@Payload() data: any) {
    await this.orderService.handlePaymentFailed(data);
  }
}