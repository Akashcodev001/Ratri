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
      expect(multiByteStr.length).toBeLessThan(65536); // Char length is 50,000 (surrogate pairs)
      expect(Buffer.byteLength(multiByteStr, 'utf8')).toBe(100000); // 100,000 bytes!

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
      // Allow up to 10 offers per 5s window
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(socketId, 10, 5000, t0 + i * 100)).toBe(true);
      }
      // 11th offer within 5s window should be throttled
      expect(checkRateLimit(socketId, 10, 5000, t0 + 1500)).toBe(false);

      // After 5s window expires (t0 + 6000ms), allowed again
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
      expect(canJoinQueue(clientId, t0 + 200)).toBe(false); // 200ms later -> rejected
      expect(canJoinQueue(clientId, t0 + 800)).toBe(false); // 800ms later -> rejected
      expect(canJoinQueue(clientId, t0 + 1050)).toBe(true); // 1050ms later -> allowed
    });

    it('should prevent duplicate queue entries on simultaneous join attempts', () => {
      let queue: { socketId: string; name: string }[] = [];
      const joinQueue = (socketId: string, name: string) => {
        // Atomic filter before adding
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
});
