import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RoomsService } from './rooms.service';
import { NotFoundException } from '@nestjs/common';

describe('RoomsService Durable 5-Minute Room Expiration & Lifecycle', () => {
  let roomsService: RoomsService;
  let mockRoomModel: any;
  let roomStore: Map<string, any>;

  beforeEach(() => {
    roomStore = new Map();

    class MockModel {
      constructor(doc: any) {
        Object.assign(this, doc);
      }
      async save() {
        roomStore.set((this as any).roomCode, { ...(this as any) });
        return this;
      }

      static findOne = vi.fn().mockImplementation((query: any) => {
        const room = roomStore.get(query.roomCode);
        return {
          exec: vi.fn().mockResolvedValue(room ? { ...room } : null),
        };
      });

      static findOneAndUpdate = vi.fn().mockImplementation((query: any, update: any) => {
        const room = roomStore.get(query.roomCode);
        if (!room) {
          return { exec: vi.fn().mockResolvedValue(null) };
        }

        // Check status condition
        if (query.status?.$in && !query.status.$in.includes(room.status)) {
          return { exec: vi.fn().mockResolvedValue(null) };
        }

        // Check expiresAt condition
        if (query.expiresAt?.$gt && !(room.expiresAt > query.expiresAt.$gt)) {
          return { exec: vi.fn().mockResolvedValue(null) };
        }

        const updated = {
          ...room,
          ...update.$set,
        };
        roomStore.set(query.roomCode, updated);
        return { exec: vi.fn().mockResolvedValue(updated) };
      });

      static updateOne = vi.fn().mockImplementation((query: any, update: any) => {
        const room = roomStore.get(query.roomCode);
        if (room) {
          const updated = { ...room, ...update.$set };
          roomStore.set(query.roomCode, updated);
          return { exec: vi.fn().mockResolvedValue({ modifiedCount: 1 }) };
        }
        return { exec: vi.fn().mockResolvedValue({ modifiedCount: 0 }) };
      });

      static updateMany = vi.fn().mockImplementation((query: any, update: any) => {
        let count = 0;
        for (const [code, r] of roomStore.entries()) {
          const statusMatch = !query.status?.$in || query.status.$in.includes(r.status);
          const expiresMatch = !query.expiresAt?.$lte || r.expiresAt <= query.expiresAt.$lte;
          if (statusMatch && expiresMatch) {
            roomStore.set(code, { ...r, ...update.$set });
            count++;
          }
        }
        return { exec: vi.fn().mockResolvedValue({ modifiedCount: count }) };
      });
    }

    mockRoomModel = MockModel as any;
    roomsService = new RoomsService(mockRoomModel);
  });

  afterEach(() => {
    roomsService.onModuleDestroy();
  });

  it('Scenario 1: Creates room with status CREATED', async () => {
    const room = await roomsService.createRoom({
      name: 'Test Lounge',
      personality: 'chill',
      ipHash: 'abc123hash',
    });

    expect(room.roomCode).toBeDefined();
    expect(room.status).toBe('CREATED');
    expect(roomStore.get(room.roomCode)).toBeDefined();
  });

  it('Scenario 2: When last participant leaves, markRoomEmpty sets status IDLE with 5-minute expiresAt', async () => {
    const room = await roomsService.createRoom({
      name: 'Test Room',
      personality: 'movie-night',
      ipHash: 'ip1',
    });

    const now = new Date('2026-10-11T12:00:00Z');
    vi.setSystemTime(now);

    await roomsService.markRoomEmpty(room.roomCode, 5 * 60 * 1000);

    const stored = roomStore.get(room.roomCode);
    expect(stored.status).toBe('IDLE');
    expect(stored.emptySince).toEqual(now);
    expect(stored.expiresAt.getTime()).toBe(now.getTime() + 5 * 60 * 1000);
  });

  it('Scenario 3: Rejoining before 5-minute deadline cancels expiration and reactivates room', async () => {
    const room = await roomsService.createRoom({
      name: 'Test Room',
      personality: 'movie-night',
      ipHash: 'ip1',
    });

    const startTime = new Date('2026-10-11T12:00:00Z');
    vi.setSystemTime(startTime);

    // Empty room starts 5m grace period
    await roomsService.markRoomEmpty(room.roomCode, 5 * 60 * 1000);

    // Rejoin at minute 2 (< 5 minutes)
    const rejoinTime = new Date('2026-10-11T12:02:00Z');
    vi.setSystemTime(rejoinTime);

    const joinedRoom = await roomsService.validateAndJoinRoom(room.roomCode);
    expect(joinedRoom.status).toBe('ACTIVE');
    expect(joinedRoom.emptySince).toBeNull();
    // Rejoined room gets extended 24h active lifetime
    expect(joinedRoom.expiresAt.getTime()).toBeGreaterThan(rejoinTime.getTime() + 23 * 60 * 60 * 1000);
  });

  it('Scenario 4: Joining after 5-minute deadline has passed is rejected with NotFoundException', async () => {
    const room = await roomsService.createRoom({
      name: 'Test Room',
      personality: 'chill',
      ipHash: 'ip1',
    });

    const startTime = new Date('2026-10-11T12:00:00Z');
    vi.setSystemTime(startTime);

    await roomsService.markRoomEmpty(room.roomCode, 5 * 60 * 1000);

    // 5 minutes and 1 second later
    const expiredTime = new Date('2026-10-11T12:05:01Z');
    vi.setSystemTime(expiredTime);

    await expect(roomsService.validateAndJoinRoom(room.roomCode)).rejects.toThrow(NotFoundException);
    await expect(roomsService.getRoomByCode(room.roomCode)).rejects.toThrow(NotFoundException);
  });

  it('Scenario 5: Background sweep expires due empty rooms even if delayed', async () => {
    const room = await roomsService.createRoom({
      name: 'Test Room',
      personality: 'chill',
      ipHash: 'ip1',
    });

    const startTime = new Date('2026-10-11T12:00:00Z');
    vi.setSystemTime(startTime);

    await roomsService.markRoomEmpty(room.roomCode, 5 * 60 * 1000);

    // Jump 10 minutes forward
    vi.setSystemTime(new Date('2026-10-11T12:10:00Z'));

    const expiredCount = await roomsService.expireDueRooms();
    expect(expiredCount).toBe(1);

    const stored = roomStore.get(room.roomCode);
    expect(stored.status).toBe('EXPIRED');
    expect(stored.endedReason).toBe('EMPTY_TIMEOUT');
  });

  it('Scenario 6: Survives server restart - onModuleInit sweeps and marks due rooms expired', async () => {
    const room = await roomsService.createRoom({
      name: 'Restart Recovery Room',
      personality: 'couple',
      ipHash: 'ip1',
    });

    const startTime = new Date('2026-10-11T12:00:00Z');
    vi.setSystemTime(startTime);

    await roomsService.markRoomEmpty(room.roomCode, 5 * 60 * 1000);

    // Server goes down; 10 minutes pass; server boots up
    vi.setSystemTime(new Date('2026-10-11T12:10:00Z'));

    const newServiceInstance = new RoomsService(mockRoomModel);
    newServiceInstance.onModuleInit();

    // Give microtasks time to settle
    await new Promise((r) => setTimeout(r, 10));

    const stored = roomStore.get(room.roomCode);
    expect(stored.status).toBe('EXPIRED');
    newServiceInstance.onModuleDestroy();
  });

  it('Scenario 7: Arbitrary uncreated room codes entered directly in URL are strictly rejected with NotFoundException and do not auto-create rooms', async () => {
    const randomCode = 'GTEKHZEF';
    // Must strictly reject non-existent room code
    await expect(roomsService.validateAndJoinRoom(randomCode)).rejects.toThrow(NotFoundException);
    await expect(roomsService.getRoomByCode(randomCode)).rejects.toThrow(NotFoundException);
    // Verify room was NOT auto-created in store
    expect(roomStore.get(randomCode)).toBeUndefined();
  });
});
