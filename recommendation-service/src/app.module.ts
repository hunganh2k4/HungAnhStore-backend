import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationModule } from './recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      name: 'productConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_PRODUCT_HOST'),
        port: configService.get<number>('DB_PRODUCT_PORT'),
        username: configService.get<string>('DB_PRODUCT_USERNAME'),
        password: configService.get<string>('DB_PRODUCT_PASSWORD'),
        database: configService.get<string>('DB_PRODUCT_NAME'),
        entities: [], // Using raw queries for now as requested
        synchronize: false,
      }),
    }),
    TypeOrmModule.forRootAsync({
      name: 'orderConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_ORDER_HOST'),
        port: configService.get<number>('DB_ORDER_PORT'),
        username: configService.get<string>('DB_ORDER_USERNAME'),
        password: configService.get<string>('DB_ORDER_PASSWORD'),
        database: configService.get<string>('DB_ORDER_NAME'),
        entities: [],
        synchronize: false,
      }),
    }),
    RecommendationModule,
  ],
})
export class AppModule {}
