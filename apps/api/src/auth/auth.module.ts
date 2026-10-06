import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SIGNING_KEY');
        const nodeEnv = configService.get<string>('NODE_ENV');
        if (!secret) {
          if (nodeEnv === 'production') {
            throw new Error('CRITICAL SECURITY CONFIGURATION ERROR: JWT_SIGNING_KEY must be defined in production!');
          }
          Logger.warn('JWT_SIGNING_KEY is not defined. Using default fallback secret for development.', 'AuthModule');
        }
        return {
          secret: secret || 'change-me-secret-key-dev-only-32bytes',
          signOptions: { 
            expiresIn: parseInt(configService.get<string>('JWT_ACCESS_TTL_SECONDS') || '900', 10),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
