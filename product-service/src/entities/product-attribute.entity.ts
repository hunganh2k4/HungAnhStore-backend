import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { ProductLine } from './product-line.entity';

@Unique(['productLine', 'name'])
@Entity('product_attributes')
export class ProductAttribute {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // RAM, CPU...

  @Column()
  value: string; // 16GB, i7...

  @ManyToOne(() => ProductLine, productLine => productLine.id,{
    onDelete: 'CASCADE',
  })
  productLine: ProductLine;
}