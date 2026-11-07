import { Controller, Post, Get, Body, Param, Ip, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { AuthService } from '../auth/auth.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import * as crypto from 'crypto';
import * as net from 'net';

@Controller('rooms')
export class RoomsController implements OnModuleInit {
  private readonly logger = new Logger(RoomsController.name);

  constructor(
    private readonly roomsService: RoomsService,
    private readonly authService: AuthService
  ) {}

  onModuleInit() {
    const secret = process.env.IP_HASH_SECRET;
    if (!secret || secret.trim().length < 16) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'FATAL_SECURITY_ERROR: Dedicated IP_HASH_SECRET must be configured with at least 16 characters in production.'
        );
      }
      this.logger.warn(
        'IP_HASH_SECRET is missing or short. Using local development fallback secret. DO NOT USE IN PRODUCTION.'
      );
    }
  }

  private normalizeClientIp(ip: string | undefined): string | null {
    if (!ip) return null;
    let clean = String(ip).trim();
    if (!clean) return null;

    // Handle forwarded headers comma-separated (e.g. client, proxy1, proxy2)
    if (clean.includes(',')) {
      clean = clean.split(',')[0].trim();
    }

    // Strip IPv4-mapped IPv6 prefix (::ffff:)
    if (clean.startsWith('::ffff:')) {
      clean = clean.slice(7);
    }

    // Strip IPv6 zone index if present (e.g. fe80::1%eth0)
    const zoneIndex = clean.indexOf('%');
    if (zoneIndex !== -1) {
      clean = clean.slice(0, zoneIndex);
    }

    // Strip port if IPv4 with port (e.g., 1.2.3.4:5678)
    const ipv4PortMatch = clean.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/);
    if (ipv4PortMatch) {
      clean = ipv4PortMatch[1];
    }

    // Validate using Node.js net.isIP (returns 0 if invalid, 4 for IPv4, 6 for IPv6)
    if (net.isIP(clean) === 0) {
      return null;
    }

    return clean.toLowerCase();
  }

  private hashClientIp(ip: string | undefined): string {
    const secret =
      process.env.IP_HASH_SECRET ||
      (process.env.NODE_ENV !== 'production' ? 'dev-fallback-ip-hash-secret-do-not-use-in-prod' : '');
    if (!secret) {
      throw new Error('FATAL_SECURITY_ERROR: Dedicated IP_HASH_SECRET is not configured.');
    }

    const normalizedIp = this.normalizeClientIp(ip);
    // Never silently default missing/invalid IP to 127.0.0.1 (prevents colliding legitimate localhost with unidentifiable clients)
    const ipPayload = normalizedIp ? `IP:${normalizedIp}` : 'IP:UNAVAILABLE';
    return crypto.createHmac('sha256', secret).update(ipPayload).digest('hex');
  }

  @Post()
  async createRoom(@Body() body: CreateRoomDto, @Ip() ip: string) {
    const ipHash = this.hashClientIp(ip);
    const room = await this.roomsService.createRoom({
      name: body.name.trim(),
      personality: body.personality || 'chill',
      ipHash,
    });
    return {
      roomCode: room.roomCode,
      name: room.name,
      status: room.status,
      personality: room.personality,
    };
  }

  @Get(':code')
  async getRoom(@Param('code') code: string) {
    const cleanCode = String(code || '').trim();
    if (!cleanCode) {
      throw new BadRequestException('INVALID_ROOM_CODE');
    }
    const room = await this.roomsService.getRoomByCode(cleanCode);
    return {
      roomCode: room.roomCode,
      name: room.name,
      status: room.status,
      personality: room.personality,
      locked: room.settings.locked,
      requiresPassword: !!room.passwordHash,
      requiresApproval: room.settings.requireApproval,
      participantCount: 0,
      maxParticipants: room.settings.maxParticipants,
    };
  }

  @Post(':code/join')
  async joinRoom(@Param('code') code: string, @Body() body: JoinRoomDto, @Ip() ip: string) {
    const cleanCode = String(code || '').trim();
    if (!cleanCode) {
      throw new BadRequestException('INVALID_ROOM_CODE');
    }
    const cleanDisplayName = body.displayName.trim();
    if (cleanDisplayName.length < 1 || cleanDisplayName.length > 24) {
      throw new BadRequestException('NAME_INVALID');
    }
    const room = await this.roomsService.getRoomByCode(cleanCode);
    
    if (room.settings.locked) {
      throw new BadRequestException('ROOM_LOCKED');
    }

    const memberId = crypto.randomUUID();
    const ipHash = this.hashClientIp(ip);
    const session = await this.authService.generateGuestSession((room as any)._id.toString(), memberId, ipHash);

    return {
      session: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
      },
      member: {
        memberId,
        displayName: cleanDisplayName,
        role: 'GUEST'
      }
    };
  }
}
