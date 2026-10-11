import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Dynamic Origin Validator (Environment-driven, 12-factor standard)
  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return true; // Allow same-origin, server-to-server, curl, health checks
    const originLower = origin.toLowerCase();

    // 1. Local development origins
    if (
      originLower.startsWith('http://localhost:') ||
      originLower.startsWith('http://127.0.0.1:') ||
      originLower.startsWith('https://localhost:') ||
      originLower.startsWith('https://127.0.0.1:')
    ) {
      return true;
    }

    // 2. User-defined CLIENT_ORIGIN environment variable (supports exact domains and wildcards like *.vercel.app)
    if (process.env.CLIENT_ORIGIN) {
      const envOrigins = process.env.CLIENT_ORIGIN.split(',').map(o => o.trim().toLowerCase());
      for (const pattern of envOrigins) {
        if (pattern === originLower) return true;
        if (pattern.startsWith('*.')) {
          const suffix = pattern.slice(1); // e.g. .vercel.app
          if (originLower.endsWith(suffix)) return true;
        }
      }
    }

    return false;
  };

  // Security Headers & Content Security Policy
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.youtube.com', 'https://s.ytimg.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          mediaSrc: ["'self'", 'blob:', 'https:'],
          connectSrc: ["'self'", 'ws:', 'wss:', 'http:', 'https:'],
          frameSrc: ["'self'", 'https://www.youtube.com', 'https://youtube.com'],
          objectSrc: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Set global prefix if needed
  app.setGlobalPrefix('v1');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 API is running on: http://0.0.0.0:${port}/v1`);
}
bootstrap();
