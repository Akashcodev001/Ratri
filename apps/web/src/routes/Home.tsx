import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Play, 
  Users, 
  MessageSquare, 
  ArrowRight, 
  Tv, 
  Zap, 
  Volume2,
  Mic,
  ShieldCheck
} from "lucide-react";
import { api } from "../services/api";
import { prefetchRoomChunk } from "../App";

export function Home() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<"chill" | "watch" | "talk">("watch");
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    prefetchRoomChunk();
    try {
      setLoading(true);
      const name = roomName.trim() || `${roomType.toUpperCase()} Lounge`;
      const room = await api.createRoom(name, roomType);
      navigate(`/r/${room.roomCode}`);
    } catch (err) {
      console.error("Failed to create room", err);
      const mockCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      navigate(`/r/${mockCode}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      try {
        setLoading(true);
        const code = roomCode.trim().toUpperCase();
        const room = await api.getRoom(code);
        navigate(`/r/${room.roomCode}`);
      } catch (err) {
        console.error("Failed to join room", err);
        const code = roomCode.trim().toUpperCase();
        navigate(`/r/${code}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl mx-auto">
      
      {/* Hero Section: Split 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto">
        
        {/* Left Column: Headline & Action Panel */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-[1.1]">
              The cozy corner to <br />
              <span className="text-[hsl(var(--accent))]">watch, listen & hang out.</span>
            </h1>
            <p className="text-base sm:text-lg text-[hsl(var(--text-secondary))] max-w-xl font-normal leading-relaxed">
              Create a room in 1 second. Share the link with friends to watch videos, listen to music, and talk over low-latency audio—no signups or downloads needed.
            </p>
          </div>

          {/* Room Creation Box */}
          <div className="rat-card p-6 space-y-5">
            
            {/* Mode Switch Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider block">
                1. Select Room Type
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-lg bg-[hsl(var(--surface-sunken))]">
                <button
                  type="button"
                  onClick={() => setRoomType("watch")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    roomType === "watch"
                      ? "bg-[hsl(var(--accent))] text-white shadow-sm"
                      : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text))]"
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Watch 🍿</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoomType("talk")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    roomType === "talk"
                      ? "bg-[hsl(var(--accent))] text-white shadow-sm"
                      : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text))]"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Voice 🎙️</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoomType("chill")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    roomType === "chill"
                      ? "bg-[hsl(var(--accent))] text-white shadow-sm"
                      : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text))]"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Chill ⚡</span>
                </button>
              </div>
            </div>

            {/* Room Name Input & Launch */}
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Room Title (e.g. Anime Watch Party)"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="h-11 text-sm px-3.5 rounded-lg bg-[hsl(var(--surface-elevated))] border-[hsl(var(--border))]"
              />
              
              <Button
                size="lg"
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full h-11 text-sm font-bold rounded-lg bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] transition-colors group cursor-pointer"
              >
                <span>{loading ? "Creating..." : "Create Instant Room"}</span>
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[hsl(var(--border))]" /></div>
              <span className="relative px-3 bg-[hsl(var(--surface))] text-xs font-semibold text-[hsl(var(--text-muted))]">or join existing code</span>
            </div>

            {/* Room Code Join Form */}
            <form onSubmit={handleJoinRoom} className="flex gap-2">
              <Input
                type="text"
                placeholder="ROOM CODE (e.g. M7HFF7)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="h-10 uppercase tracking-widest text-center font-mono font-bold text-xs bg-[hsl(var(--surface-elevated))] border-[hsl(var(--border))]"
                maxLength={8}
                disabled={loading}
              />
              <Button
                type="submit"
                size="lg"
                variant="secondary"
                disabled={loading || !roomCode.trim()}
                className="h-10 px-5 text-xs font-bold rounded-lg cursor-pointer"
              >
                Join
              </Button>
            </form>
          </div>

          {/* Social Trust Line */}
          <div className="flex items-center gap-3 pt-2 text-xs text-[hsl(var(--text-secondary))] font-medium">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] border-2 border-[hsl(var(--surface))]">A</div>
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] border-2 border-[hsl(var(--surface))]">S</div>
              <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] border-2 border-[hsl(var(--surface))]">D</div>
            </div>
            <span>Guest friendly • No password or account setup required</span>
          </div>

        </div>

        {/* Right Column: Interactive Room Preview Showcase Mockup */}
        <div className="lg:col-span-6">
          <div className="rat-card p-4 sm:p-5 relative overflow-hidden bg-black border-[hsl(var(--border-strong))] text-left shadow-2xl">
            
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono font-bold tracking-wide text-white">ROOM #MOVIE-NIGHT</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full">
                <Users className="w-3 h-3 text-[hsl(var(--accent))]" />
                <span>3 Watching</span>
              </div>
            </div>

            {/* Video Stage Mockup */}
            <div className="relative aspect-video rounded-lg bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              
              {/* Play Icon Placeholder */}
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--accent))] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>

              {/* Floating Emojis Reaction Layer */}
              <div className="absolute bottom-12 right-6 flex flex-col gap-2 pointer-events-none">
                <span className="text-xl animate-bounce" style={{ animationDuration: '1.2s' }}>🔥</span>
                <span className="text-xl animate-bounce" style={{ animationDuration: '1.8s' }}>🍿</span>
              </div>

              {/* Player Bottom Control Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-mono text-[11px]">01:42 / 12:30 • SYNCED</span>
                </div>
                <div className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  1080p WebRTC
                </div>
              </div>
            </div>

            {/* Voice Avatars & Live Chat Preview Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              
              {/* Voice Avatars Stack */}
              <div className="p-3 rounded-lg bg-neutral-900 border border-white/10 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Mic className="w-3 h-3 text-emerald-400" />
                  <span>Voice Lounge</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs voice-speaking">
                      A
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] text-white">✓</span>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      D
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Stream Mock */}
              <div className="p-3 rounded-lg bg-neutral-900 border border-white/10 space-y-1.5 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[hsl(var(--accent))]" />
                  <span>Live Stream Chat</span>
                </div>
                <div className="text-[11px] text-gray-300 font-medium">
                  <span className="text-[hsl(var(--accent))] font-bold">Alex:</span> Skip to 02:40! 🔥
                </div>
                <div className="text-[11px] text-gray-300 font-medium">
                  <span className="text-amber-400 font-bold">Sarah:</span> Perfect sync! 😂
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Feature Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
        <div className="rat-card p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] flex items-center justify-center">
            <Tv className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[hsl(var(--text))]">Frame-Accurate Video Sync</h3>
          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
            State-machine playback control ensures everyone in the room watches the exact same video frame synchronously.
          </p>
        </div>

        <div className="rat-card p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[hsl(var(--text))]">Low-Latency WebRTC Voice</h3>
          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
            Drop into crystal-clear spatial audio or share high-definition camera and screen streams with zero configuration.
          </p>
        </div>

        <div className="rat-card p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[hsl(var(--text))]">Guest-First Access</h3>
          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
            No forced user registration or account setup required. Send your unique 6-character room link to start immediately.
          </p>
        </div>
      </div>

    </div>
  );
}
