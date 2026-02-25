import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ProductLine } from './product-line.entity';

@Entity('brands')
export class Brand {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  logo: string;

  @OneToMany(() => ProductLine, product => product.brand)
  productLines: ProductLine[];
}