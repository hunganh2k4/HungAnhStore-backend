import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ProductModule,
  ],
})
export class AppModule {}