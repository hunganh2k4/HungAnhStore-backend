import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4003;
  console.log(`User service is running on port ${port}`);

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(port);
}
bootstrap();