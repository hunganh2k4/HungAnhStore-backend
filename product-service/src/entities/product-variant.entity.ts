import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { StockMovement } from './stock-movement.entity';

@Entity('product_variants')
export class ProductVariant {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sku: string;

  @Column()
  color: string;  

  @Column('decimal')
  price: number;

  @Column({ default: 0 })
  stock: number;

  @ManyToOne(() => Product, product => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @OneToMany(() => StockMovement, movement => movement.variant)
  movements: StockMovement[];
}