import { Injectable, NotFoundException, Logger, OnModuleInit, OnModuleDestroy, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import * as crypto from 'crypto';

@Injectable()
export class RoomsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RoomsService.name);
  private sweepInterval?: NodeJS.Timeout;

  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @Optional() @InjectModel(Message.name) private messageModel?: Model<MessageDocument>
  ) {}

  onModuleInit() {
    this.expireDueRooms().catch(err => this.logger.error('Boot room sweep failed', err));
    this.sweepInterval = setInterval(() => {
      this.expireDueRooms().catch(err => this.logger.error('Periodic room sweep failed', err));
    }, 30000);
    if (this.sweepInterval.unref) {
      this.sweepInterval.unref();
    }
  }

  onModuleDestroy() {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = undefined;
    }
  }

  getEmptyGracePeriodMs(): number {
    const envVal = process.env.ROOM_EMPTY_GRACE_PERIOD_MS;
    if (envVal && !isNaN(Number(envVal))) {
      return Number(envVal);
    }
    return 5 * 60 * 1000; // 5 minutes default
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKMNPQRSTVWXYZ0123456789';
    let result = '';
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  async createRoom(createDto: { name: string; personality: string; ipHash?: string | null }): Promise<Room> {
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
      createdByIpHash: createDto.ipHash || null,
    });

    return newRoom.save();
  }

  private static readonly ROOM_CODE_REGEX = /^[A-Z0-9-]{3,20}$/;

  async getRoomByCode(roomCode: string): Promise<Room> {
    const safeCode = String(roomCode || '').trim().toUpperCase();
    if (!safeCode || !RoomsService.ROOM_CODE_REGEX.test(safeCode)) {
      throw new NotFoundException('Room expired or does not exist.');
    }
    const room = await this.roomModel.findOne({ roomCode: safeCode }).lean().exec();
    if (!room) throw new NotFoundException('Room expired or does not exist.');
    
    const now = new Date();
    if (room.status === 'EXPIRED' || room.status === 'ENDED' || now >= room.expiresAt) {
      if (room.status !== 'EXPIRED' && room.status !== 'ENDED') {
        await this.roomModel.updateOne(
          { roomCode: safeCode, status: { $nin: ['EXPIRED', 'ENDED'] } },
          { $set: { status: 'EXPIRED', endedAt: now, endedReason: 'DEADLINE_PASSED' } }
        ).exec();
      }
      throw new NotFoundException('Room expired or does not exist.');
    }
    return room as Room;
  }

  async setRoomHost(roomCode: string, hostMemberId: string): Promise<void> {
    const safeCode = String(roomCode || '').trim().toUpperCase();
    if (!safeCode || !RoomsService.ROOM_CODE_REGEX.test(safeCode) || !hostMemberId) return;
    await this.roomModel.updateOne(
      { roomCode: safeCode, hostMemberId: { $exists: false } },
      { $set: { hostMemberId } }
    ).exec();
  }

  async validateAndJoinRoom(roomCode: string): Promise<Room> {
    const safeCode = String(roomCode || '').trim().toUpperCase();
    if (!safeCode || !RoomsService.ROOM_CODE_REGEX.test(safeCode)) {
      throw new NotFoundException('Room expired or does not exist.');
    }

    const now = new Date();
    const activeExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Fast-path: Single atomic check-and-activate query for valid active/created/idle rooms
    const updated = await this.roomModel.findOneAndUpdate(
      {
        roomCode: safeCode,
        status: { $in: ['CREATED', 'ACTIVE', 'IDLE'] },
        expiresAt: { $gt: now },
      },
      {
        $set: {
          status: 'ACTIVE',
          emptySince: null,
          expiresAt: activeExpiresAt,
          purgeAt: new Date(activeExpiresAt.getTime() + 7 * 24 * 60 * 60 * 1000),
          lastActivityAt: now,
        },
      },
      { returnDocument: 'after', lean: true }
    ).exec();

    if (updated) {
      return updated as Room;
    }

    // Fallback: If atomic activation failed, check why (expired, ended, or nonexistent)
    const existing = await this.roomModel.findOne({ roomCode: safeCode }).lean().exec();
    if (!existing) {
      throw new NotFoundException('Room expired or does not exist.');
    }

    if (existing.status === 'EXPIRED' || existing.status === 'ENDED' || now >= existing.expiresAt) {
      if (existing.status !== 'EXPIRED' && existing.status !== 'ENDED') {
        const tombstonePurge = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        await this.roomModel.updateOne(
          { roomCode: safeCode, status: { $nin: ['EXPIRED', 'ENDED'] } },
          { $set: { status: 'EXPIRED', endedAt: now, endedReason: 'DEADLINE_PASSED', purgeAt: tombstonePurge } }
        ).exec();
      }
    }

    throw new NotFoundException('Room expired or does not exist.');
  }

  async markRoomEmpty(roomCode: string, gracePeriodMsOverride?: number): Promise<void> {
    const safeCode = String(roomCode || '').trim().toUpperCase();
    if (!safeCode) return;

    const now = new Date();
    const graceMs = gracePeriodMsOverride ?? this.getEmptyGracePeriodMs();
    const expiresAt = new Date(now.getTime() + graceMs);
    const purgeAt = new Date(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    await this.roomModel.updateOne(
      {
        roomCode: safeCode,
        status: { $in: ['CREATED', 'ACTIVE', 'IDLE'] },
      },
      {
        $set: {
          status: 'IDLE',
          emptySince: now,
          expiresAt,
          purgeAt,
          lastActivityAt: now,
        },
      }
    ).exec();

    this.logger.log(`Room ${safeCode} marked empty (IDLE). Expires at ${expiresAt.toISOString()}`);
  }

  async expireDueRooms(): Promise<number> {
    const now = new Date();
    const tombstonePurge = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const res = await this.roomModel.updateMany(
      {
        status: { $in: ['IDLE', 'CREATED'] },
        expiresAt: { $lte: now },
      },
      {
        $set: {
          status: 'EXPIRED',
          endedAt: now,
          endedReason: 'EMPTY_TIMEOUT',
          purgeAt: tombstonePurge,
        },
      }
    ).exec();

    if (res.modifiedCount > 0) {
      this.logger.log(`Expired ${res.modifiedCount} due rooms`);
    }
    return res.modifiedCount;
  }

  async saveMessage(data: {
    roomCode: string;
    senderMemberId: string;
    senderName: string;
    senderId?: string;
    text: string;
  }): Promise<{ id: string; sender: string; senderId?: string; text: string; time: string; timestamp: number }> {
    const safeCode = String(data.roomCode || '').trim().toUpperCase();
    const safeText = String(data.text || '').trim().slice(0, 1000);
    const now = new Date();

    let purgeAt = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000);
    try {
      const room = await this.roomModel.findOne({ roomCode: safeCode }, { purgeAt: 1 }).lean().exec();
      if (room?.purgeAt) {
        purgeAt = room.purgeAt;
      }
    } catch (err: any) {
      this.logger.warn(`Could not lookup purgeAt for room ${safeCode}: ${err?.message}`);
    }

    if (!this.messageModel) {
      const mockId = crypto.randomUUID();
      return {
        id: mockId,
        sender: data.senderName,
        senderId: data.senderId,
        text: safeText,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime(),
      };
    }

    const doc = new this.messageModel({
      roomCode: safeCode,
      senderMemberId: data.senderMemberId,
      senderName: data.senderName,
      senderId: data.senderId,
      text: safeText,
      createdAt: now,
      purgeAt,
    });

    const saved = await doc.save();

    return {
      id: saved._id.toString(),
      sender: saved.senderName,
      senderId: saved.senderId,
      text: saved.text,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.getTime(),
    };
  }

  async getChatHistory(
    roomCode: string,
    limit = 50
  ): Promise<Array<{ id: string; sender: string; senderId?: string; text: string; time: string; timestamp: number }>> {
    const safeCode = String(roomCode || '').trim().toUpperCase();
    if (!safeCode || !this.messageModel) return [];

    const boundedLimit = Math.min(Math.max(1, limit), 100);

    const docs = await this.messageModel
      .find({ roomCode: safeCode })
      .sort({ createdAt: -1 })
      .limit(boundedLimit)
      .lean()
      .exec();

    // Reverse descending slice into chronological ascending order
    return docs.reverse().map((doc: any) => ({
      id: doc._id.toString(),
      sender: doc.senderName,
      senderId: doc.senderId,
      text: doc.text,
      time: new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(doc.createdAt).getTime(),
    }));
  }
}
