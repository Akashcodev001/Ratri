import { useState, useEffect, useRef } from "react";
import { Zap, User, Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { io, Socket } from "socket.io-client";

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return "http://localhost:3000";
};

interface ChillMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (displayName: string, topic: string, roomCode?: string) => void;
}

const TOPICS = [
  { id: "random", name: "Random Chill ⚡", emoji: "⚡" },
  { id: "anime", name: "Anime & Manga 🌸", emoji: "🌸" },
  { id: "gaming", name: "Gaming & Esports 🎮", emoji: "🎮" },
  { id: "lofi", name: "Lofi & Music 🎵", emoji: "🎵" },
  { id: "movies", name: "Movies & Shows 🍿", emoji: "🍿" },
];

export function ChillMatchModal({
  isOpen,
  onClose,
  onStartMatch,
}: ChillMatchModalProps) {
  const [name, setName] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("random");
  const [matchingState, setMatchingState] = useState<"IDLE" | "SEARCHING" | "MATCHED">("IDLE");
  const [partnerDetails, setPartnerDetails] = useState<{ name: string; avatar: string; topic: string } | null>(null);
  const [matchedCode, setMatchedCode] = useState<string | undefined>(undefined);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setMatchingState("IDLE");
      setPartnerDetails(null);
      if (socketRef.current) {
        socketRef.current.emit("leave_chill_queue");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSearching = () => {
    const finalName = name.trim() || `ChillUser_${Math.floor(Math.random() * 9000 + 1000)}`;
    setMatchingState("SEARCHING");

    const socket = io(getSocketUrl(), {
      transports: ["polling", "websocket"],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_chill_queue", { displayName: finalName, topic: selectedTopic });
    });

    socket.on("chill_matched", ({ roomCode, partnerName, topic }: { roomCode: string; partnerName: string; topic: string }) => {
      setMatchedCode(roomCode);
      setPartnerDetails({ name: partnerName, avatar: "⚡", topic });
      setMatchingState("MATCHED");
    });

    socket.on("chill_waiting", ({ roomCode }: { roomCode: string }) => {
      setMatchedCode(roomCode);
    });
  };

  const handleEnterChat = () => {
    const finalName = name.trim() || `ChillUser_${Math.floor(Math.random() * 9000 + 1000)}`;
    if (socketRef.current) {
      socketRef.current.emit("leave_chill_queue");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    onStartMatch(finalName, selectedTopic, matchedCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-neutral-950 border border-white/20 rounded-2xl p-6 text-white shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Random Chill Lounge ⚡</h2>
              <p className="text-xs text-gray-400">Match with a random user for instant chat!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {matchingState === "IDLE" && (
          <div className="space-y-4">
            
            {/* Step 1: User Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Enter Your Display Name</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Alex, CyberGhost, Pixel"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="h-10 text-xs px-3.5 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Step 2: Select Chill Interest Topic */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Select Chat Interest</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTopic(t.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      selectedTopic === t.id
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md scale-[1.02]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStartSearching}
              className="w-full h-11 text-xs font-bold rounded-xl bg-amber-500 text-black hover:bg-amber-400 cursor-pointer gap-2 shadow-lg mt-2"
            >
              <span>Find Random Partner ⚡</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-mono text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anonymous • Instant pairing • Safe environment</span>
            </div>

          </div>
        )}

        {matchingState === "SEARCHING" && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center text-2xl animate-spin">
                ⚡
              </div>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Scanning Active Chill Lounge...</h3>
              <p className="text-xs text-gray-400 mt-1">Matching with random user interested in {selectedTopic.toUpperCase()}...</p>
            </div>
            {matchedCode && (
              <Button
                onClick={handleEnterChat}
                variant="outline"
                className="h-9 px-4 text-xs font-semibold rounded-xl border-amber-500/40 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
              >
                <span>Enter Lounge & Wait For Partner 🚀</span>
              </Button>
            )}
          </div>
        )}

        {matchingState === "MATCHED" && partnerDetails && (
          <div className="space-y-5 animate-fade-in text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-xl mx-auto shadow-lg animate-bounce">
              🎉
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Match Found!</h3>
              <p className="text-xs text-gray-400">Partner details before entering the chat:</p>
            </div>

            {/* Partner Details Card */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/15 max-w-xs mx-auto space-y-2 text-left shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
                  {partnerDetails.avatar}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{partnerDetails.name}</h4>
                  <span className="text-[10px] font-mono text-emerald-400">ONLINE • READY TO CHAT</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
                <span>Matched Topic:</span>
                <span className="font-bold text-amber-300 uppercase">{partnerDetails.topic}</span>
              </div>
            </div>

            <Button
              onClick={handleEnterChat}
              className="w-full h-11 text-xs font-bold rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer gap-2 shadow-lg"
            >
              <span>Enter Chill Chat Lounge Now 🚀</span>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
