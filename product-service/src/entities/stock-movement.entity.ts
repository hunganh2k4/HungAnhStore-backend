import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum StockType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity('stock_movements')
export class StockMovement {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, product => product.movements)
  product: Product;

  @Column({
    type: 'enum',
    enum: StockType,
  })
  type: StockType;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;
}