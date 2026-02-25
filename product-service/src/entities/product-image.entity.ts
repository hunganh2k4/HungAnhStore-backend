import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { ProductLine } from './product-line.entity';

@Entity('product_images')
export class ProductImage {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @Column({ default: false })
  isMain: boolean;

  @ManyToOne(() => ProductLine, productLine => productLine.images, {
    onDelete: 'CASCADE',
  })
  productLine: ProductLine;
}