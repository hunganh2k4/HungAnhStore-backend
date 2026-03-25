import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CartConsumer } from './cart.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem])],
  controllers: [CartController, CartConsumer],
  providers: [CartService, JwtStrategy, CartConsumer],
})
export class CartModule {}