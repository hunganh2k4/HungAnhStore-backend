import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sku: string;

  @Column('decimal')
  price: number;

  @Column({ default: 0 })
  stock: number;

  @ManyToOne(() => Product, product => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;
}