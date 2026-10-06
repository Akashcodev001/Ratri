export type Role = 'HOST' | 'MODERATOR' | 'MEMBER' | 'GUEST';
export type RoomStatus = 'CREATED' | 'ACTIVE' | 'IDLE' | 'EXPIRED' | 'ENDED';
export type RoomMode = 'VC' | 'WATCH' | 'SCREEN_SHARE' | 'MUSIC' | 'GAME' | 'CHILL';
export type Personality = 'movie-night' | 'music-party' | 'meme-night' | 'gaming' | 'chill' | 'couple' | 'party' | 'study';
export type Capability = 'playback.control' | 'media.change' | 'queue.edit' | 'screen.share' | 'mic.use' | 'camera.use' | 'chat.send' | 'chat.gif' | 'reaction.send' | 'invite' | 'room.lock' | 'member.kick' | 'member.mute' | 'role.assign' | 'chat.clear' | 'room.end';
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
export interface Participant {
    id: string;
    socketId: string;
    name: string;
    isHost: boolean;
    micOn: boolean;
    videoOn: boolean;
    isScreenSharing?: boolean;
    avatarUrl?: string;
    role?: Role;
}
export type GameId = 'trivia-clash' | 'word-dash' | 'emoji-riddle' | 'math-blitz' | 'memory-matrix';
export interface GamePlayer {
    socketId: string;
    name: string;
    score: number;
    isReady: boolean;
    avatarUrl?: string;
    lastAnswer?: string;
    isCorrect?: boolean;
}
export interface GameQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    timeLimitSeconds: number;
    category?: string;
    hint?: string;
    emojiCode?: string;
}
export interface GameSession {
    gameId: GameId;
    title: string;
    description?: string;
    sessionId: string;
    status: 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';
    players: GamePlayer[];
    spectators: string[];
    maxPlayers: number;
    minPlayers: number;
    currentQuestionIndex: number;
    totalQuestions: number;
    currentQuestion?: GameQuestion;
    timerSeconds: number;
    winnerSocketId?: string;
}
export interface RoomStatePayload {
    roomCode: string;
    mode: RoomMode;
    previousMode: RoomMode;
    videoUrl?: string;
    videoId?: string;
    isPlaying?: boolean;
    currentTime?: number;
    activePresenterSocketId?: string;
    activePresenterName?: string;
    activeGame?: GameSession;
}
