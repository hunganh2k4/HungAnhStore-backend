import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column()
  price: number; // giá tại thời điểm mua

  @ManyToOne(() => Order, order => order.items, {
    onDelete: 'CASCADE',
  })
  order: Order;
}