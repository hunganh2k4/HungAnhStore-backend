import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum StockType {
  IN = 'IN',
  ADJUST = 'ADJUST',
  RESERVE = 'RESERVE',
  RELEASE = 'RELEASE',
  CONFIRM = 'CONFIRM',
}

@Entity('stock_movements')
@Index(['productId'])
@Index(['orderId'])
@Index(['orderId', 'productId', 'type'], { unique: true })  
export class StockMovement {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  reference?: string;

  @Column()
  quantity: number;

  @Column({
    type: 'enum',
    enum: StockType,
  })
  type: StockType;

  @CreateDateColumn()
  createdAt: Date;
}