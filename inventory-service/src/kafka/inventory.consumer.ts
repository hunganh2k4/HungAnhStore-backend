import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoryService } from '../services/inventory.service';

@Controller()
export class InventoryConsumer {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() data: any) {
    console.log('Received order.created event:', data);
    await this.inventoryService.handleReserve(data);
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(@Payload() data: any) {
    await this.inventoryService.handleRelease(data);
  }

  @EventPattern('order.shipped')
  async handleOrderShipped(@Payload() data: any) {
    await this.inventoryService.handleConfirm(data);
  }
}