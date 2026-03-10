import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderConsumer } from './kafka/order.consumer';
import { kafkaProducerProvider } from './kafka/kafka.producer.provider';
import { kafkaConsumerProvider } from './kafka/kafka.consumer.provider';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [OrderService,kafkaProducerProvider, JwtStrategy, JwtAuthGuard],
  controllers: [OrderController, OrderConsumer],
  exports: [OrderService],
})
export class OrderModule {}