import { z } from 'zod';
import type { Personality, Capability, Role } from '@ratri/types';

export const RoleSchema = z.enum(['HOST', 'MODERATOR', 'MEMBER', 'GUEST']);
export const RoomStatusSchema = z.enum(['CREATED', 'ACTIVE', 'IDLE', 'EXPIRED', 'ENDED']);
export const PersonalitySchema = z.enum(['movie-night', 'music-party', 'meme-night', 'gaming', 'chill', 'couple', 'party', 'study']);

export const CapabilitySchema = z.enum([
  'playback.control', 'media.change', 'queue.edit',
  'screen.share', 'mic.use', 'camera.use',
  'chat.send', 'chat.gif', 'reaction.send',
  'invite', 'room.lock', 'member.kick', 'member.mute',
  'role.assign', 'chat.clear', 'room.end'
]);

export const RoomSettingsSchema = z.object({
  name: z.string().min(1).max(40),
  personality: PersonalitySchema,
  maxParticipants: z.number().min(2).max(8),
  locked: z.boolean(),
  requireApproval: z.boolean(),
  slowModeSeconds: z.number().min(0).max(60),
  waitForEveryoneBuffering: z.boolean(),
  restoreHostOnReturn: z.boolean(),
  allowGifs: z.boolean(),
  capabilities: z.record(CapabilitySchema, z.array(RoleSchema)),
});
