import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { StockMovement } from './entities/stock-movement.entity';
import { InventoryConsumer } from './kafka/inventory.consumer';
import { kafkaProducerProvider } from './kafka/kafka.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,StockMovement
    ]),
  ],
  controllers: [InventoryController,InventoryConsumer],
  providers: [InventoryService, kafkaProducerProvider],
  exports: [InventoryService], 
})
export class InventoryModule {}