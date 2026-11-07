import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private revokedSessionIds = new Set<string>();

  constructor(private jwtService: JwtService) {}

  revokeSession(sessionId: string): void {
    if (sessionId) {
      this.revokedSessionIds.add(sessionId);
    }
  }

  isSessionRevoked(sessionId: string): boolean {
    return this.revokedSessionIds.has(sessionId);
  }

  async generateGuestSession(roomId: string, memberId: string, _ip?: string | null) {
    const sessionId = crypto.randomUUID();
    const payload = {
      sid: sessionId,
      rid: roomId,
      mid: memberId,
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    return {
      accessToken,
      refreshToken,
      sessionId,
    };
  }

  async verifyToken(token: string): Promise<{ sid: string; rid: string; mid: string; exp?: number } | null> {
    try {
      const payload = this.jwtService.verify(token) as { sid: string; rid: string; mid: string; exp?: number };
      if (payload?.sid && this.isSessionRevoked(payload.sid)) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }
}
