import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column()
  priceSnapshot: number;

  @Column()
  productNameSnapshot: string;

  @Column()
  imageSnapshot: string;

  @ManyToOne(() => Cart, (cart) => cart.items)
  cart: Cart;
}