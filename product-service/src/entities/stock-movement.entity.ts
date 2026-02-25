// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   CreateDateColumn,
// } from 'typeorm';
// import { ProductVariant } from './product.entity';

// export enum StockType {
//   IN = 'IN',
//   OUT = 'OUT',
// }

// @Entity('stock_movements')
// export class StockMovement {

//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => ProductVariant, variant => variant.movements, {
//     onDelete: 'CASCADE',
//   })
//   variant: ProductVariant;

//   @Column({
//     type: 'enum',
//     enum: StockType,
//   })
//   type: StockType;

//   @Column()
//   quantity: number;

//   @CreateDateColumn()
//   createdAt: Date;
// }