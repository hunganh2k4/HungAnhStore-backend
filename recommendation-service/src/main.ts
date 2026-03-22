import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 4009;
  
  await app.listen(port);
  console.log(`Recommendation Service is running on: http://localhost:${port}`);
}
bootstrap();
