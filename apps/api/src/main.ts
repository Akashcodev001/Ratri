import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Set global prefix if needed
  app.setGlobalPrefix('v1');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 API is running on: http://0.0.0.0:${port}/v1`);
}
bootstrap();
