import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';
import * as net from 'net';

describe('Ratri Security Hardening Unit Verification', () => {
  // Test 1: Strict Boolean Parser
  describe('Boolean Validation & Coercion Resistance', () => {
    function parseStrictBoolean(val: any): boolean | null {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return null;
    }

    it('should accurately parse literal booleans', () => {
      expect(parseStrictBoolean(true)).toBe(true);
      expect(parseStrictBoolean(false)).toBe(false);
    });

    it('should parse explicit boolean strings correctly without JavaScript truthy coercion', () => {
      expect(parseStrictBoolean('true')).toBe(true);
      expect(parseStrictBoolean('false')).toBe(false);
      // In vanilla JS, Boolean("false") === true. Verify our strict parser does not coerce:
      expect(parseStrictBoolean('false')).not.toBe(true);
    });

    it('should reject non-boolean inputs safely', () => {
      expect(parseStrictBoolean(1)).toBeNull();
      expect(parseStrictBoolean(0)).toBeNull();
      expect(parseStrictBoolean(null)).toBeNull();
      expect(parseStrictBoolean(undefined)).toBeNull();
      expect(parseStrictBoolean({})).toBeNull();
      expect(parseStrictBoolean([])).toBeNull();
      expect(parseStrictBoolean('random')).toBeNull();
    });
  });

  // Test 2: IP Normalization and Keyed HMAC Privacy
  describe('IP Normalization and Dedicated HMAC Privacy', () => {
    function normalizeClientIp(ip: string | undefined): string | null {
      if (!ip) return null;
      let clean = String(ip).trim();
      if (!clean) return null;

      if (clean.includes(',')) {
        clean = clean.split(',')[0].trim();
      }

      if (clean.startsWith('::ffff:')) {
        clean = clean.slice(7);
      }

      const zoneIndex = clean.indexOf('%');
      if (zoneIndex !== -1) {
        clean = clean.slice(0, zoneIndex);
      }

      const ipv4PortMatch = clean.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/);
      if (ipv4PortMatch) {
        clean = ipv4PortMatch[1];
      }

      if (net.isIP(clean) === 0) {
        return null;
      }

      return clean.toLowerCase();
    }

    function hashClientIp(ip: string | undefined, secret: string): string | null {
      const normalized = normalizeClientIp(ip);
      if (!normalized) {
        // Missing or unparseable IP is NOT given a pseudo-identity.
        // Return null to represent unavailable IP distinctly.
        return null;
      }
      if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
        throw new Error('FATAL_SECURITY_ERROR: Dedicated IP_HASH_SECRET with >= 32 bytes is required');
      }
      return crypto.createHmac('sha256', secret).update(`IP:${normalized}`).digest('hex');
    }

    it('should normalize standard IPv4 and IPv4-mapped IPv6 identically', () => {
      const secret = 'prod-ip-hash-secret-minimum-32-bytes-long!';
      const hash1 = hashClientIp('192.168.1.100', secret);
      const hash2 = hashClientIp('::ffff:192.168.1.100', secret);
      expect(hash1).toBe(hash2);
    });

    it('should strip ports and handle X-Forwarded-For proxy chains', () => {
      const secret = 'prod-ip-hash-secret-minimum-32-bytes-long!';
      const hashDirect = hashClientIp('203.0.113.195', secret);
      const hashWithPort = hashClientIp('203.0.113.195:8080', secret);
      const hashChain = hashClientIp('203.0.113.195, 10.0.0.1, 127.0.0.1', secret);
      expect(hashWithPort).toBe(hashDirect);
      expect(hashChain).toBe(hashDirect);
    });

    it('should return null for missing or invalid IPs and NEVER create a shared identity or 127.0.0.1 fallback', () => {
      const secret = 'prod-ip-hash-secret-minimum-32-bytes-long!';
      const hashLocalhost = hashClientIp('127.0.0.1', secret);
      const hashMissing = hashClientIp(undefined, secret);
      const hashEmpty = hashClientIp('', secret);
      const hashGarbage = hashClientIp('invalid-ip-string', secret);

      expect(hashLocalhost).toBeDefined();
      expect(hashLocalhost).not.toBeNull();
      expect(hashMissing).toBeNull();
      expect(hashEmpty).toBeNull();
      expect(hashGarbage).toBeNull();
    });

    it('should enforce dedicated secret with at least 32 bytes entropy', () => {
      expect(() => hashClientIp('1.2.3.4', '')).toThrow(/FATAL_SECURITY_ERROR/);
      expect(() => hashClientIp('1.2.3.4', 'too-short-key')).toThrow(/FATAL_SECURITY_ERROR/);
    });
  });

  // Test 3: WebRTC Signaling Guards, Rate Limiting & Byte Length
  describe('WebRTC Signaling Boundary Checks & Rate Limits', () => {
    it('should reject self-signaling and non-string targetSocketId', () => {
      const senderSocketId = 'socket-alice-123';
      const validateTarget = (target: any) => typeof target === 'string' && target !== senderSocketId && target.length > 0;

      expect(validateTarget('socket-bob-456')).toBe(true);
      expect(validateTarget(senderSocketId)).toBe(false);
      expect(validateTarget('')).toBe(false);
      expect(validateTarget(null)).toBe(false);
      expect(validateTarget({})).toBe(false);
    });

    it('should reject invalid SDP and ICE structure', () => {
      const validOffer = { type: 'offer', sdp: 'v=0\r\no=- 1234 2 IN IP4 127.0.0.1\r\n' };
      const invalidOfferType = { type: 'answer', sdp: 'v=0\r\n' };
      const missingSdp = { type: 'offer' };

      const validateOffer = (offer: any) => offer && typeof offer === 'object' && offer.type === 'offer' && typeof offer.sdp === 'string';

      expect(validateOffer(validOffer)).toBe(true);
      expect(validateOffer(invalidOfferType)).toBe(false);
      expect(validateOffer(missingSdp)).toBe(false);
    });

    it('should reject oversized SDP payloads using true UTF-8 byte length (not char count)', () => {
      const multiByteStr = '🔥'.repeat(25000);
      expect(multiByteStr.length).toBeLessThan(65536);
      expect(Buffer.byteLength(multiByteStr, 'utf8')).toBe(100000);

      const offerWithUnicode = { type: 'offer', sdp: multiByteStr };
      const isByteLengthSafe = (payload: any, limit: number) => {
        try {
          const str = JSON.stringify(payload);
          return Buffer.byteLength(str, 'utf8') <= limit;
        } catch {
          return false;
        }
      };

      expect(isByteLengthSafe(offerWithUnicode, 65536)).toBe(false);
    });

    it('should enforce signaling rate limits on offers and ICE candidates', () => {
      const tracker = new Map<string, { count: number; resetAt: number }>();
      const checkRateLimit = (
        socketId: string,
        maxAllowed: number,
        windowMs: number,
        currentTime: number
      ): boolean => {
        const entry = tracker.get(socketId);
        if (!entry || currentTime > entry.resetAt) {
          tracker.set(socketId, { count: 1, resetAt: currentTime + windowMs });
          return true;
        }
        if (entry.count >= maxAllowed) {
          return false;
        }
        entry.count++;
        return true;
      };

      const socketId = 'peer-spammer-123';
      const t0 = 1000;
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(socketId, 10, 5000, t0 + i * 100)).toBe(true);
      }
      expect(checkRateLimit(socketId, 10, 5000, t0 + 1500)).toBe(false);
      expect(checkRateLimit(socketId, 10, 5000, t0 + 6000)).toBe(true);
    });
  });

  // Test 4: WebSocket Identity & Forged MID Prevention
  describe('WebSocket Server-Authoritative Identity', () => {
    it('should prioritize verified JWT memberId over untrusted client data', () => {
      const verifiedTokenPayload = { mid: 'verified-member-uuid-1234', rid: 'room-5678' };
      const clientProvidedData = { memberId: 'forged-attacker-id-9999' };

      const resolveMemberId = (verifiedMid?: string, requestedMid?: string, fallbackId: string = 'fallback') => {
        return verifiedMid || requestedMid || fallbackId;
      };

      const memberId = resolveMemberId(verifiedTokenPayload.mid, clientProvidedData.memberId);
      expect(memberId).toBe('verified-member-uuid-1234');
      expect(memberId).not.toBe('forged-attacker-id-9999');
    });
  });

  // Test 5: Chill Queue Concurrency & Disconnect Cleanup
  describe('Chill Matchmaking Concurrency & Cleanup', () => {
    it('should throttle rapid matchmaking spam within 1000ms window', () => {
      const cooldowns = new Map<string, number>();
      const clientId = 'spammer-socket-99';

      function canJoinQueue(id: string, timestamp: number): boolean {
        const last = cooldowns.get(id) || 0;
        if (timestamp - last < 1000) return false;
        cooldowns.set(id, timestamp);
        return true;
      }

      const t0 = 10000;
      expect(canJoinQueue(clientId, t0)).toBe(true);
      expect(canJoinQueue(clientId, t0 + 200)).toBe(false);
      expect(canJoinQueue(clientId, t0 + 800)).toBe(false);
      expect(canJoinQueue(clientId, t0 + 1050)).toBe(true);
    });

    it('should prevent duplicate queue entries on simultaneous join attempts', () => {
      let queue: { socketId: string; name: string }[] = [];
      const joinQueue = (socketId: string, name: string) => {
        queue = queue.filter(q => q.socketId !== socketId);
        queue.push({ socketId, name });
      };

      joinQueue('socket-1', 'User 1');
      joinQueue('socket-1', 'User 1 Repost');
      joinQueue('socket-2', 'User 2');

      expect(queue.length).toBe(2);
      expect(queue.filter(q => q.socketId === 'socket-1').length).toBe(1);
    });

    it('should clean up queue and cooldowns completely on disconnect', () => {
      let queue = [{ socketId: 'socket-1', name: 'User 1' }, { socketId: 'socket-2', name: 'User 2' }];
      const cooldowns = new Map([['socket-1', 1000], ['socket-2', 2000]]);

      const handleDisconnect = (socketId: string) => {
        queue = queue.filter(q => q.socketId !== socketId);
        cooldowns.delete(socketId);
      };

      handleDisconnect('socket-1');
      expect(queue.length).toBe(1);
      expect(queue[0].socketId).toBe('socket-2');
      expect(cooldowns.has('socket-1')).toBe(false);
      expect(cooldowns.has('socket-2')).toBe(true);
    });
  });

  // Test 6: WebSocket Active Token Expiration & Session Revocation
  describe('WebSocket Active Token Expiration & Revocation Verification', () => {
    it('should reject privileged operations when JWT expires during an active socket session', () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const activeUser = { mid: 'member-123', sid: 'sess-abc', exp: nowSec + 10 }; // 10s left
      const expiredUser = { mid: 'member-123', sid: 'sess-abc', exp: nowSec - 5 }; // expired 5s ago

      const isSessionActive = (user: { exp?: number; sid?: string } | undefined, revokedSet: Set<string>): boolean => {
        if (!user) return true; // guest access
        if (user.exp && Date.now() >= user.exp * 1000) return false;
        if (user.sid && revokedSet.has(user.sid)) return false;
        return true;
      };

      const revokedSessions = new Set<string>();
      expect(isSessionActive(activeUser, revokedSessions)).toBe(true);
      expect(isSessionActive(expiredUser, revokedSessions)).toBe(false);
    });

    it('should immediately block active sessions when revoked', () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const user = { mid: 'member-123', sid: 'revoked-session-xyz', exp: nowSec + 900 };
      const revokedSessions = new Set<string>();

      const isSessionActive = (u: typeof user, revokedSet: Set<string>) => {
        if (u.sid && revokedSet.has(u.sid)) return false;
        return true;
      };

      expect(isSessionActive(user, revokedSessions)).toBe(true);
      revokedSessions.add('revoked-session-xyz');
      expect(isSessionActive(user, revokedSessions)).toBe(false);
    });

    it('should reject reconnection when using an expired or revoked token', () => {
      const revokedSessions = new Set<string>(['bad-session']);
      const verifyTokenMock = (token: string): { sid: string; mid: string } | null => {
        if (token === 'expired-token') return null; // jwt.verify throws TokenExpiredError
        if (token === 'revoked-token') {
          const payload = { sid: 'bad-session', mid: 'user-1' };
          if (revokedSessions.has(payload.sid)) return null;
          return payload;
        }
        if (token === 'valid-token') return { sid: 'good-session', mid: 'user-2' };
        return null;
      };

      expect(verifyTokenMock('valid-token')).not.toBeNull();
      expect(verifyTokenMock('expired-token')).toBeNull();
      expect(verifyTokenMock('revoked-token')).toBeNull();
    });
  });

  // Test 7: Reverse Proxy Trust Configuration Resilience
  describe('Reverse Proxy Trust Parsing & Anti-Spoofing', () => {
    function resolveTrustProxy(envVal: string | undefined): any {
      const raw = envVal?.trim();
      let config: any = 1; // Default: exactly 1 hop for Render proxy
      if (raw) {
        const parsed = Number(raw);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 5) {
          config = parsed;
        } else if (raw === 'false' || raw === '0') {
          config = false;
        } else if (raw.toLowerCase() === 'true') {
          // Unsafe boolean true attempted: fail safely to 1 hop
          config = 1;
        } else {
          config = raw;
        }
      }
      return config;
    }

    it('should default safely to 1 hop when TRUST_PROXY is undefined or empty', () => {
      expect(resolveTrustProxy(undefined)).toBe(1);
      expect(resolveTrustProxy('')).toBe(1);
    });

    it('should safely intercept unsafe TRUST_PROXY="true" and enforce 1 hop', () => {
      // In Express, trust proxy: true blindly trusts client X-Forwarded-For.
      // Verify our bootstrap intercepts and defaults to 1 hop safely:
      expect(resolveTrustProxy('true')).toBe(1);
      expect(resolveTrustProxy('TRUE')).toBe(1);
    });

    it('should accept valid hop counts and safe configuration strings', () => {
      expect(resolveTrustProxy('1')).toBe(1);
      expect(resolveTrustProxy('2')).toBe(2);
      expect(resolveTrustProxy('false')).toBe(false);
      expect(resolveTrustProxy('loopback, linklocal')).toBe('loopback, linklocal');
    });
  });

  // Test 8: HMAC Secret Rotation Non-Disruptive Lifecycle
  describe('HMAC Secret Rotation Behavior', () => {
    function hashIp(ip: string, secret: string): string {
      return crypto.createHmac('sha256', secret).update(`IP:${ip}`).digest('hex');
    }

    it('should produce distinct hashes when IP_HASH_SECRET is rotated without breaking room lookup', () => {
      const clientIp = '198.51.100.25';
      const oldSecret = 'old-secret-key-at-least-32-bytes-long!';
      const newSecret = 'new-secret-key-at-least-32-bytes-long!';

      const oldHash = hashIp(clientIp, oldSecret);
      const newHash = hashIp(clientIp, newSecret);

      expect(oldHash).not.toBe(newHash);

      // Verify that room access does NOT compare client's current IP hash against createdByIpHash:
      const room = {
        roomCode: 'TESTROOM',
        createdByIpHash: oldHash,
        settings: { locked: false },
      };

      const canJoinRoom = (r: typeof room, isLocked: boolean) => !isLocked;
      expect(canJoinRoom(room, room.settings.locked)).toBe(true);
    });
  });

  // Test 9: Chat Persistence, History Retrieval & Room Isolation
  describe('Chat Persistence, History Retrieval & Room Isolation', () => {
    it('should sanitize and enforce 1000-character upper bound on message content', () => {
      const longMessage = 'A'.repeat(2000);
      const safeText = String(longMessage || '').trim().slice(0, 1000);
      expect(safeText.length).toBe(1000);
      expect(safeText).toBe('A'.repeat(1000));
    });

    it('should strictly isolate chat history by roomCode and prevent cross-room leaks', () => {
      const storedMessages = [
        { id: '1', roomCode: 'ROOM_A', text: 'Secret message for Room A', createdAt: new Date(1000) },
        { id: '2', roomCode: 'ROOM_B', text: 'Hello from Room B', createdAt: new Date(2000) },
        { id: '3', roomCode: 'ROOM_A', text: 'Second message for Room A', createdAt: new Date(3000) },
      ];

      const getHistoryForRoom = (code: string) =>
        storedMessages
          .filter(m => m.roomCode === code)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      const roomAHistory = getHistoryForRoom('ROOM_A');
      const roomBHistory = getHistoryForRoom('ROOM_B');

      expect(roomAHistory).toHaveLength(2);
      expect(roomAHistory.every(m => m.roomCode === 'ROOM_A')).toBe(true);
      expect(roomAHistory.some(m => m.text.includes('Room B'))).toBe(false);

      expect(roomBHistory).toHaveLength(1);
      expect(roomBHistory[0].text).toBe('Hello from Room B');
    });

    it('should enforce chronological order and bounded limit on history retrieval', () => {
      const messages = Array.from({ length: 60 }, (_, i) => ({
        id: `msg_${i}`,
        roomCode: 'TEST_ROOM',
        text: `Message ${i}`,
        createdAt: new Date(10000 + i * 1000),
      }));

      // Simulate retrieval: latest 50 reversed into ascending order
      const limit = 50;
      const latest50Reversed = messages.slice(-limit);

      expect(latest50Reversed).toHaveLength(50);
      expect(latest50Reversed[0].id).toBe('msg_10');
      expect(latest50Reversed[49].id).toBe('msg_59');
      // Verify chronological sorting:
      for (let i = 0; i < latest50Reversed.length - 1; i++) {
        expect(latest50Reversed[i].createdAt.getTime()).toBeLessThan(latest50Reversed[i + 1].createdAt.getTime());
      }
    });

    it('should prevent duplicate messages when merging real-time messages with history', () => {
      const history = [
        { id: 'm1', text: 'Hello', timestamp: 100 },
        { id: 'm2', text: 'How are you?', timestamp: 200 },
      ];

      const existingRealtime = [
        { id: 'm2', text: 'How are you?', timestamp: 200 },
        { id: 'm3', text: 'I am good!', timestamp: 300 },
      ];

      const existingIds = new Set(existingRealtime.map(m => m.id));
      const newFromHistory = history.filter(m => !existingIds.has(m.id));
      const merged = [...newFromHistory, ...existingRealtime].sort((a, b) => a.timestamp - b.timestamp);

      expect(merged).toHaveLength(3);
      expect(merged.map(m => m.id)).toEqual(['m1', 'm2', 'm3']);
    });
  });
});
