import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  VersionColumn,
} from 'typeorm';

@Entity('inventories')
@Index(['productId'], { unique: true })
export class Inventory {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column({ default: 0 })
  available: number;

  @Column({ default: 0 })
  reserved: number;

  @VersionColumn()
  version: number; 
}