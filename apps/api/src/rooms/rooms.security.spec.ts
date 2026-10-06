import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService Security Hardening', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: 'test-secret-key-32bytes-long-secret',
      signOptions: { expiresIn: '15m' },
    });
    authService = new AuthService(jwtService);
  });

  it('should generate valid guest token and verify signature & payload', async () => {
    const session = await authService.generateGuestSession('room123', 'member456', 'hash789');
    expect(session.accessToken).toBeDefined();

    const payload = await authService.verifyToken(session.accessToken);
    expect(payload).not.toBeNull();
    expect(payload?.rid).toBe('room123');
    expect(payload?.mid).toBe('member456');
  });

  it('should reject invalid or tampered tokens', async () => {
    const invalidPayload = await authService.verifyToken('invalid.token.structure');
    expect(invalidPayload).toBeNull();
  });
});
