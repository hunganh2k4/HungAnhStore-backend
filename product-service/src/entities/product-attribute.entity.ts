import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_attributes')
export class ProductAttribute {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // RAM, CPU...

  @Column()
  value: string; // 16GB, i7...

  @ManyToOne(() => Product, product => product.id, {
    onDelete: 'CASCADE',
  })
  product: Product;
}