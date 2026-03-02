import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import type { Producer } from 'kafkajs';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @Inject('KAFKA_PRODUCER')
    private producer: Producer,
  ) {}

  // ================================
  // ========== PUBLISHER ===========
  // ================================

  private async publish(topic: string, payload: any) {
    await this.producer.send({
      topic,
      messages: [
        {
          key: payload.orderId?.toString(),
          value: JSON.stringify(payload),
        },
      ],
    });
  }

  // ================================
  // ========== CREATE ORDER ========
  // ================================

  async create(dto: {
    productId: number;
    quantity: number;
    totalPrice: number;
    paymentMethod: PaymentMethod;
  }) {
    const order = this.orderRepo.create({
      ...dto,
      status: OrderStatus.CREATED,
      paymentStatus: PaymentStatus.PENDING,
    });

    await this.orderRepo.save(order);

    await this.publish('order.created', {
      orderId: order.id,
      productId: order.productId,
      quantity: order.quantity,
    });

    return order;
  }

  // ================================
  // ===== INVENTORY RESERVED =======
  // ================================

  async handleInventoryReserved(data: any) {
    const order = await this.orderRepo.findOne({
      where: { id: data.orderId },
    });
    if (!order) return;

    if (order.status !== OrderStatus.CREATED) return;

    order.status = OrderStatus.RESERVED;
    await this.orderRepo.save(order);

    // ONLINE → gọi payment
    if (order.paymentMethod === PaymentMethod.ONLINE) {
      order.paymentStatus = PaymentStatus.PROCESSING;
      await this.orderRepo.save(order);

      await this.publish('payment.process', {
        orderId: order.id,
        amount: order.totalPrice,
      });
    }

    // COD → skip payment → confirm luôn
    if (order.paymentMethod === PaymentMethod.COD) {
      // await this.publish('order.confirm', {
      //   orderId: order.id,
      //   productId: order.productId,
      //   quantity: order.quantity,
      // });
      order.status = OrderStatus.CONFIRMED;
      await this.orderRepo.save(order);
    }
  }

  async handleReserveFailed(data: any) {
    const order = await this.orderRepo.findOne({
      where: { id: data.orderId },
    });
    if (!order) return;

    order.status = OrderStatus.CANCELLED;
    await this.orderRepo.save(order);
  }

  // ================================
  // ===== PAYMENT SUCCESS ==========
  // ================================

  async handlePaymentSuccess(data: any) {
    const order = await this.orderRepo.findOne({
      where: { id: data.orderId },
    });
    if (!order) return;

    if (order.paymentStatus === PaymentStatus.SUCCESS) return;

    order.paymentStatus = PaymentStatus.SUCCESS;
    order.status = OrderStatus.CONFIRMED;
    await this.orderRepo.save(order);

    // await this.publish('order.confirm', {
    //   orderId: order.id,
    //   productId: order.productId,
    //   quantity: order.quantity,
    // });
  }

  // ================================
  // ===== PAYMENT FAILED ===========
  // ================================

  async handlePaymentFailed(data: any) {
    const order = await this.orderRepo.findOne({
      where: { id: data.orderId },
    });
    if (!order) return;

    order.paymentStatus = PaymentStatus.FAILED;
    order.status = OrderStatus.CANCELLED;
    await this.orderRepo.save(order);

    await this.publish('order.cancelled', {
      orderId: order.id,
      productId: order.productId,
      quantity: order.quantity,
    });
  }

  // ================================
  // ===== INVENTORY CONFIRMED ======
  // ================================

  async handleInventoryConfirmed(data: any) {
    const order = await this.orderRepo.findOne({
      where: { id: data.orderId },
    });
    if (!order) return;
    order.status = OrderStatus.SHIPPING;
    await this.orderRepo.save(order);
  }

  async handleConfirmFailed(data: any) {
    const order = await this.orderRepo.findOne({
      where: { id: data.orderId },
    });
    if (!order) return;

    // nếu đang SHIPPING mà confirm fail
    if (order.status === OrderStatus.SHIPPING) {
      order.status = OrderStatus.CONFIRMED;
      await this.orderRepo.save(order);
    }
  }

  // ================================
  // ============ CANCEL ============
  // ================================

  async cancel(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (
      order.status === OrderStatus.SHIPPING ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Cannot cancel after shipping started',
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      return order;
    }

    const oldStatus = order.status;

    order.status = OrderStatus.CANCELLED;
    await this.orderRepo.save(order);

    if (
      oldStatus === OrderStatus.RESERVED ||
      oldStatus === OrderStatus.CONFIRMED
    ) {
      await this.publish('order.cancelled', {
        orderId: order.id,
        productId: order.productId,
        quantity: order.quantity,
      });
    }

    return order;
  }

  async handleReleaseFailed(data: any) {
    console.error('Release failed:', data);
  }

  // ================================
  // ========= SHIPPING FLOW ========
  // ================================

  async markAsShipping(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) throw new BadRequestException('Order not found');

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        'Order must be CONFIRMED before shipping',
      );
    }

    // publish confirm inventory
    await this.publish('order.shipped', {
      orderId: order.id,
      productId: order.productId,
      quantity: order.quantity,
    });

    return order;
  }


  async markAsDelivered(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) throw new BadRequestException('Order not found');

    if (order.status !== OrderStatus.SHIPPING) {
      throw new BadRequestException(
        'Order must be SHIPPING before delivered',
      );
    }

    order.status = OrderStatus.DELIVERED;

    // COD thu tiền khi giao
    if (order.paymentMethod === PaymentMethod.COD) {
      order.paymentStatus = PaymentStatus.SUCCESS;
    }

    return this.orderRepo.save(order);
  }
}