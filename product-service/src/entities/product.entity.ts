import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ProductLine } from './product-line.entity';

@Entity('products')
export class Product {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sku: string;

  @Column()
  color: string;  

  @Column('decimal')
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => ProductLine, productLine => productLine.products, {
    onDelete: 'CASCADE',
  })
  productLine: ProductLine;
}