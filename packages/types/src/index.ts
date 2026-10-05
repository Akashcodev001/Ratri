export type Role = 'HOST' | 'MODERATOR' | 'MEMBER' | 'GUEST';
export type RoomStatus = 'CREATED' | 'ACTIVE' | 'IDLE' | 'EXPIRED' | 'ENDED';
export type Personality = 'movie-night' | 'music-party' | 'meme-night' | 'gaming' | 'chill' | 'couple' | 'party' | 'study';

export type Capability =
  | 'playback.control' | 'media.change' | 'queue.edit'
  | 'screen.share' | 'mic.use' | 'camera.use'
  | 'chat.send' | 'chat.gif' | 'reaction.send'
  | 'invite' | 'room.lock' | 'member.kick' | 'member.mute'
  | 'role.assign' | 'chat.clear' | 'room.end';

export interface RoomSettings {
  name: string;
  personality: Personality;
  maxParticipants: number;
  locked: boolean;
  requireApproval: boolean;
  slowModeSeconds: number;
  waitForEveryoneBuffering: boolean;
  restoreHostOnReturn: boolean;
  allowGifs: boolean;
  capabilities: Record<Capability, Role[]>;
}

export interface PublicRoomInfo {
  roomCode: string;
  name: string;
  status: RoomStatus;
  personality: Personality;
  locked: boolean;
  requiresPassword: boolean;
  requiresApproval: boolean;
  participantCount: number;
  maxParticipants: number;
}
