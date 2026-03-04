import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ProductModule,
    AuthModule,
    UserModule,
    InventoryModule,
    OrderModule
  ],
})
export class AppModule {}