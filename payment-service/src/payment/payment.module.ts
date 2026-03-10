import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentConsumer } from './payment.consumer';
import { VnpayService } from '../vnpay/vnpay.service';
import { kafkaProducerProvider } from '../kafka/kafka.producer.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [PaymentService, VnpayService, kafkaProducerProvider, PaymentConsumer],
  controllers: [PaymentController, PaymentConsumer],
  exports: [PaymentService],
})
export class PaymentModule {}
