import { Controller, Post, Body } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('stock-in')
  stockIn(@Body() body: any) {
    return this.inventoryService.stockIn(
      body.productId,
      body.quantity,
      body.reference,
    );
  }
}