import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as net from 'net';

// Validates explicit CIDR notation (e.g. 10.0.0.0/8, 192.168.1.0/24), single IPs, or standard named subnets
const isValidCidrOrSubnet = (val: string): boolean => {
  const standardSubnets = ['loopback', 'linklocal', 'uniquelocal'];
  const parts = val.split(',').map((p) => p.trim());
  return parts.length > 0 && parts.every((part) => {
    if (standardSubnets.includes(part.toLowerCase())) return true;
    if (net.isIP(part) !== 0) return true;
    const cidrMatch = part.match(/^([^/]+)\/(\d{1,3})$/);
    if (!cidrMatch) return false;
    const ip = cidrMatch[1];
    const prefix = parseInt(cidrMatch[2], 10);
    const ipVersion = net.isIP(ip);
    if (ipVersion === 4 && prefix >= 0 && prefix <= 32) return true;
    if (ipVersion === 6 && prefix >= 0 && prefix <= 128) return true;
    return false;
  });
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure trusted reverse proxy hops (Render ingress topology: exactly 1 hop)
  // Rejects arbitrary strings, negative numbers, out-of-range integers (>5), and unsafe boolean 'true'.
  // Validates explicit CIDR notation or defaults safely to 1 hop.
  const rawTrustProxy = process.env.TRUST_PROXY?.trim();
  let trustProxyConfig: any = 1; // Default: exactly 1 hop for Render's reverse proxy

  if (rawTrustProxy !== undefined && rawTrustProxy !== '') {
    const isInteger = /^\d+$/.test(rawTrustProxy);
    if (isInteger) {
      const parsedHop = parseInt(rawTrustProxy, 10);
      if (parsedHop >= 0 && parsedHop <= 5) {
        trustProxyConfig = parsedHop;
      } else {
        Logger.warn(
          `TRUST_PROXY="${rawTrustProxy}" is outside safe hop range (0-5). Defaulting safely to 1 trusted hop for Render proxy.`,
          'Bootstrap'
        );
        trustProxyConfig = 1;
      }
    } else if (rawTrustProxy.toLowerCase() === 'false' || rawTrustProxy === '0') {
      trustProxyConfig = false;
    } else if (rawTrustProxy.toLowerCase() === 'true') {
      Logger.warn(
        'TRUST_PROXY="true" is unsafe and permits client IP spoofing. Defaulting safely to 1 trusted hop for Render proxy.',
        'Bootstrap'
      );
      trustProxyConfig = 1;
    } else if (isValidCidrOrSubnet(rawTrustProxy)) {
      trustProxyConfig = rawTrustProxy;
    } else {
      Logger.warn(
        `TRUST_PROXY="${rawTrustProxy}" contains invalid IP/CIDR syntax. Arbitrary strings rejected. Defaulting safely to 1 trusted hop.`,
        'Bootstrap'
      );
      trustProxyConfig = 1;
    }
  }

  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && typeof (httpAdapter.getInstance() as any)?.set === 'function') {
    (httpAdapter.getInstance() as any).set('trust proxy', trustProxyConfig);
  }

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
