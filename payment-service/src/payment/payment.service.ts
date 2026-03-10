import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import type { Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { VnpayService } from '../vnpay/vnpay.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @Inject('KAFKA_PRODUCER')
    private producer: Producer,
    private configService: ConfigService,
    private vnpayService: VnpayService,
  ) {}

  private async publish(topic: string, payload: { orderId: string }) {
    await this.producer.send({
      topic,
      messages: [{ key: payload.orderId, value: JSON.stringify(payload) }],
    });
  }

  private getBaseUrl(): string {
    return (
      this.configService.get<string>('PAYMENT_BASE_URL') ||
      'http://localhost:4008'
    );
  }

  /** Kafka: xử lý payment.process từ order-service */
  async handlePaymentProcess(data: { orderId: string; amount: number }) {
    const existing = await this.paymentRepo.findOne({
      where: { orderId: data.orderId },
    });
    if (existing) {
      if (existing.paymentUrl) return;
      // Đã có payment nhưng chưa có URL (edge case) - tạo lại URL
    }

    const baseUrl = this.getBaseUrl();
    const payment = this.paymentRepo.create({
      orderId: data.orderId,
      amount: data.amount,
      status: PaymentStatus.PROCESSING,
      vnpTxnRef: data.orderId,
    });
    await this.paymentRepo.save(payment);
    console.log('payment', payment);

    const paymentUrl = this.vnpayService.createPaymentUrl({
      orderId: data.orderId,
      amount: data.amount,
      orderInfo: `Thanh toan don hang ${data.orderId}`,
      returnUrl: `${baseUrl}/payment/vnpay/return`,
      ipnUrl: `${baseUrl}/payment/vnpay/ipn`,
      locale: 'vn',
    });

    payment.paymentUrl = paymentUrl;
    payment.status = PaymentStatus.PROCESSING;
    await this.paymentRepo.save(payment);
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  /** Lấy URL thanh toán cho order (có retry khi Kafka đang xử lý) */
  async getPaymentUrl(
    orderId: string,
    options?: { maxWaitMs?: number; intervalMs?: number },
  ): Promise<{ url: string } | null> {
    const maxWait = options?.maxWaitMs ?? 10000; // 10s
    const interval = options?.intervalMs ?? 500;

    for (let elapsed = 0; elapsed < maxWait; elapsed += interval) {
      const payment = await this.paymentRepo.findOne({
        where: { orderId },
      });
      if (
        payment?.paymentUrl &&
        (payment.status === PaymentStatus.PROCESSING || payment.status === PaymentStatus.PENDING)
      ) {
        return { url: payment.paymentUrl };
      }
      await this.sleep(interval);
    }

    return null;
  }

  /** Lấy trạng thái payment */
  async getStatus(orderId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { orderId },
    });
    if (!payment) return null;
    return {
      orderId,
      status: payment.status,
      amount: Number(payment.amount),
      vnpTransactionNo: payment.vnpTransactionNo,
      completedAt: payment.completedAt,
    };
  }

  /** Xử lý Return URL - VNPay redirect user về đây sau khi thanh toán */
  async handleVnPayReturn(query: Record<string, string>) {
    const result = this.vnpayService.verifyReturnUrl(query);
    if (!result.isValid) {
      throw new BadRequestException('Invalid VNPay signature');
    }

    const payment = await this.paymentRepo.findOne({
      where: { orderId: result.vnpTxnRef },
    });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    // responseCode 00 = success
    const isSuccess = result.vnpResponseCode === '00';

    if (payment.status === PaymentStatus.SUCCESS || payment.status === PaymentStatus.FAILED) {
      return { payment, isSuccess, message: 'Giao dich da duoc xu ly truoc do' };
    }

    return this.updatePaymentResult(payment, isSuccess, result.vnpTransactionNo);
  }

  /** Xử lý IPN - VNPay gọi server-to-server (ưu tiên dùng IPN trong production) */
  async handleVnPayIpn(query: Record<string, string>) {
    const result = this.vnpayService.verifyReturnUrl(query);
    if (!result.isValid) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const payment = await this.paymentRepo.findOne({
      where: { orderId: result.vnpTxnRef },
    });
    if (!payment) {
      return { RspCode: '01', Message: 'Order not found' };
    }

    const isSuccess = result.vnpResponseCode === '00';

    if (payment.status === PaymentStatus.SUCCESS || payment.status === PaymentStatus.FAILED) {
      return { RspCode: '02', Message: 'Order already confirmed' };
    }

    await this.updatePaymentResult(payment, isSuccess, result.vnpTransactionNo);
    return { RspCode: '00', Message: 'Confirm Success' };
  }

  private async updatePaymentResult(
    payment: Payment,
    isSuccess: boolean,
    vnpTransactionNo: string,
  ) {
    payment.vnpTransactionNo = vnpTransactionNo;
    payment.completedAt = new Date();

    if (isSuccess) {
      payment.status = PaymentStatus.SUCCESS;
      await this.paymentRepo.save(payment);
      await this.publish('payment.succeeded', { orderId: payment.orderId });
    } else {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
      await this.publish('payment.failed', { orderId: payment.orderId });
    }

    return {
      payment: {
        orderId: payment.orderId,
        status: payment.status,
        amount: Number(payment.amount),
        vnpTransactionNo,
      },
      isSuccess,
      message: isSuccess ? 'Thanh toan thanh cong' : 'Thanh toan that bai',
    };
  }
}
