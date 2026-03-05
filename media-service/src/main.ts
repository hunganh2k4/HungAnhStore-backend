import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.mnodule';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(process.env.PORT || 4006);
}

bootstrap();