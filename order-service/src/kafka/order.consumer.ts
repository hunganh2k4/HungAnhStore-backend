import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderService } from '../order.service';

@Controller()
export class OrderConsumer {
  constructor(private readonly orderService: OrderService) {}

  // ===== RESERVE SUCCESS =====
  @EventPattern('inventory.reserved')
  async handleInventoryReserved(@Payload() data: any) {
    await this.orderService.handleInventoryReserved(data);
  }

  // ===== RESERVE FAILED =====
  @EventPattern('inventory.reserve.failed')
  async handleReserveFailed(@Payload() data: any) {
    await this.orderService.handleReserveFailed(data);
  }

  // ===== CONFIRM SUCCESS =====
  @EventPattern('inventory.confirmed')
  async handleInventoryConfirmed(@Payload() data: any) {
    console.log('Received inventory.confirmed event:', data);
    await this.orderService.handleInventoryConfirmed(data);
  }

  // ===== CONFIRM FAILED =====
  @EventPattern('inventory.confirm.failed')
  async handleConfirmFailed(@Payload() data: any) {
    await this.orderService.handleConfirmFailed(data);
  }

  // ===== RELEASE FAILED =====
  @EventPattern('inventory.release.failed')
  async handleReleaseFailed(@Payload() data: any) {
    await this.orderService.handleReleaseFailed(data);
  }

  @EventPattern('payment.succeeded')
  async handlePaymentSuccess(@Payload() data: any) {
    console.log('Received payment success event:', data);
    await this.orderService.handlePaymentSuccess(data);
  }
  

  @EventPattern('payment.failed')
  async handlePaymentFailed(@Payload() data: any) {
    await this.orderService.handlePaymentFailed(data);
  }
}