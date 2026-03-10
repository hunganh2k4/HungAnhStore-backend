import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentConsumer {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern('payment.process')
  async handlePaymentProcess(
    @Payload() data: { orderId: string; amount: number },
  ) {
    console.log('Payment process received:', data);
    await this.paymentService.handlePaymentProcess(data);
  }
}
