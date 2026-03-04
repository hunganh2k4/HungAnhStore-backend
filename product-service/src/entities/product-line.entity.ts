import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { ProductImage } from './product-image.entity';
import { Product } from './product.entity';
import { ProductAttribute } from './product-attribute.entity';

@Entity('product_lines')
export class ProductLine {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string; // iphone-17-256gb

  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => Category, category => category.productLines)
  category: Category;

  @ManyToOne(() => Brand, brand => brand.productLines)
  brand: Brand;

  @OneToMany(() => ProductImage, image => image.productLine)
  images: ProductImage[];

  @OneToMany(() => Product, product => product.productLine)
  products: Product[];

  @OneToMany(() => ProductAttribute, attr => attr.productLine)
  attributes: ProductAttribute[];
}