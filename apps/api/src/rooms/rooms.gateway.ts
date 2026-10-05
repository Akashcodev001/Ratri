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
import { RoomMode, Participant, GameSession } from '@ratri/types';
import { GameEngine } from './game-engine';

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

@WebSocketGateway({
  cors: {
    origin: '*',
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

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.leaveAllRooms(client);
  }

  private getOrCreateRoomState(code: string): ServerRoomState {
    if (!this.roomStates.has(code)) {
      this.roomStates.set(code, {
        roomCode: code,
        mode: 'VC',
        previousMode: 'VC',
        videoUrl: '',
        isPlaying: false,
        currentTime: 0,
        lastUpdated: Date.now(),
      });
    }
    return this.roomStates.get(code)!;
  }

  private broadcastRoomMode(code: string) {
    const state = this.getOrCreateRoomState(code);
    this.server.to(code).emit('room_mode_changed', {
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
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; username?: string }
  ) {
    const { roomCode, username } = data;
    const code = roomCode.toUpperCase();
    
    client.join(code);

    if (!this.roomParticipants.has(code)) {
      this.roomParticipants.set(code, new Map());
    }

    const participantsMap = this.roomParticipants.get(code)!;
    const isHost = participantsMap.size === 0;

    const participant: Participant = {
      id: client.id,
      socketId: client.id,
      name: username || (isHost ? 'Host' : `Guest ${participantsMap.size + 1}`),
      isHost,
      micOn: true,
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
    const code = data.roomCode.toUpperCase();
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
    const code = data.roomCode.toUpperCase();
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
    const { roomCode, text } = data;
    const code = roomCode.toUpperCase();
    const participantsMap = this.roomParticipants.get(code);
    const sender = participantsMap?.get(client.id);

    const messagePayload = {
      id: Date.now().toString(),
      sender: sender ? sender.name : 'Guest',
      senderId: client.id,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.server.to(code).emit('new_message', messagePayload);
  }

  @SubscribeMessage('update_media_state')
  handleMediaState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; micOn: boolean; videoOn: boolean; isScreenSharing?: boolean }
  ) {
    const { roomCode, micOn, videoOn, isScreenSharing } = data;
    const code = roomCode.toUpperCase();
    const participantsMap = this.roomParticipants.get(code);
    const participant = participantsMap?.get(client.id);

    if (participant) {
      participant.micOn = micOn;
      participant.videoOn = videoOn;
      if (typeof isScreenSharing === 'boolean') {
        participant.isScreenSharing = isScreenSharing;
      }
      const participantsList = Array.from(participantsMap!.values());
      this.server.to(code).emit('room_participants', participantsList);
    }
  }

  /* --- WebRTC Signaling Relays for Live Camera & Screen Sharing --- */

  @SubscribeMessage('webrtc_offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId: string; offer: any; isScreenShare?: boolean }
  ) {
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
    const code = data.roomCode.toUpperCase();
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
      isSharing: data.isSharing,
    });
  }

  @SubscribeMessage('send_reaction')
  handleSendReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; emoji: string }
  ) {
    const code = data.roomCode.toUpperCase();
    this.server.to(code).emit('new_reaction', {
      id: Date.now().toString() + Math.random(),
      emoji: data.emoji,
      senderId: client.id,
    });
  }

  @SubscribeMessage('sync_video')
  handleSyncVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; videoUrl: string; videoId?: string }
  ) {
    const code = data.roomCode.toUpperCase();
    const state = this.getOrCreateRoomState(code);

    state.previousMode = state.mode;
    state.mode = 'WATCH';
    state.videoUrl = data.videoUrl;
    state.videoId = data.videoId || '';
    state.currentTime = 0;
    state.isPlaying = true;
    state.lastUpdated = Date.now();

    this.broadcastRoomMode(code);
    this.server.to(code).emit('sync_video', {
      videoUrl: data.videoUrl,
      videoId: data.videoId || '',
      senderId: client.id,
    });
  }

  @SubscribeMessage('sync_player_action')
  handleSyncPlayerAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; action: 'play' | 'pause' | 'seek'; currentTime?: number }
  ) {
    const code = data.roomCode.toUpperCase();
    const state = this.getOrCreateRoomState(code);
    if (state) {
      if (data.action === 'play') {
        state.isPlaying = true;
      } else if (data.action === 'pause') {
        state.isPlaying = false;
      }
      if (typeof data.currentTime === 'number') {
        state.currentTime = data.currentTime;
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
    @MessageBody() data: { roomCode: string }
  ) {
    const code = data.roomCode.toUpperCase();
    const state = this.getOrCreateRoomState(code);
    const participantsMap = this.roomParticipants.get(code);
    const host = participantsMap?.get(client.id);

    state.gameSession = GameEngine.createTriviaSession(client.id, host?.name || 'Host');
    state.previousMode = state.mode;
    state.mode = 'GAME';

    this.broadcastRoomMode(code);
  }

  @SubscribeMessage('game_join')
  handleGameJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string }
  ) {
    const code = data.roomCode.toUpperCase();
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
    const code = data.roomCode.toUpperCase();
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
    const code = data.roomCode.toUpperCase();
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

  private leaveAllRooms(client: Socket) {
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
