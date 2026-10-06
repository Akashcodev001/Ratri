import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RoomMode, Participant, GameSession, GameId } from '@ratri/types';
import { GameEngine } from './game-engine';
import { AuthService } from '../auth/auth.service';

interface ServerRoomState {
  roomCode: string;
  mode: RoomMode;
  previousMode: RoomMode;
  videoUrl: string;
  videoId?: string;
  isPlaying: boolean;
  currentTime: number;
  lastUpdated: number;
  activePresenterSocketId?: string;
  activePresenterName?: string;
  gameSession?: GameSession;
  gameTimerInterval?: any;
}

const getCorsOrigin = () => {
  const envOrigin = process.env.CLIENT_ORIGIN;
  if (envOrigin) {
    return envOrigin.split(',').map(o => o.trim());
  }
  return ['http://localhost:5173', 'http://127.0.0.1:5173'];
};

@WebSocketGateway({
  cors: {
    origin: getCorsOrigin(),
    credentials: true,
  },
  transports: ['polling', 'websocket'],
  pingInterval: 10000,
  pingTimeout: 5000,
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('RoomsGateway');
  private roomParticipants = new Map<string, Map<string, Participant>>();
  private roomStates = new Map<string, ServerRoomState>();
  private chillQueue: { socketId: string; displayName: string; topic: string }[] = [];

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const rawToken = client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (rawToken) {
      const token = typeof rawToken === 'string' && rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
      const userPayload = await this.authService.verifyToken(token as string);
      if (userPayload) {
        client.data.user = userPayload;
        this.logger.log(`Client authenticated: ${client.id} (Member: ${userPayload.mid}, Room: ${userPayload.rid})`);
        return;
      }
    }
    this.logger.log(`Client connected (Guest/Unauthenticated): ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.leaveAllRooms(client);
  }

  private sanitizeString(val: any, maxLen: number = 100): string {
    if (typeof val !== 'string') return '';
    return val
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .trim()
      .slice(0, maxLen);
  }

  private getClientRoomCode(client: Socket): string | null {
    for (const [code, participantsMap] of this.roomParticipants.entries()) {
      if (participantsMap.has(client.id)) {
        return code;
      }
    }
    return null;
  }

  private isRoomMember(client: Socket, roomCode: string): boolean {
    const code = this.sanitizeString(roomCode, 20).toUpperCase();
    if (!code) return false;
    const participantsMap = this.roomParticipants.get(code);
    return !!participantsMap?.has(client.id);
  }

  private isHost(client: Socket, roomCode: string): boolean {
    const code = this.sanitizeString(roomCode, 20).toUpperCase();
    if (!code) return false;
    const participantsMap = this.roomParticipants.get(code);
    const participant = participantsMap?.get(client.id);
    return participant?.isHost === true;
  }

  private getOrCreateRoomState(code: string): ServerRoomState {
    const safeCode = this.sanitizeString(code, 20).toUpperCase();
    if (!this.roomStates.has(safeCode)) {
      this.roomStates.set(safeCode, {
        roomCode: safeCode,
        mode: 'VC',
        previousMode: 'VC',
        videoUrl: '',
        isPlaying: false,
        currentTime: 0,
        lastUpdated: Date.now(),
      });
    }
    return this.roomStates.get(safeCode)!;
  }

  private broadcastRoomMode(code: string) {
    const safeCode = this.sanitizeString(code, 20).toUpperCase();
    const state = this.getOrCreateRoomState(safeCode);
    this.server.to(safeCode).emit('room_mode_changed', {
      roomCode: safeCode,
      mode: state.mode,
      previousMode: state.previousMode,
      videoUrl: state.videoUrl,
      videoId: state.videoId,
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      activePresenterSocketId: state.activePresenterSocketId,
      activePresenterName: state.activePresenterName,
      activeGame: state.gameSession,
    });
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode?: string; username?: string; name?: string }
  ) {
    const rawCode = data?.roomCode || '';
    const code = this.sanitizeString(rawCode, 20).toUpperCase();
    if (!code) {
      return { success: false, error: 'INVALID_ROOM_CODE' };
    }

    const rawName = data?.name || data?.username || '';
    const sanitizedName = this.sanitizeString(rawName, 24);

    client.join(code);

    if (!this.roomParticipants.has(code)) {
      this.roomParticipants.set(code, new Map());
    }

    const participantsMap = this.roomParticipants.get(code)!;
    const isHost = participantsMap.size === 0;
    const isChill = code.startsWith('CHILL');

    const participantName = sanitizedName || (isHost ? 'Host' : `Guest ${participantsMap.size + 1}`);

    const participant: Participant = {
      id: client.id,
      socketId: client.id,
      name: participantName,
      isHost,
      micOn: !isChill,
      videoOn: false,
      isScreenSharing: false,
    };

    participantsMap.set(client.id, participant);

    this.logger.log(`User ${participant.name} joined room ${code}`);

    const participantsList = Array.from(participantsMap.values());
    this.server.to(code).emit('room_participants', participantsList);
    client.to(code).emit('user_joined', participant);

    // Send current room state to joining client
    const state = this.getOrCreateRoomState(code);
    client.emit('sync_video_state', {
      videoUrl: state.videoUrl,
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
    });
    client.emit('room_mode_changed', {
      roomCode: code,
      mode: state.mode,
      previousMode: state.previousMode,
      videoUrl: state.videoUrl,
      videoId: state.videoId,
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      activePresenterSocketId: state.activePresenterSocketId,
      activePresenterName: state.activePresenterName,
      activeGame: state.gameSession,
    });

    return { success: true, participant, participants: participantsList };
  }

  @SubscribeMessage('change_room_mode')
  handleChangeRoomMode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; mode: RoomMode }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isHost(client, code)) {
      this.logger.warn(`Unauthorized change_room_mode attempt by socket ${client.id} in room ${code}`);
      return;
    }

    const state = this.getOrCreateRoomState(code);

    if (state.mode !== data.mode) {
      state.previousMode = state.mode;
      state.mode = data.mode;
      this.logger.log(`Room ${code} mode changed to ${data.mode}`);
      this.broadcastRoomMode(code);
    }
  }

  @SubscribeMessage('stop_media')
  handleStopMedia(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isRoomMember(client, code)) {
      return;
    }

    const state = this.getOrCreateRoomState(code);

    this.logger.log(`Stopping active media in room ${code}. Mode was ${state.mode}`);

    if (state.gameTimerInterval) {
      clearInterval(state.gameTimerInterval);
      state.gameTimerInterval = undefined;
    }

    state.videoUrl = '';
    delete state.videoId;
    state.isPlaying = false;
    state.currentTime = 0;
    delete state.activePresenterSocketId;
    delete state.activePresenterName;
    delete state.gameSession;

    // Transition back to previousMode or VC
    const targetMode: RoomMode = (state.previousMode && state.previousMode !== state.mode) ? state.previousMode : 'VC';
    state.previousMode = state.mode;
    state.mode = targetMode;

    this.broadcastRoomMode(code);
    this.server.to(code).emit('media_stopped', { roomCode: code });
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; text: string }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isRoomMember(client, code)) {
      return;
    }

    const sanitizedText = this.sanitizeString(data?.text, 1000);
    if (!sanitizedText) return;

    const participantsMap = this.roomParticipants.get(code);
    const sender = participantsMap?.get(client.id);

    const messagePayload = {
      id: Date.now().toString(),
      sender: sender ? sender.name : 'Guest',
      senderId: client.id,
      text: sanitizedText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.server.to(code).emit('new_message', messagePayload);
  }

  @SubscribeMessage('update_media_state')
  handleMediaState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; micOn: boolean; videoOn: boolean; isScreenSharing?: boolean }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isRoomMember(client, code)) {
      return;
    }

    const participantsMap = this.roomParticipants.get(code);
    const participant = participantsMap?.get(client.id);

    if (participant) {
      participant.micOn = Boolean(data.micOn);
      participant.videoOn = Boolean(data.videoOn);
      if (typeof data.isScreenSharing === 'boolean') {
        participant.isScreenSharing = data.isScreenSharing;
      }
      const participantsList = Array.from(participantsMap!.values());
      this.server.to(code).emit('room_participants', participantsList);
    }
  }

  /* --- WebRTC Signaling Relays with Cross-Room Prevention --- */

  @SubscribeMessage('webrtc_offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId: string; offer: any; isScreenShare?: boolean }
  ) {
    const senderRoomCode = this.getClientRoomCode(client);
    if (!senderRoomCode) return;

    const roomMembers = this.roomParticipants.get(senderRoomCode);
    if (!roomMembers || !roomMembers.has(data?.targetSocketId)) {
      this.logger.warn(`WebRTC offer blocked: socket ${client.id} attempted signaling to target ${data?.targetSocketId} outside room ${senderRoomCode}`);
      return;
    }

    this.server.to(data.targetSocketId).emit('webrtc_offer', {
      senderSocketId: client.id,
      offer: data.offer,
      isScreenShare: data.isScreenShare,
    });
  }

  @SubscribeMessage('webrtc_answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId: string; answer: any }
  ) {
    const senderRoomCode = this.getClientRoomCode(client);
    if (!senderRoomCode) return;

    const roomMembers = this.roomParticipants.get(senderRoomCode);
    if (!roomMembers || !roomMembers.has(data?.targetSocketId)) {
      this.logger.warn(`WebRTC answer blocked: socket ${client.id} attempted signaling to target ${data?.targetSocketId} outside room ${senderRoomCode}`);
      return;
    }

    this.server.to(data.targetSocketId).emit('webrtc_answer', {
      senderSocketId: client.id,
      answer: data.answer,
    });
  }

  @SubscribeMessage('webrtc_ice_candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId: string; candidate: any }
  ) {
    const senderRoomCode = this.getClientRoomCode(client);
    if (!senderRoomCode) return;

    const roomMembers = this.roomParticipants.get(senderRoomCode);
    if (!roomMembers || !roomMembers.has(data?.targetSocketId)) {
      return;
    }

    this.server.to(data.targetSocketId).emit('webrtc_ice_candidate', {
      senderSocketId: client.id,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('broadcast_screen_status')
  handleBroadcastScreenStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; isSharing: boolean }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isRoomMember(client, code)) {
      return;
    }

    const state = this.getOrCreateRoomState(code);
    const participantsMap = this.roomParticipants.get(code);
    const presenter = participantsMap?.get(client.id);

    if (data.isSharing) {
      state.previousMode = state.mode;
      state.mode = 'SCREEN_SHARE';
      state.activePresenterSocketId = client.id;
      state.activePresenterName = presenter?.name || 'Participant';
    } else {
      if (state.mode === 'SCREEN_SHARE') {
        state.mode = state.previousMode !== 'SCREEN_SHARE' ? state.previousMode : 'VC';
        delete state.activePresenterSocketId;
        delete state.activePresenterName;
      }
    }

    this.broadcastRoomMode(code);
    client.to(code).emit('remote_screen_status', {
      senderSocketId: client.id,
      isSharing: Boolean(data.isSharing),
    });
  }

  @SubscribeMessage('send_reaction')
  handleSendReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; emoji: string }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isRoomMember(client, code)) {
      return;
    }

    const cleanEmoji = this.sanitizeString(data?.emoji, 16);
    if (!cleanEmoji) return;

    this.server.to(code).emit('new_reaction', {
      id: Date.now().toString() + Math.random(),
      emoji: cleanEmoji,
      senderId: client.id,
    });
  }

  @SubscribeMessage('sync_video')
  handleSyncVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; videoUrl: string; videoId?: string }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isRoomMember(client, code)) {
      return;
    }

    const cleanVideoUrl = this.sanitizeString(data?.videoUrl, 500);
    const cleanVideoId = this.sanitizeString(data?.videoId, 100);

    const state = this.getOrCreateRoomState(code);

    state.previousMode = state.mode;
    state.mode = 'WATCH';
    state.videoUrl = cleanVideoUrl;
    state.videoId = cleanVideoId;
    state.currentTime = 0;
    state.isPlaying = true;
    state.lastUpdated = Date.now();

    this.broadcastRoomMode(code);
    this.server.to(code).emit('sync_video', {
      videoUrl: cleanVideoUrl,
      videoId: cleanVideoId,
      senderId: client.id,
    });
  }

  @SubscribeMessage('sync_player_action')
  handleSyncPlayerAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; action: 'play' | 'pause' | 'seek'; currentTime?: number }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isRoomMember(client, code)) {
      return;
    }

    const state = this.getOrCreateRoomState(code);
    if (state) {
      if (data.action === 'play') {
        state.isPlaying = true;
      } else if (data.action === 'pause') {
        state.isPlaying = false;
      }
      if (typeof data.currentTime === 'number' && !isNaN(data.currentTime)) {
        state.currentTime = Math.max(0, data.currentTime);
      }
      state.lastUpdated = Date.now();
    }

    client.to(code).emit('player_action', {
      action: data.action,
      currentTime: data.currentTime,
      senderId: client.id,
    });
  }

  /* --- Server-Authoritative Game Engine Handlers --- */

  @SubscribeMessage('game_create')
  handleGameCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; gameId?: GameId }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isHost(client, code)) {
      return;
    }

    const state = this.getOrCreateRoomState(code);
    const participantsMap = this.roomParticipants.get(code);
    const host = participantsMap?.get(client.id);

    const selectedGame = data.gameId || 'trivia-clash';
    state.gameSession = GameEngine.createSession(selectedGame, client.id, host?.name || 'Host');
    state.previousMode = state.mode;
    state.mode = 'GAME';

    this.broadcastRoomMode(code);
  }

  @SubscribeMessage('game_join')
  handleGameJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isRoomMember(client, code)) {
      return;
    }

    const state = this.getOrCreateRoomState(code);
    const participantsMap = this.roomParticipants.get(code);
    const user = participantsMap?.get(client.id);

    if (state.gameSession && user) {
      GameEngine.addPlayer(state.gameSession, client.id, user.name);
      this.broadcastRoomMode(code);
    }
  }

  @SubscribeMessage('game_start')
  handleGameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isHost(client, code)) {
      return;
    }

    const state = this.getOrCreateRoomState(code);

    if (state.gameSession && state.gameSession.status === 'LOBBY') {
      state.gameSession.status = 'IN_PROGRESS';
      this.broadcastRoomMode(code);

      // Start Question Countdown Timer
      if (state.gameTimerInterval) clearInterval(state.gameTimerInterval);

      state.gameTimerInterval = setInterval(() => {
        if (!state.gameSession || state.gameSession.status !== 'IN_PROGRESS') {
          clearInterval(state.gameTimerInterval);
          state.gameTimerInterval = undefined;
          return;
        }

        state.gameSession.timerSeconds -= 1;

        if (state.gameSession.timerSeconds <= 0) {
          const hasMore = GameEngine.advanceNextQuestion(state.gameSession);
          if (!hasMore) {
            clearInterval(state.gameTimerInterval);
            state.gameTimerInterval = undefined;
          }
        }

        this.broadcastRoomMode(code);
      }, 1000);
    }
  }

  @SubscribeMessage('game_submit_answer')
  handleGameSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; questionIndex: number; optionIndex: number }
  ) {
    const code = this.sanitizeString(data?.roomCode, 20).toUpperCase();
    if (!this.isRoomMember(client, code)) {
      return;
    }

    const state = this.getOrCreateRoomState(code);

    if (state.gameSession && state.gameSession.status === 'IN_PROGRESS') {
      const result = GameEngine.processAnswer(
        state.gameSession,
        client.id,
        data.questionIndex,
        data.optionIndex
      );

      this.server.to(code).emit('game_answer_result', {
        socketId: client.id,
        isCorrect: result.isCorrect,
        pointsAwarded: result.pointsAwarded,
      });

      this.broadcastRoomMode(code);
    }
  }

  /* --- Server-Authoritative Random Chill Matchmaking Handlers --- */

  @SubscribeMessage('join_chill_queue')
  handleJoinChillQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { displayName: string; topic: string }
  ) {
    const displayName = this.sanitizeString(data?.displayName, 24) || `ChillUser_${client.id.substring(0, 4)}`;
    const topic = this.sanitizeString(data?.topic, 40) || 'random';

    // Remove client if already in queue
    this.chillQueue = this.chillQueue.filter(q => q.socketId !== client.id);

    // 1. Check if another user is waiting in queue
    const partnerIndex = this.chillQueue.findIndex(q => q.socketId !== client.id);

    if (partnerIndex !== -1) {
      const partner = this.chillQueue.splice(partnerIndex, 1)[0];
      const matchedRoomCode = `CHILL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Initialize room state as CHILL
      const state = this.getOrCreateRoomState(matchedRoomCode);
      state.mode = 'CHILL';

      this.server.to(partner.socketId).emit('chill_matched', {
        roomCode: matchedRoomCode,
        partnerName: displayName,
        topic,
      });

      client.emit('chill_matched', {
        roomCode: matchedRoomCode,
        partnerName: partner.displayName,
        topic,
      });
      return;
    }

    // 2. Check if an active CHILL room exists with 1 waiting participant
    for (const [code, participantsMap] of this.roomParticipants.entries()) {
      if (code.startsWith('CHILL-') && participantsMap.size === 1 && !participantsMap.has(client.id)) {
        const waitingUser = Array.from(participantsMap.values())[0];
        
        client.emit('chill_matched', {
          roomCode: code,
          partnerName: waitingUser.name,
          topic,
        });

        this.server.to(waitingUser.socketId).emit('chill_matched', {
          roomCode: code,
          partnerName: displayName,
          topic,
        });
        return;
      }
    }

    // 3. Otherwise assign a room code, add to queue, and send chill_waiting
    const roomCode = `CHILL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    this.chillQueue.push({
      socketId: client.id,
      displayName,
      topic,
    });
    client.emit('chill_waiting', { status: 'SEARCHING', roomCode });
  }

  @SubscribeMessage('leave_chill_queue')
  handleLeaveChillQueue(@ConnectedSocket() client: Socket) {
    this.chillQueue = this.chillQueue.filter(q => q.socketId !== client.id);
  }

  private leaveAllRooms(client: Socket) {
    this.chillQueue = this.chillQueue.filter(q => q.socketId !== client.id);
    for (const [code, participantsMap] of this.roomParticipants.entries()) {
      if (participantsMap.has(client.id)) {
        const participant = participantsMap.get(client.id);
        participantsMap.delete(client.id);

        const state = this.roomStates.get(code);
        if (state?.gameSession) {
          GameEngine.removePlayer(state.gameSession, client.id);
        }

        const participantsList = Array.from(participantsMap.values());
        this.server.to(code).emit('room_participants', participantsList);
        this.server.to(code).emit('user_left', { id: client.id, name: participant?.name });

        if (participantsMap.size === 0) {
          if (state?.gameTimerInterval) {
            clearInterval(state.gameTimerInterval);
          }
          this.roomParticipants.delete(code);
          this.roomStates.delete(code);
        } else {
          this.broadcastRoomMode(code);
        }
      }
    }
  }
}
