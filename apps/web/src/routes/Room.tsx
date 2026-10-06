import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ParticipantTile } from "../components/ParticipantTile";
import { ParticipantPopover } from "../components/ParticipantPopover";
import { GameStage } from "../components/GameStage";
import { GameSelectionModal } from "../components/GameSelectionModal";
import { ChillMatchModal } from "../components/ChillMatchModal";
import { SAMPLE_VIDEOS } from "../utils/sampleVideos";
import type { RoomMode, GameSession, RoomStatePayload, Participant, GameId } from "@ratri/types";
import { 
  Copy, 
  LogOut, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Send, 
  Users, 
  Play, 
  Pause,
  Check,
  Tv,
  StopCircle,
  MessageSquare,
  X,
  Link as LinkIcon,
  GripHorizontal,
  Gamepad2,
  Pin,
  Radio,
  Zap,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

interface ChatMessage {
  id: string;
  sender: string;
  senderId?: string;
  text: string;
  time: string;
  system?: boolean;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

interface DraggablePipProps {
  children: React.ReactNode;
  initialClass: string;
  label: string;
  style?: React.CSSProperties;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const EMOJI_LIST = ["🔥", "🍿", "❤️", "👏", "😂", "🎉"];

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return "http://localhost:3000";
};

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function DraggablePip({ children, initialClass, label, style }: DraggablePipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      const parent = containerRef.current.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const elemRect = containerRef.current.getBoundingClientRect();

        const maxDeltaRight = parentRect.right - elemRect.right;
        const maxDeltaLeft = parentRect.left - elemRect.left;
        const maxDeltaBottom = parentRect.bottom - elemRect.bottom;
        const maxDeltaTop = parentRect.top - elemRect.top;

        const clampedX = Math.min(Math.max(dx, maxDeltaLeft), maxDeltaRight) + dragRef.current.posX;
        const clampedY = Math.min(Math.max(dy, maxDeltaTop), maxDeltaBottom) + dragRef.current.posY;

        setPosition({ x: clampedX, y: clampedY });
      } else {
        setPosition({
          x: dragRef.current.posX + dx,
          y: dragRef.current.posY + dy,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)`, ...style }}
      className={`absolute z-30 transition-transform ${initialClass} ${isDragging ? 'cursor-grabbing scale-105 shadow-2xl z-50' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute top-1.5 left-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-between select-none z-10 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{label}</span>
        </div>
        <GripHorizontal className="w-3 h-3 text-gray-400" />
      </div>
      {children}
    </div>
  );
}

export function Room() {
  const { roomCode } = useParams();
  
  // Realtime & Mode States
  const [roomMode, setRoomMode] = useState<RoomMode>("VC");
  const [activeGameSession, setActiveGameSession] = useState<GameSession | undefined>(undefined);
  const [pinnedSocketId, setPinnedSocketId] = useState<string | null>(null);
  const [popoverParticipant, setPopoverParticipant] = useState<Participant | null>(null);
  const [expandedParticipant, setExpandedParticipant] = useState<Participant | null>(null);

  const [copied, setCopied] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteScreenActive, setRemoteScreenActive] = useState(false);
  const [, setRemoteVideoActive] = useState(false);
  const [remotePresenterName, setRemotePresenterName] = useState("Participant");
  const [showChat, setShowChat] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [remotePresenterSocketId, setRemotePresenterSocketId] = useState<string | null>(null);

  // Video Sync State
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [remoteStreamsMap, setRemoteStreamsMap] = useState<Map<string, MediaStream>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [speakingSocketIds, setSpeakingSocketIds] = useState<Set<string>>(new Set());
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [showChillModal, setShowChillModal] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlName = searchParams.get("name");
  const urlTopic = searchParams.get("topic");

  const isChillMode = roomCode?.toUpperCase().startsWith("CHILL") || roomMode === "CHILL";

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const syncPlayerRef = useRef<HTMLVideoElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const isRemoteActionRef = useRef(false);
  const showChatRef = useRef(showChat);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const makingOfferMapRef = useRef<Map<string, boolean>>(new Map());
  const ignoreOfferMapRef = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    showChatRef.current = showChat;
    if (showChat) {
      setUnreadCount(0);
    }
  }, [showChat]);

  // Active local speaker detection
  useEffect(() => {
    const localId = socketRef.current?.id;
    if (!mediaStreamRef.current || !micOn || !localId) {
      if (localId) {
        setSpeakingSocketIds(prev => {
          const next = new Set(prev);
          next.delete(localId);
          return next;
        });
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(mediaStreamRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let intervalId: any;

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const currentSocketId = socketRef.current?.id;
        if (currentSocketId) {
          if (average > 15) {
            setSpeakingSocketIds(prev => new Set(prev).add(currentSocketId));
          } else {
            setSpeakingSocketIds(prev => {
              const next = new Set(prev);
              next.delete(currentSocketId);
              return next;
            });
          }
        }
      };

      intervalId = setInterval(checkVolume, 200);

      return () => {
        clearInterval(intervalId);
        audioCtx.close().catch(() => {});
      };
    } catch (e) {
      console.error("Audio analyser error", e);
    }
  }, [micOn]);

  // Prompt before unloading browser tab while in room
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const ensureMediaStream = async (withVideo = false): Promise<MediaStream> => {
    let stream = mediaStreamRef.current;
    if (stream) {
      if (withVideo && stream.getVideoTracks().length === 0) {
        try {
          const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const vTrack = vStream.getVideoTracks()[0];
          if (vTrack) stream.addTrack(vTrack);
        } catch (e) {
          console.error("Failed to add video track", e);
        }
      }
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        video: withVideo,
        audio: true,
      });
      mediaStreamRef.current = stream;
    }
    setLocalStream(stream);
    return stream;
  };

  // Load YouTube IFrame API Script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube YT.Player Instance safely
  const activeYtId = extractYouTubeId(activeVideoUrl);
  useEffect(() => {
    if (!activeYtId) return;

    let isMounted = true;
    if (ytContainerRef.current) {
      ytContainerRef.current.innerHTML = '<div id="youtube-player-mount"></div>';
    }

    const createPlayer = () => {
      if (!isMounted) return;
      if (window.YT && window.YT.Player) {
        try {
          ytPlayerRef.current = new window.YT.Player('youtube-player-mount', {
            height: '100%',
            width: '100%',
            videoId: activeYtId,
            playerVars: {
              autoplay: isPlaying ? 1 : 0,
              controls: 1,
              enablejsapi: 1,
              modestbranding: 1,
              rel: 0,
            },
            events: {
              onReady: (event: any) => {
                if (isPlaying) {
                  try { event.target.playVideo(); } catch (e) {}
                }
              },
              onStateChange: (event: any) => {
                if (isRemoteActionRef.current) return;
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                  const curTime = event.target.getCurrentTime();
                  if (socketRef.current && roomCode) {
                    socketRef.current.emit("sync_player_action", { roomCode, action: 'play', currentTime: curTime });
                  }
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                  const curTime = event.target.getCurrentTime();
                  if (socketRef.current && roomCode) {
                    socketRef.current.emit("sync_player_action", { roomCode, action: 'pause', currentTime: curTime });
                  }
                }
              },
            },
          });
        } catch (err) {
          console.error("YouTube Player Error:", err);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }
      if (ytContainerRef.current) {
        ytContainerRef.current.innerHTML = '';
      }
    };
  }, [activeYtId]);

  // Initialize Socket.IO connection & Server-Authoritative State Sync
  useEffect(() => {
    if (!roomCode) return;
    const code = roomCode.toUpperCase();
    const socket = io(getSocketUrl(), {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      console.warn("Socket connection warning:", err.message);
    });

    const emitJoinRoom = () => {
      socket.emit("join_room", { roomCode: code, name: urlName || undefined }, (res: any) => {
        if (res?.participants && Array.isArray(res.participants)) {
          setParticipants(res.participants);
        }
      });
    };

    if (socket.connected) {
      emitJoinRoom();
    }
    socket.on("connect", () => {
      emitJoinRoom();
    });

    // Server Authoritative Room Mode & State Change Handler
    socket.on("room_mode_changed", (data: RoomStatePayload) => {
      if (data.mode) {
        setRoomMode(data.mode);
      }
      if (data.videoUrl) {
        setActiveVideoUrl(data.videoUrl);
        setVideoUrlInput(data.videoUrl);
      }
      if (typeof data.isPlaying === 'boolean') {
        setIsPlaying(data.isPlaying);
      }
      if (typeof data.currentTime === 'number') {
        setCurrentTime(data.currentTime);
      }
      if (data.activePresenterSocketId) {
        setRemotePresenterSocketId(data.activePresenterSocketId);
        setRemoteScreenActive(true);
      }
      if (data.activePresenterName) {
        setRemotePresenterName(data.activePresenterName);
      }
      if (data.activeGame) {
        setActiveGameSession(data.activeGame);
      }
    });

    socket.on("media_stopped", () => {
      setActiveVideoUrl("");
      setVideoUrlInput("");
      setIsPlaying(false);
      setRemoteScreenActive(false);
      setRemotePresenterSocketId(null);
      setActiveGameSession(undefined);
      setRoomMode("VC");
      showToast("⏹️ Media stopped — returned to VC mode");
    });

    socket.on("room_participants", async (updatedParticipants: Participant[]) => {
      setParticipants(updatedParticipants);
      const hasAnyRemoteVideo = updatedParticipants.some(p => p.socketId !== socket.id && p.videoOn);
      setRemoteVideoActive(hasAnyRemoteVideo);

      for (const p of updatedParticipants) {
        if (p.socketId !== socket.id && !peerConnectionsRef.current.has(p.socketId)) {
          if (socket.id && socket.id < p.socketId) {
            safeCreateOffer(p.socketId);
          }
        }
      }
    });

    socket.on("user_joined", async (user: Participant) => {
      showToast(`👋 ${user.name} joined the room`);
      setParticipants(prev => {
        if (prev.some(p => p.socketId === user.socketId)) return prev;
        return [...prev, user];
      });
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          text: `${user.name} joined the room`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          system: true,
        },
      ]);

      if (socket.id && user.socketId !== socket.id && !peerConnectionsRef.current.has(user.socketId)) {
        if (socket.id < user.socketId) {
          safeCreateOffer(user.socketId);
        }
      }
    });

    socket.on("user_left", (user: { id?: string; socketId?: string; name?: string }) => {
      const targetId = user?.socketId || user?.id;
      if (user?.name) {
        showToast(`🚪 ${user.name} left the room`);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "System",
            text: `${user.name} left the room`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            system: true,
          },
        ]);
      }
      if (targetId) {
        makingOfferMapRef.current.delete(targetId);
        ignoreOfferMapRef.current.delete(targetId);
        setRemoteStreamsMap(prev => {
          const next = new Map(prev);
          next.delete(targetId);
          return next;
        });
        if (peerConnectionsRef.current.has(targetId)) {
          peerConnectionsRef.current.get(targetId)?.close();
          peerConnectionsRef.current.delete(targetId);
        }
      }
    });

    socket.on("new_message", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      if (!showChatRef.current) {
        setUnreadCount(prev => prev + 1);
        if (msg.senderId !== socket.id && !msg.system) {
          const textPreview = msg.text.length > 25 ? `${msg.text.slice(0, 25)}...` : msg.text;
          showToast(`💬 ${msg.sender}: ${textPreview}`);
        }
      }
    });

    socket.on("new_reaction", ({ emoji }: { emoji: string }) => {
      const id = Date.now().toString() + Math.random();
      const x = Math.floor(Math.random() * 60) + 20;
      setReactions(prev => [...prev, { id, emoji, x }]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== id));
      }, 2500);
    });

    socket.on("sync_video", ({ videoUrl }: { videoUrl: string }) => {
      if (videoUrl) {
        setActiveVideoUrl(videoUrl);
        setVideoUrlInput(videoUrl);
        setRoomMode("WATCH");
        showToast("🎬 Video stream updated & synced");
      }
    });

    socket.on("player_action", ({ action, currentTime: time }: { action: 'play' | 'pause' | 'seek'; currentTime?: number }) => {
      isRemoteActionRef.current = true;
      const ytPlayer = ytPlayerRef.current;

      if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
        if (action === 'play') {
          if (typeof time === 'number') {
            try { ytPlayer.seekTo(time, true); } catch (e) {}
          }
          try { ytPlayer.playVideo(); } catch (e) {}
          setIsPlaying(true);
        } else if (action === 'pause') {
          if (typeof time === 'number') {
            try { ytPlayer.seekTo(time, true); } catch (e) {}
          }
          try { ytPlayer.pauseVideo(); } catch (e) {}
          setIsPlaying(false);
        } else if (action === 'seek' && typeof time === 'number') {
          try { ytPlayer.seekTo(time, true); } catch (e) {}
          setCurrentTime(time);
        }
      } else {
        const player = syncPlayerRef.current;
        if (player) {
          if (action === 'play') {
            if (typeof time === 'number' && Math.abs(player.currentTime - time) > 1.5) {
              player.currentTime = time;
            }
            player.play().catch(e => console.error("Play sync error", e));
            setIsPlaying(true);
          } else if (action === 'pause') {
            if (typeof time === 'number') {
              player.currentTime = time;
            }
            player.pause();
            setIsPlaying(false);
          } else if (action === 'seek' && typeof time === 'number') {
            player.currentTime = time;
            setCurrentTime(time);
          }
        }
      }

      setTimeout(() => {
        isRemoteActionRef.current = false;
      }, 400);
    });

    socket.on("webrtc_offer", async ({ senderSocketId, offer }: { senderSocketId: string; offer: any }) => {
      try {
        const peer = createPeerConnection(senderSocketId);
        const isMakingOffer = makingOfferMapRef.current.get(senderSocketId) || false;
        const isPolite = socket.id ? socket.id > senderSocketId : false;
        const offerCollision = isMakingOffer || peer.signalingState !== "stable";

        ignoreOfferMapRef.current.set(senderSocketId, !isPolite && offerCollision);

        if (ignoreOfferMapRef.current.get(senderSocketId)) {
          return;
        }

        if (offerCollision && peer.signalingState !== "stable") {
          await peer.setLocalDescription({ type: "rollback" });
        }

        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        if (mediaStreamRef.current) {
          const senders = peer.getSenders();
          mediaStreamRef.current.getTracks().forEach(track => {
            if (!senders.some(s => s.track?.kind === track.kind)) {
              peer.addTrack(track, mediaStreamRef.current!);
            }
          });
        }

        if (peer.signalingState === "have-remote-offer") {
          const answer = await peer.createAnswer();
          if (peer.signalingState === "have-remote-offer") {
            await peer.setLocalDescription(answer);
            socket.emit("webrtc_answer", { targetSocketId: senderSocketId, answer });
          }
        }
      } catch (err) {
        console.warn("Handled WebRTC offer state transition", err);
      }
    });

    socket.on("webrtc_answer", async ({ senderSocketId, answer }: { senderSocketId: string; answer: any }) => {
      try {
        const peer = peerConnectionsRef.current.get(senderSocketId);
        if (peer && peer.signalingState === "have-local-offer") {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.warn("Handled WebRTC answer state transition", err);
      }
    });

    socket.on("webrtc_ice_candidate", async ({ senderSocketId, candidate }: { senderSocketId: string; candidate: any }) => {
      try {
        const peer = peerConnectionsRef.current.get(senderSocketId);
        const ignoreOffer = ignoreOfferMapRef.current.get(senderSocketId);
        if (peer && candidate) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            if (!ignoreOffer) {
              console.warn("Handled ICE candidate addition transition", err);
            }
          }
        }
      } catch (err) {
        console.warn("Handled ICE candidate event transition", err);
      }
    });

    socket.on("remote_screen_status", ({ senderSocketId, isSharing }: { senderSocketId: string; isSharing: boolean }) => {
      setRemoteScreenActive(isSharing);
      if (isSharing) {
        setRemotePresenterSocketId(senderSocketId);
        setRoomMode("SCREEN_SHARE");
      } else {
        setRemotePresenterSocketId(null);
        setRoomMode("VC");
      }
      const presenter = participants.find(p => p.socketId === senderSocketId);
      if (presenter) {
        setRemotePresenterName(presenter.name);
      }
      showToast(isSharing ? `🖥️ ${presenter?.name || 'Participant'} started screen share` : `⏹️ Screen share ended`);
    });

    return () => {
      socket.disconnect();
      stopMediaStream();
      stopScreenShare();
      closeAllPeers();
    };
  }, [roomCode]);

  const safeCreateOffer = async (targetSocketId: string, options?: RTCOfferOptions) => {
    const peer = createPeerConnection(targetSocketId);
    try {
      makingOfferMapRef.current.set(targetSocketId, true);
      if (peer.signalingState !== "stable") return;
      const offer = await peer.createOffer(options);
      if (peer.signalingState !== "stable") return;
      await peer.setLocalDescription(offer);
      socketRef.current?.emit("webrtc_offer", { targetSocketId, offer });
    } catch (err) {
      console.warn("Handled offer creation state transition", err);
    } finally {
      makingOfferMapRef.current.set(targetSocketId, false);
    }
  };

  const createPeerConnection = (targetSocketId: string): RTCPeerConnection => {
    if (peerConnectionsRef.current.has(targetSocketId)) {
      return peerConnectionsRef.current.get(targetSocketId)!;
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current.set(targetSocketId, peer);

    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("webrtc_ice_candidate", {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        setRemoteStreamsMap(prev => {
          const next = new Map(prev);
          next.set(targetSocketId, stream);
          return next;
        });
        if (event.track && event.track.kind === "video") {
          setRemoteVideoActive(true);
        }
      } else if (event.track) {
        const stream = new MediaStream([event.track]);
        setRemoteStreamsMap(prev => {
          const next = new Map(prev);
          next.set(targetSocketId, stream);
          return next;
        });
        if (event.track.kind === "video") {
          setRemoteVideoActive(true);
        }
      }
    };

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, mediaStreamRef.current!);
      });
    }

    return peer;
  };

  const closeAllPeers = () => {
    peerConnectionsRef.current.forEach(peer => peer.close());
    peerConnectionsRef.current.clear();
    makingOfferMapRef.current.clear();
    ignoreOfferMapRef.current.clear();
  };

  // Helper to Stop Active Shared Media & Return to VC Mode
  const handleStopActiveMedia = () => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit("stop_media", { roomCode });
    }
    setActiveVideoUrl("");
    setVideoUrlInput("");
    setIsPlaying(false);
    if (isScreenSharing) {
      stopScreenShare();
    }
    setActiveGameSession(undefined);
    setRoomMode("VC");
    showToast("⏹️ Media stopped — returned to VC mode");
  };

  // Video Load & Synchronization
  const handleLoadVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrlInput.trim()) {
      const url = videoUrlInput.trim();
      setActiveVideoUrl(url);
      setRoomMode("WATCH");
      const ytId = extractYouTubeId(url);
      showToast("🎬 Video URL updated & synced to room");
      if (socketRef.current && roomCode) {
        socketRef.current.emit("sync_video", { roomCode, videoUrl: url, videoId: ytId || "" });
      }
    }
  };

  const handleTogglePlayPause = () => {
    const ytPlayer = ytPlayerRef.current;
    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
      if (isPlaying) {
        ytPlayer.pauseVideo();
        setIsPlaying(false);
        showToast("⏸️ Video Paused");
        if (socketRef.current && roomCode) {
          socketRef.current.emit("sync_player_action", { roomCode, action: 'pause' });
        }
      } else {
        ytPlayer.playVideo();
        setIsPlaying(true);
        showToast("▶️ Video Playing");
        if (socketRef.current && roomCode) {
          socketRef.current.emit("sync_player_action", { roomCode, action: 'play' });
        }
      }
      return;
    }

    const player = syncPlayerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
      showToast("⏸️ Video Paused");
      if (socketRef.current && roomCode) {
        socketRef.current.emit("sync_player_action", { roomCode, action: 'pause', currentTime: player.currentTime });
      }
    } else {
      player.play().catch(e => console.error("Play error", e));
      setIsPlaying(true);
      showToast("▶️ Video Playing");
      if (socketRef.current && roomCode) {
        socketRef.current.emit("sync_player_action", { roomCode, action: 'play', currentTime: player.currentTime });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    const ytPlayer = ytPlayerRef.current;

    if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
      ytPlayer.seekTo(targetTime, true);
      setCurrentTime(targetTime);
      if (socketRef.current && roomCode) {
        socketRef.current.emit("sync_player_action", { roomCode, action: 'seek', currentTime: targetTime });
      }
      return;
    }

    const player = syncPlayerRef.current;
    if (player) {
      player.currentTime = targetTime;
      setCurrentTime(targetTime);
      if (socketRef.current && roomCode) {
        socketRef.current.emit("sync_player_action", { roomCode, action: 'seek', currentTime: targetTime });
      }
    }
  };

  // Camera & Mic Toggles
  const toggleCamera = async () => {
    try {
      const nextVideo = !videoOn;
      setVideoOn(nextVideo);

      if (!nextVideo) {
        if (mediaStreamRef.current) {
          const videoTracks = mediaStreamRef.current.getVideoTracks();
          videoTracks.forEach(track => {
            track.stop();
            mediaStreamRef.current?.removeTrack(track);
          });
        }
        
        const remainingTracks = mediaStreamRef.current ? mediaStreamRef.current.getTracks() : [];
        const updatedStream = remainingTracks.length > 0 ? new MediaStream(remainingTracks) : null;
        mediaStreamRef.current = updatedStream;
        setLocalStream(updatedStream);

        for (const [, peer] of peerConnectionsRef.current.entries()) {
          const senders = peer.getSenders();
          const videoSender = senders.find(s => s.track?.kind === "video");
          if (videoSender) {
            await videoSender.replaceTrack(null);
          }
        }
      } else {
        const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = vStream.getVideoTracks()[0];

        if (!mediaStreamRef.current) {
          mediaStreamRef.current = new MediaStream();
        }
        if (newVideoTrack) {
          mediaStreamRef.current.addTrack(newVideoTrack);
        }
        const updatedStream = new MediaStream(mediaStreamRef.current.getTracks());
        mediaStreamRef.current = updatedStream;
        setLocalStream(updatedStream);

        for (const [targetSocketId, peer] of peerConnectionsRef.current.entries()) {
          const senders = peer.getSenders();
          const videoSender = senders.find(s => s.track?.kind === "video");
          if (videoSender && newVideoTrack) {
            await videoSender.replaceTrack(newVideoTrack);
          } else if (newVideoTrack) {
            peer.addTrack(newVideoTrack, updatedStream);
            safeCreateOffer(targetSocketId);
          }
        }
      }

      showToast(nextVideo ? "📷 Camera turned ON" : "📷 Camera turned OFF");

      if (socketRef.current && roomCode) {
        socketRef.current.emit("update_media_state", {
          roomCode,
          micOn,
          videoOn: nextVideo,
          isScreenSharing,
        });
      }
    } catch (err: any) {
      console.error("Camera access error", err);
      alert("Unable to access camera: " + (err.message || "Unknown error"));
    }
  };

  const toggleMic = async () => {
    try {
      const nextMic = !micOn;
      setMicOn(nextMic);

      const stream = await ensureMediaStream(false);
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = nextMic;
      }

      for (const [, peer] of peerConnectionsRef.current.entries()) {
        const senders = peer.getSenders();
        const audioSender = senders.find(s => s.track?.kind === "audio");

        if (audioSender && audioTrack) {
          await audioSender.replaceTrack(nextMic ? audioTrack : null);
        }
      }

      showToast(nextMic ? "🎙️ Microphone UNMUTED" : "🔇 Microphone MUTED");

      if (socketRef.current && roomCode) {
        socketRef.current.emit("update_media_state", {
          roomCode,
          micOn: nextMic,
          videoOn,
          isScreenSharing,
        });
      }
    } catch (err) {
      console.error("Mic access error", err);
    }
  };

  // Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      showToast("⏹️ Screen sharing stopped");
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080, frameRate: 30 },
          audio: true,
        });
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        setRoomMode("SCREEN_SHARE");
        showToast("🖥️ Screen sharing started");

        if (socketRef.current && roomCode) {
          socketRef.current.emit("broadcast_screen_status", { roomCode, isSharing: true });
          socketRef.current.emit("update_media_state", { roomCode, micOn, videoOn, isScreenSharing: true });
        }

        const currentSocketId = socketRef.current?.id;
        const otherParticipants = participants.filter(p => p.socketId !== currentSocketId);
        for (const p of otherParticipants) {
          const peer = createPeerConnection(p.socketId);
          stream.getTracks().forEach(track => peer.addTrack(track, stream));
          safeCreateOffer(p.socketId);
        }

        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.error("Screen share canceled or error", err);
      }
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    if (socketRef.current && roomCode) {
      socketRef.current.emit("broadcast_screen_status", { roomCode, isSharing: false });
      socketRef.current.emit("update_media_state", { roomCode, micOn, videoOn, isScreenSharing: false });
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast("📋 Room link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputMsg.trim() && socketRef.current && roomCode) {
      socketRef.current.emit("send_message", {
        roomCode,
        text: inputMsg.trim(),
      });
      setInputMsg("");
    }
  };

  const handleSendReaction = (emoji: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit("send_reaction", { roomCode, emoji });
    }
  };

  // Game Engine Actions
  const handleCreateGame = (gameId?: GameId | React.MouseEvent) => {
    if (socketRef.current && roomCode) {
      const selectedGame = typeof gameId === 'string' ? gameId : undefined;
      socketRef.current.emit("game_create", { roomCode, gameId: selectedGame });
      showToast("🎮 Initializing Room Game Session...");
    }
  };

  const handleJoinGame = () => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit("game_join", { roomCode });
    }
  };

  const handleStartGame = () => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit("game_start", { roomCode });
    }
  };

  const handleSubmitAnswer = (questionIndex: number, optionIndex: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit("game_submit_answer", { roomCode, questionIndex, optionIndex });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentSocketId = socketRef.current?.id || '';
  const isCurrentHost = participants.some(p => p.socketId === currentSocketId && p.isHost);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[hsl(var(--bg))] text-[hsl(var(--text))] overflow-hidden transition-colors duration-200 relative">
      
      {/* Hidden Audio elements for remote WebRTC audio playback */}
      {Array.from(remoteStreamsMap.entries()).map(([sid, stream]) => (
        <audio
          key={sid}
          ref={(el) => {
            if (el && el.srcObject !== stream) {
              el.srcObject = stream;
              el.volume = 1.0;
              el.play().catch(e => console.error("Remote audio play error", e));
            }
          }}
          autoPlay
          playsInline
        />
      ))}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 animate-bounce-short pointer-events-none">
          <div className="bg-neutral-900/95 text-white border border-[hsl(var(--accent))] px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sub-header Bar with Mode Indicator & Stop Media Button */}
      <div className="h-12 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-[hsl(var(--text))]">ROOM {roomCode}</span>
          </div>

          {/* Human-Styled Mode Badge */}
          {isChillMode ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-xs tracking-tight shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Chill Chat Lounge</span>
            </div>
          ) : roomMode === 'GAME' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold text-xs tracking-tight shadow-sm">
              <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Arcade Arena</span>
            </div>
          ) : roomMode === 'WATCH' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold text-xs tracking-tight shadow-sm">
              <Tv className="w-3.5 h-3.5 text-purple-400" />
              <span>Watch Party</span>
            </div>
          ) : roomMode === 'SCREEN_SHARE' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 font-semibold text-xs tracking-tight shadow-sm">
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span>Screen Stage</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-xs tracking-tight shadow-sm">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Voice & Video</span>
            </div>
          )}

          {/* Mode Quick Switchers (Hidden in CHILL Mode) */}
          {!isChillMode && (
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setShowGameSelector(true)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  roomMode === 'GAME' ? 'bg-[hsl(var(--accent))] text-white' : 'hover:bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text-secondary))]'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Games</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Prominent Stop Active Media / Exit Mode Button */}
          {roomMode !== "VC" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopActiveMedia}
              className="h-8 text-xs font-bold rounded-md gap-1.5 shadow-sm cursor-pointer"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Exit {roomMode}</span>
            </Button>
          )}

          <Button 
            variant={showChat ? "default" : "outline"} 
            size="sm" 
            onClick={() => {
              const nextState = !showChat;
              setShowChat(nextState);
              if (nextState) setUnreadCount(0);
            }} 
            className="gap-1.5 text-xs h-8 rounded-md cursor-pointer relative"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat</span>
            {!showChat && unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-[hsl(var(--surface))] animate-pulse shadow-md">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyLink} 
            className="gap-1.5 text-xs h-8 rounded-md cursor-pointer hidden sm:flex"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Link Copied!" : "Invite Link"}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.dispatchEvent(new Event("prompt-leave-room"))} 
            className="text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-md gap-1 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Stage Container */}
        <main className="flex-1 flex flex-col p-4 overflow-y-auto no-scrollbar justify-between bg-[hsl(var(--surface-sunken))] relative">
          
          {/* Video Link Control Input & Quick Presets (Hidden in CHILL Chat Mode) */}
          {!isChillMode && (
            <>
              <form onSubmit={handleLoadVideo} className="mb-2 flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 text-[hsl(var(--text-muted))] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Paste Video URL (YouTube / MP4 / Web stream) to watch together..."
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="h-9 text-xs pl-8 bg-[hsl(var(--surface))] border-[hsl(var(--border))]"
                  />
                </div>
                <Button type="submit" size="sm" className="h-9 px-4 text-xs font-bold rounded-md bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] cursor-pointer">
                  Watch Video Together 🍿
                </Button>
              </form>

              <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap flex items-center gap-1">
                  🎬 Quick HD Presets:
                </span>
                {SAMPLE_VIDEOS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setActiveVideoUrl(sample.url);
                      setVideoUrlInput(sample.url);
                      setRoomMode("WATCH");
                      showToast(`🎬 Loaded stream: ${sample.title}`);
                      if (socketRef.current && roomCode) {
                        socketRef.current.emit("sync_video", { roomCode, videoUrl: sample.url, videoId: "" });
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-gray-200 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 hover:scale-105 shadow-sm"
                  >
                    <span>{sample.title}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Main Display Viewport */}
          <div className="flex-1 flex flex-col items-center justify-center rounded-xl ui-card p-2 border border-[hsl(var(--border))] relative overflow-hidden text-center min-h-[350px] bg-black">
            
            {/* Floating Emoji Reactions Layer */}
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
              {reactions.map(r => (
                <span
                  key={r.id}
                  className="absolute bottom-6 text-4xl animate-float-up pointer-events-none"
                  style={{ left: `${r.x}%` }}
                >
                  {r.emoji}
                </span>
              ))}
            </div>

            {/* STAGE MODE 0: CHILL CHAT LOUNGE */}
            {isChillMode ? (
              <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white rounded-2xl border border-white/15 relative overflow-hidden shadow-2xl">
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
                      ⚡
                    </div>
                    <div className="text-left">
                      <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                        <span>Random Chill Chat Lounge</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30 uppercase">
                          {urlTopic || "Random"}
                        </span>
                      </h2>
                      <p className="text-xs text-gray-400">Pure text chat • Real-time anonymous pairing</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{participants.length} Participant{participants.length === 1 ? '' : 's'}</span>
                    </div>
                    <Button
                      onClick={() => setShowChillModal(true)}
                      className="h-9 px-4 text-xs font-bold rounded-xl bg-amber-500 text-black hover:bg-amber-400 cursor-pointer gap-1.5 shadow-md"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Next Partner ⏭️</span>
                    </Button>
                  </div>
                </div>

                {/* Center Live Message Feed */}
                <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-black/50 rounded-xl border border-white/10 mb-3 text-left no-scrollbar min-h-[220px]">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-8">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl animate-bounce">
                        💬
                      </div>
                      <h3 className="font-extrabold text-white text-base">Connected to Chill Chat!</h3>
                      <p className="text-xs text-gray-400 max-w-sm">
                        Type a message below to start chatting with your partner in real time!
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                        {participants.map(p => (
                          <span key={p.socketId} className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-semibold text-amber-300">
                            👤 {p.name} {p.socketId === currentSocketId ? '(You)' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === currentSocketId;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-2 mb-0.5 text-[10px] text-gray-400 font-mono">
                            <span className="font-bold text-gray-200">{m.sender}</span>
                            <span>{m.time}</span>
                          </div>
                          <div
                            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                              isMe
                                ? "bg-[hsl(var(--accent))] text-white rounded-br-none"
                                : "bg-neutral-800 text-gray-100 border border-white/15 rounded-bl-none"
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Center Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 shrink-0"
                >
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Type a message to your partner..."
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      className="h-11 text-xs sm:text-sm pl-4 pr-12 rounded-xl bg-white/10 border-white/15 text-white placeholder:text-gray-400 focus:border-amber-400"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {EMOJI_LIST.slice(0, 3).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleSendReaction(emoji)}
                          className="hover:scale-125 transition-transform text-sm cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!inputMsg.trim()}
                    className="h-11 px-5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs cursor-pointer gap-1.5 shadow-lg shrink-0 disabled:opacity-50"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            ) : roomMode === "GAME" ? (
              <GameStage
                gameSession={activeGameSession}
                isHost={isCurrentHost}
                currentSocketId={currentSocketId}
                onJoinGame={handleJoinGame}
                onStartGame={handleStartGame}
                onSubmitAnswer={handleSubmitAnswer}
                onExitGame={handleStopActiveMedia}
                onCreateGame={handleCreateGame}
              />
            ) : isScreenSharing ? (
              /* STAGE MODE 2: LOCAL SCREEN SHARE STAGE */
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full max-h-[65vh] object-contain rounded-lg"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                  <Tv className="w-3.5 h-3.5" />
                  <span>Sharing Screen Live</span>
                </div>
                <button
                  type="button"
                  onClick={handleStopActiveMedia}
                  className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Stop Sharing
                </button>
              </div>
            ) : remoteScreenActive ? (
              /* STAGE MODE 3: REMOTE SCREEN SHARE STAGE */
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={(el) => {
                    const stream = remotePresenterSocketId
                      ? remoteStreamsMap.get(remotePresenterSocketId)
                      : Array.from(remoteStreamsMap.values())[0] || null;
                    if (el && stream && el.srcObject !== stream) {
                      el.srcObject = stream;
                      el.play().catch(e => console.error("Remote screen error", e));
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full max-h-[65vh] object-contain rounded-lg"
                />
                <div className="absolute top-3 left-3 bg-[hsl(var(--accent))] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                  <Tv className="w-3.5 h-3.5" />
                  <span>Viewing {remotePresenterName}&apos;s Live Screen</span>
                </div>
              </div>
            ) : activeYtId ? (
              /* STAGE MODE 4A: YOUTUBE SYNCHRONIZED PLAYER */
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-lg overflow-hidden group">
                <div ref={ytContainerRef} className="w-full h-full max-h-[62vh] rounded-lg" />
                <button
                  type="button"
                  onClick={handleStopActiveMedia}
                  className="absolute top-3 right-3 bg-black/80 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1 z-20 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Stop Video
                </button>
                <div className="absolute bottom-2 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-white flex items-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={handleTogglePlayPause}
                    className="p-1.5 rounded-full bg-[hsl(var(--accent))] text-white hover:scale-105 transition-transform cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                  <span>{isPlaying ? 'Playing YouTube Stream' : 'YouTube Stream Paused'}</span>
                </div>
              </div>
            ) : activeVideoUrl ? (
              /* STAGE MODE 4B: HTML5 SYNCHRONIZED PLAYER */
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-lg overflow-hidden group">
                <video
                  ref={syncPlayerRef}
                  src={activeVideoUrl}
                  onTimeUpdate={() => {
                    if (syncPlayerRef.current) {
                      setCurrentTime(syncPlayerRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (syncPlayerRef.current) {
                      setDuration(syncPlayerRef.current.duration);
                    }
                  }}
                  onPlay={() => {
                    if (!isRemoteActionRef.current) {
                      setIsPlaying(true);
                      if (socketRef.current && roomCode) {
                        socketRef.current.emit("sync_player_action", { roomCode, action: 'play', currentTime: syncPlayerRef.current?.currentTime });
                      }
                    }
                  }}
                  onPause={() => {
                    if (!isRemoteActionRef.current) {
                      setIsPlaying(false);
                      if (socketRef.current && roomCode) {
                        socketRef.current.emit("sync_player_action", { roomCode, action: 'pause', currentTime: syncPlayerRef.current?.currentTime });
                      }
                    }
                  }}
                  className="w-full h-full max-h-[62vh] object-contain"
                />

                <button
                  type="button"
                  onClick={handleStopActiveMedia}
                  className="absolute top-3 right-3 bg-black/80 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1 z-20 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Stop Video
                </button>

                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center gap-3 text-white transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={handleTogglePlayPause}
                    className="p-2 rounded-full bg-[hsl(var(--accent))] text-white hover:scale-110 transition-transform cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <span className="text-xs font-mono font-bold text-gray-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--accent))]"
                  />
                </div>
              </div>
            ) : (
              /* STAGE MODE 5: MULTI-PARTICIPANT VC GRID */
              (() => {
                // If a participant is pinned, render Pinned Stage Layout
                if (pinnedSocketId) {
                  const pinnedUser = participants.find(p => p.socketId === pinnedSocketId);
                  const isLocal = pinnedSocketId === currentSocketId;
                  const stream = isLocal ? (localStream || mediaStreamRef.current) : (remoteStreamsMap.get(pinnedSocketId) || null);
                  return (
                    <div className="w-full h-full p-2 flex flex-col items-center justify-center relative">
                      <div className="w-full h-full max-h-[65vh] max-w-5xl rounded-2xl overflow-hidden shadow-2xl border-2 border-[hsl(var(--accent))] bg-black relative">
                        <ParticipantTile
                          id={pinnedSocketId}
                          name={pinnedUser?.name || 'Pinned Participant'}
                          isHost={Boolean(pinnedUser?.isHost)}
                          isLocal={isLocal}
                          micOn={Boolean(pinnedUser?.micOn)}
                          videoOn={Boolean(pinnedUser?.videoOn)}
                          isSpeaking={speakingSocketIds.has(pinnedSocketId)}
                          stream={stream}
                          className="w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => setPinnedSocketId(null)}
                          className="absolute top-3 right-3 bg-black/80 hover:bg-neutral-800 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1 z-20 cursor-pointer"
                        >
                          <Pin className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Unpin
                        </button>
                      </div>
                    </div>
                  );
                }

                // Default Grid View
                return (
                  <div className="w-full h-full p-2 flex flex-col items-center justify-center overflow-y-auto no-scrollbar">
                    <div
                      className={`w-full h-full max-h-[65vh] grid gap-3 ${
                        participants.length <= 1
                          ? "grid-cols-1 max-w-2xl"
                          : participants.length === 2
                          ? "grid-cols-1 sm:grid-cols-2 max-w-4xl"
                          : participants.length <= 4
                          ? "grid-cols-2 max-w-5xl"
                          : "grid-cols-2 sm:grid-cols-3 max-w-6xl"
                      }`}
                    >
                      {participants.map((p) => {
                        const isLocal = p.socketId === currentSocketId;
                        const stream = isLocal
                          ? (localStream || mediaStreamRef.current)
                          : remoteStreamsMap.get(p.socketId) || null;
                        return (
                          <div
                            key={p.id || p.socketId}
                            onClick={() => setPopoverParticipant(p)}
                            className="cursor-pointer transition-transform hover:scale-[1.01]"
                          >
                            <ParticipantTile
                              id={p.socketId}
                              name={p.name}
                              isHost={p.isHost}
                              isLocal={isLocal}
                              micOn={p.micOn}
                              videoOn={p.videoOn}
                              isSpeaking={speakingSocketIds.has(p.socketId)}
                              stream={stream}
                              className="w-full h-full min-h-[200px]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            )}

            {/* DRAGGABLE PIP Thumbnail */}
            {videoOn && (isScreenSharing || remoteScreenActive || Boolean(activeVideoUrl) || roomMode !== "VC") && (
              <DraggablePip
                initialClass="bottom-16 right-4 w-52 h-36 rounded-2xl border-2 border-[hsl(var(--accent))] overflow-hidden shadow-2xl bg-black"
                label="You (Host)"
              >
                <video
                  ref={(el) => {
                    const stream = localStream || mediaStreamRef.current;
                    if (el && stream && el.srcObject !== stream) {
                      el.srcObject = stream;
                      el.play().catch(err => console.error("Local PIP error", err));
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100 pointer-events-none"
                />
              </DraggablePip>
            )}

          </div>

          {/* RESPONSIVE PARTICIPANT RAIL (Visible below main stage during Watch / Screen Share / Game modes) */}
          {roomMode !== "VC" && (
            <div className="mt-3 p-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 px-2">
                <Users className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                <span>Room Rail ({participants.length})</span>
              </div>
              {participants.map(p => {
                const isLocal = p.socketId === currentSocketId;
                const isSpeaking = speakingSocketIds.has(p.socketId);
                return (
                  <div
                    key={p.id || p.socketId}
                    onClick={() => setPopoverParticipant(p)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                      isSpeaking ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[hsl(var(--accent))] to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {p.name ? p.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span>{p.name} {isLocal ? '(You)' : ''}</span>
                    {p.micOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Control Dock */}
          <div className="mt-3 h-14 rounded-xl ui-card px-4 flex items-center justify-between shrink-0 shadow-xs">
            {isChillMode ? (
              <>
                <Button
                  onClick={() => setShowChillModal(true)}
                  className="rounded-md cursor-pointer text-xs gap-1.5 bg-amber-500 text-black hover:bg-amber-400 font-bold"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Find Next Partner ⏭️</span>
                </Button>
                <div className="flex items-center gap-1.5">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className="hover:scale-125 transition-transform text-lg cursor-pointer px-1"
                      title={`Send ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Button
                    variant={micOn ? "default" : "secondary"}
                    size="sm"
                    onClick={toggleMic}
                    className={`rounded-md cursor-pointer text-xs gap-1.5 ${micOn ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-rose-500 bg-rose-500/10"}`}
                  >
                    {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    <span>{micOn ? "Mute" : "Unmute"}</span>
                  </Button>

                  <Button
                    variant={videoOn ? "default" : "secondary"}
                    size="sm"
                    onClick={toggleCamera}
                    className={`rounded-md cursor-pointer text-xs gap-1.5 ${videoOn ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-rose-500 bg-rose-500/10"}`}
                  >
                    {videoOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                    <span>{videoOn ? "Cam Off" : "Cam On"}</span>
                  </Button>

                  <Button
                    variant={isScreenSharing ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleScreenShare}
                    className="rounded-md cursor-pointer text-xs gap-1.5"
                  >
                    {isScreenSharing ? <StopCircle className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                    <span>{isScreenSharing ? "Stop Sharing" : "Share Screen"}</span>
                  </Button>

                  <Button
                    variant={roomMode === "GAME" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowGameSelector(true)}
                    className="rounded-md cursor-pointer text-xs gap-1.5 bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))]"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Play Game</span>
                  </Button>
                </div>

                {/* Quick Emoji Reaction Buttons */}
                <div className="hidden sm:flex items-center gap-1.5 border-l border-r border-[hsl(var(--border))] px-3 py-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className="hover:scale-125 transition-transform text-lg cursor-pointer px-1"
                      title={`Send ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}

          </div>

        </main>

        {/* Responsive Drawer Sidebar: Chat & Participants (Hidden in CHILL Mode as Center Stage is full Chat Lounge) */}
        {showChat && !isChillMode && (
          <aside className="w-full sm:w-80 border-l border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col h-full shrink-0 z-20 absolute sm:relative right-0 inset-y-0 shadow-xl sm:shadow-none transition-all duration-200">
            
            {/* Sidebar Header */}
            <div className="p-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                <Users className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                <span>Participants ({participants.length})</span>
              </div>

              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="lg:hidden text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Real-time Participant List */}
            <div className="p-3 border-b border-[hsl(var(--border))] max-h-32 overflow-y-auto space-y-1.5 no-scrollbar">
              {participants.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPopoverParticipant(p)}
                  className="flex items-center justify-between px-2 py-1 rounded bg-[hsl(var(--surface-elevated))] text-xs cursor-pointer hover:bg-[hsl(var(--border))]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-[hsl(var(--text))]">{p.name} {p.socketId === currentSocketId ? '(You)' : ''}</span>
                  </div>
                  {p.isHost && (
                    <span className="text-[10px] font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">
                      HOST
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 no-scrollbar">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-muted))] mb-1">
                Live Chat
              </div>
              {messages.map((msg) => (
                <div key={msg.id} className={`space-y-1 ${msg.system ? "text-center my-2" : ""}`}>
                  {msg.system ? (
                    <div className="text-[11px] text-[hsl(var(--text-muted))] bg-[hsl(var(--surface-elevated))] py-1 px-2.5 rounded border border-[hsl(var(--border))] font-medium">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="ui-card p-2.5 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[hsl(var(--accent))]">{msg.sender}</span>
                        <span className="text-[10px] text-[hsl(var(--text-muted))]">{msg.time}</span>
                      </div>
                      <p className="text-[hsl(var(--text))] leading-relaxed">{msg.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[hsl(var(--border))] flex gap-2">
              <Input
                type="text"
                placeholder="Send message..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="h-9 text-xs rounded-md bg-[hsl(var(--surface-elevated))] border-[hsl(var(--border))]"
              />
              <Button type="submit" size="sm" disabled={!inputMsg.trim()} className="h-9 px-3 rounded-md bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </aside>
        )}

      </div>

      {/* PARTICIPANT ACTION POPOVER MODAL */}
      {popoverParticipant && (
        <ParticipantPopover
          participant={popoverParticipant}
          isLocal={popoverParticipant.socketId === currentSocketId}
          isPinned={pinnedSocketId === popoverParticipant.socketId}
          onClose={() => setPopoverParticipant(null)}
          onTogglePin={(socketId) => {
            setPinnedSocketId(prev => (prev === socketId ? null : socketId));
            showToast(pinnedSocketId === socketId ? "Unpinned user view" : `Pinned ${popoverParticipant.name}'s stream`);
          }}
          onExpand={(participant) => {
            setExpandedParticipant(participant);
          }}
          onMuteParticipant={(targetSid) => {
            showToast(`Requested mute for participant (${targetSid.substring(0, 5)})`);
          }}
        />
      )}

      {/* ENLARGED PARTICIPANT VIEW MODAL */}
      {expandedParticipant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12151C] border border-white/15 w-full max-w-4xl h-[75vh] rounded-2xl p-4 flex flex-col justify-between relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-sm text-white">Expanded View: {expandedParticipant.name}</h3>
              <button
                type="button"
                onClick={() => setExpandedParticipant(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 my-2 rounded-xl bg-black overflow-hidden relative flex items-center justify-center">
              <ParticipantTile
                id={expandedParticipant.socketId}
                name={expandedParticipant.name}
                isHost={expandedParticipant.isHost}
                isLocal={expandedParticipant.socketId === currentSocketId}
                micOn={expandedParticipant.micOn}
                videoOn={expandedParticipant.videoOn}
                isSpeaking={speakingSocketIds.has(expandedParticipant.socketId)}
                stream={
                  expandedParticipant.socketId === currentSocketId
                    ? (localStream || mediaStreamRef.current)
                    : remoteStreamsMap.get(expandedParticipant.socketId) || null
                }
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Game Selection Picker Modal */}
      <GameSelectionModal
        isOpen={showGameSelector}
        onClose={() => setShowGameSelector(false)}
        onSelectGame={(gameId) => handleCreateGame(gameId)}
      />

      {/* Random Chill Match Modal */}
      <ChillMatchModal
        isOpen={showChillModal}
        onClose={() => setShowChillModal(false)}
        onStartMatch={(name, topic, code) => {
          setShowChillModal(false);
          const targetCode = code || `CHILL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
          navigate(`/r/${targetCode}?name=${encodeURIComponent(name)}&topic=${encodeURIComponent(topic)}`);
        }}
      />

    </div>
  );
}
