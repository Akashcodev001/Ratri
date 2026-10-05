import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Set global prefix if needed
  app.setGlobalPrefix('v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 API is running on: http://localhost:${port}/v1`);
}
bootstrap();
