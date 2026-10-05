import { z } from 'zod';
export declare const RoleSchema: z.ZodEnum<["HOST", "MODERATOR", "MEMBER", "GUEST"]>;
export declare const RoomStatusSchema: z.ZodEnum<["CREATED", "ACTIVE", "IDLE", "EXPIRED", "ENDED"]>;
export declare const PersonalitySchema: z.ZodEnum<["movie-night", "music-party", "meme-night", "gaming", "chill", "couple", "party", "study"]>;
export declare const CapabilitySchema: z.ZodEnum<["playback.control", "media.change", "queue.edit", "screen.share", "mic.use", "camera.use", "chat.send", "chat.gif", "reaction.send", "invite", "room.lock", "member.kick", "member.mute", "role.assign", "chat.clear", "room.end"]>;
export declare const RoomSettingsSchema: z.ZodObject<{
    name: z.ZodString;
    personality: z.ZodEnum<["movie-night", "music-party", "meme-night", "gaming", "chill", "couple", "party", "study"]>;
    maxParticipants: z.ZodNumber;
    locked: z.ZodBoolean;
    requireApproval: z.ZodBoolean;
    slowModeSeconds: z.ZodNumber;
    waitForEveryoneBuffering: z.ZodBoolean;
    restoreHostOnReturn: z.ZodBoolean;
    allowGifs: z.ZodBoolean;
    capabilities: z.ZodRecord<z.ZodEnum<["playback.control", "media.change", "queue.edit", "screen.share", "mic.use", "camera.use", "chat.send", "chat.gif", "reaction.send", "invite", "room.lock", "member.kick", "member.mute", "role.assign", "chat.clear", "room.end"]>, z.ZodArray<z.ZodEnum<["HOST", "MODERATOR", "MEMBER", "GUEST"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    personality: "movie-night" | "music-party" | "meme-night" | "gaming" | "chill" | "couple" | "party" | "study";
    maxParticipants: number;
    locked: boolean;
    requireApproval: boolean;
    slowModeSeconds: number;
    waitForEveryoneBuffering: boolean;
    restoreHostOnReturn: boolean;
    allowGifs: boolean;
    capabilities: Partial<Record<"playback.control" | "media.change" | "queue.edit" | "screen.share" | "mic.use" | "camera.use" | "chat.send" | "chat.gif" | "reaction.send" | "invite" | "room.lock" | "member.kick" | "member.mute" | "role.assign" | "chat.clear" | "room.end", ("HOST" | "MODERATOR" | "MEMBER" | "GUEST")[]>>;
}, {
    name: string;
    personality: "movie-night" | "music-party" | "meme-night" | "gaming" | "chill" | "couple" | "party" | "study";
    maxParticipants: number;
    locked: boolean;
    requireApproval: boolean;
    slowModeSeconds: number;
    waitForEveryoneBuffering: boolean;
    restoreHostOnReturn: boolean;
    allowGifs: boolean;
    capabilities: Partial<Record<"playback.control" | "media.change" | "queue.edit" | "screen.share" | "mic.use" | "camera.use" | "chat.send" | "chat.gif" | "reaction.send" | "invite" | "room.lock" | "member.kick" | "member.mute" | "role.assign" | "chat.clear" | "room.end", ("HOST" | "MODERATOR" | "MEMBER" | "GUEST")[]>>;
}>;
