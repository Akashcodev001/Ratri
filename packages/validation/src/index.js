"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomSettingsSchema = exports.CapabilitySchema = exports.PersonalitySchema = exports.RoomStatusSchema = exports.RoleSchema = void 0;
const zod_1 = require("zod");
exports.RoleSchema = zod_1.z.enum(['HOST', 'MODERATOR', 'MEMBER', 'GUEST']);
exports.RoomStatusSchema = zod_1.z.enum(['CREATED', 'ACTIVE', 'IDLE', 'EXPIRED', 'ENDED']);
exports.PersonalitySchema = zod_1.z.enum(['movie-night', 'music-party', 'meme-night', 'gaming', 'chill', 'couple', 'party', 'study']);
exports.CapabilitySchema = zod_1.z.enum([
    'playback.control', 'media.change', 'queue.edit',
    'screen.share', 'mic.use', 'camera.use',
    'chat.send', 'chat.gif', 'reaction.send',
    'invite', 'room.lock', 'member.kick', 'member.mute',
    'role.assign', 'chat.clear', 'room.end'
]);
exports.RoomSettingsSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(40),
    personality: exports.PersonalitySchema,
    maxParticipants: zod_1.z.number().min(2).max(8),
    locked: zod_1.z.boolean(),
    requireApproval: zod_1.z.boolean(),
    slowModeSeconds: zod_1.z.number().min(0).max(60),
    waitForEveryoneBuffering: zod_1.z.boolean(),
    restoreHostOnReturn: zod_1.z.boolean(),
    allowGifs: zod_1.z.boolean(),
    capabilities: zod_1.z.record(exports.CapabilitySchema, zod_1.z.array(exports.RoleSchema)),
});
