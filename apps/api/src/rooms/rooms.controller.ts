import { Controller, Post, Get, Body, Param, Ip, BadRequestException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { AuthService } from '../auth/auth.service';
import * as crypto from 'crypto';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly authService: AuthService
  ) {}

  @Post()
  async createRoom(@Body() body: any, @Ip() ip: string) {
    const ipHash = crypto.createHash('sha256').update(ip || 'unknown').digest('hex');
    const room = await this.roomsService.createRoom({
      name: body.name || 'New Room',
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
    const room = await this.roomsService.getRoomByCode(code);
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
  async joinRoom(@Param('code') code: string, @Body() body: { displayName: string, password?: string }, @Ip() ip: string) {
    if (!body.displayName || body.displayName.trim().length < 1 || body.displayName.trim().length > 24) {
      throw new BadRequestException('NAME_INVALID');
    }
    const room = await this.roomsService.getRoomByCode(code);
    
    if (room.settings.locked) {
      throw new BadRequestException('ROOM_LOCKED');
    }

    // A real implementation would verify password here if required

    const memberId = crypto.randomUUID();
    const ipHash = crypto.createHash('sha256').update(ip || 'unknown').digest('hex');
    const session = await this.authService.generateGuestSession((room as any)._id.toString(), memberId, ipHash);

    // Normally we would insert into room_members here

    return {
      session: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
      },
      member: {
        memberId,
        displayName: body.displayName.trim(),
        role: 'GUEST'
      }
    };
  }
}
