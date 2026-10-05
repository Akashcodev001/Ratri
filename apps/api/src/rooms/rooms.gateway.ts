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

interface Participant {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  micOn: boolean;
  videoOn: boolean;
  isScreenSharing?: boolean;
}

interface RoomState {
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
  lastUpdated: number;
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
  private roomStates = new Map<string, RoomState>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.leaveAllRooms(client);
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

    // Send current room video state to joining client
    const currentState = this.roomStates.get(code) || {
      videoUrl: '',
      isPlaying: false,
      currentTime: 0,
      lastUpdated: Date.now(),
    };
    client.emit('sync_video_state', currentState);

    return { success: true, participant, participants: participantsList };
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
    const state = this.roomStates.get(code) || {
      videoUrl: data.videoUrl,
      isPlaying: true,
      currentTime: 0,
      lastUpdated: Date.now(),
    };
    state.videoUrl = data.videoUrl;
    state.currentTime = 0;
    state.isPlaying = true;
    state.lastUpdated = Date.now();
    this.roomStates.set(code, state);

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
    const state = this.roomStates.get(code);
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

  private leaveAllRooms(client: Socket) {
    for (const [code, participantsMap] of this.roomParticipants.entries()) {
      if (participantsMap.has(client.id)) {
        const participant = participantsMap.get(client.id);
        participantsMap.delete(client.id);

        const participantsList = Array.from(participantsMap.values());
        this.server.to(code).emit('room_participants', participantsList);
        this.server.to(code).emit('user_left', { id: client.id, name: participant?.name });

        if (participantsMap.size === 0) {
          this.roomParticipants.delete(code);
          this.roomStates.delete(code);
        }
      }
    }
  }
}
