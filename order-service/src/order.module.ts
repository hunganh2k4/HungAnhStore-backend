import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderConsumer } from './kafka/order.consumer';
import { kafkaProducerProvider } from './kafka/kafka.producer.provider';
import { kafkaConsumerProvider } from './kafka/kafka.consumer.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrderService, OrderConsumer, kafkaConsumerProvider, kafkaProducerProvider],
  controllers: [OrderController],
})
export class OrderModule {}