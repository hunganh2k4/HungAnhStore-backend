import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderConsumer } from './kafka/order.consumer';
import { kafkaProducerProvider } from './kafka/kafka.producer.provider';
import { kafkaConsumerProvider } from './kafka/kafka.consumer.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  providers: [OrderService,kafkaProducerProvider],
  controllers: [OrderController, OrderConsumer],
  exports: [OrderService],
})
export class OrderModule {}