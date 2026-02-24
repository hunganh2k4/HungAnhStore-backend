import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ProductModule,
    AuthModule,
  ],
})
export class AppModule {}