import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateGuestSession(roomId: string, memberId: string, _ip: string) {
    const sessionId = crypto.randomUUID();
    const payload = {
      sid: sessionId,
      rid: roomId,
      mid: memberId,
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    // In a real implementation, store this in guest_sessions collection in Mongo
    return {
      accessToken,
      refreshToken,
      sessionId,
    };
  }

  async verifyToken(token: string): Promise<{ sid: string; rid: string; mid: string } | null> {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
