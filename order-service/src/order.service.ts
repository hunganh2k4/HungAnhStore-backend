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
import { OrderItem } from './entities/orderItem.entity';

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

  private mapItems(order: Order) {
    return order.items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
    }));
  }

  // ================================
  // ========== CREATE ORDER ========
  // ================================

  async create(dto: {
    items: { productId: number; quantity: number; price: number }[];
    paymentMethod: PaymentMethod;
  }) {
    const totalPrice = dto.items.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0,
    );

    const order = this.orderRepo.create({
      items: dto.items as OrderItem[],
      totalPrice,
      paymentMethod: dto.paymentMethod,
      status: OrderStatus.CREATED,
      paymentStatus: PaymentStatus.PENDING,
    });

    await this.orderRepo.save(order);

    await this.publish('order.created', {
      orderId: order.id,
      items: this.mapItems(order),
    });

    return order;
  }

  // ================================
  // ===== INVENTORY RESERVED =======
  // ================================

  async handleInventoryReserved(data: any) {
    const order = await this.orderRepo.findOne({
      where: { id: data.orderId },
      relations: ['items'],
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

    console.log('Inventory reserve failed for order', order.id, 'reason:', data.reason);
    order.status = OrderStatus.CANCELLED;
    await this.orderRepo.save(order);
  }

  // ================================
  // ===== PAYMENT SUCCESS ==========
  // ================================

  async handlePaymentSuccess(data: any) {
    const order = await this.orderRepo.findOne({
      where: { id: data.orderId },
      relations: ['items'],
    });
    if (!order) return;

    if (order.paymentStatus === PaymentStatus.SUCCESS) return;

    // 🚨 Nếu đã bị huỷ thì ignore
  if (order.status === OrderStatus.CANCELLED) {
    console.log(
      `Ignore payment success for cancelled order ${order.id}`,
    );
    return;
  }

  // Chỉ xử lý khi đang ở RESERVED
  if (order.status !== OrderStatus.RESERVED) {
    console.log(
      `Unexpected payment success for order ${order.id} in status ${order.status}`,
    );
    return;
  }

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
      relations: ['items'],
    });
    if (!order) return;

    order.paymentStatus = PaymentStatus.FAILED;
    order.status = OrderStatus.CANCELLED;
    await this.orderRepo.save(order);

    await this.publish('order.cancelled', {
      orderId: order.id,
      items: this.mapItems(order),
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
      relations: ['items'],
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
        items: this.mapItems(order),
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
      relations: ['items'],
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
      items: this.mapItems(order),
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