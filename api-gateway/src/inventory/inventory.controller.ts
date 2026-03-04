import {
  Controller,
  Post,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Post('stock-in')
  stockIn(@Body() body: any) {
    return this.inventoryService.stockIn(body);
  }

  @Get('bulk')
  getStockBulk(@Query('ids') ids: string) {
    const productIds = ids.split(',').map(Number);
    return this.inventoryService.getStockBulk(productIds);
  }
}