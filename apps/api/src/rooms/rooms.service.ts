import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import * as crypto from 'crypto';

@Injectable()
export class RoomsService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKMNPQRSTVWXYZ0123456789';
    let result = '';
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  async createRoom(createDto: { name: string; personality: string; ipHash: string }): Promise<Room> {
    const roomCode = this.generateRoomCode();
    
    // Default settings
    const settings = {
      name: createDto.name,
      personality: createDto.personality,
      maxParticipants: 4,
      locked: false,
      requireApproval: false,
      slowModeSeconds: 0,
      waitForEveryoneBuffering: true,
      restoreHostOnReturn: true,
      allowGifs: true,
      capabilities: {} // Fill defaults from shared types if needed
    };

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h max life
    const purgeAt = new Date(expiresAt.getTime() + 10 * 60 * 1000); // Tombstone 10m

    const newRoom = new this.roomModel({
      roomCode,
      name: createDto.name,
      personality: createDto.personality,
      status: 'CREATED',
      settings,
      expiresAt,
      purgeAt,
      createdByIpHash: createDto.ipHash,
    });

    return newRoom.save();
  }

  async getRoomByCode(roomCode: string): Promise<Room> {
    const safeCode = String(roomCode || '').trim().toUpperCase();
    if (!safeCode) throw new NotFoundException('Room not found');
    const room = await this.roomModel.findOne({ roomCode: safeCode }).exec();
    if (!room) throw new NotFoundException('Room not found');
    if (room.status === 'EXPIRED' || room.status === 'ENDED') {
        throw new ConflictException('ROOM_ENDED');
    }
    return room;
  }
}
