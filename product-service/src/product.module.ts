import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductLine } from './entities/product-line.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
// import { StockMovement } from './entities/stock-movement.entity';

import { ProductService } from './services/product.service';
import { ProductController } from './controller/product.controller';
import { VariantController } from './controller/variant.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Brand,
      ProductImage,
      ProductLine,
      ProductAttribute,
      // StockMovement,
    ]),
  ],
  controllers: [ProductController, VariantController],
  providers: [ProductService],
  exports: [ProductService], 
})
export class ProductModule {}