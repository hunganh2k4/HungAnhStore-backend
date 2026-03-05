import { Module } from '@nestjs/common';
import { MediaModule } from './media.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MediaModule,
  ],
})
export class AppModule {}