import { Controller, Post, Get, Body, Param, Ip, BadRequestException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { AuthService } from '../auth/auth.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import * as crypto from 'crypto';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly authService: AuthService
  ) {}

  @Post()
  async createRoom(@Body() body: CreateRoomDto, @Ip() ip: string) {
    const ipHash = crypto.createHash('sha256').update(ip || 'unknown').digest('hex');
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
    const ipHash = crypto.createHash('sha256').update(ip || 'unknown').digest('hex');
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
