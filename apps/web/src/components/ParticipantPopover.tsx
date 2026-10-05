import type { Participant } from "@ratri/types";
import { Mic, MicOff, Video, VideoOff, Pin, Maximize2, X, Shield, Volume2 } from "lucide-react";
import { Button } from "./ui/button";

interface ParticipantPopoverProps {
  participant: Participant;
  isLocal: boolean;
  isPinned: boolean;
  onClose: () => void;
  onTogglePin: (socketId: string) => void;
  onExpand: (participant: Participant) => void;
  onMuteParticipant?: (socketId: string) => void;
}

export function ParticipantPopover({
  participant,
  isLocal,
  isPinned,
  onClose,
  onTogglePin,
  onExpand,
  onMuteParticipant,
}: ParticipantPopoverProps) {
  const getInitials = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#12151C] border border-white/15 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-left relative space-y-4">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-gray-300 uppercase">
              {isLocal ? "Your Profile" : "Participant Details"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Info */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[hsl(var(--accent))] to-purple-600 text-white flex items-center justify-center text-xl font-extrabold shadow-md border-2 border-white/20">
            {getInitials(participant.name)}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">{participant.name}</h4>
              {participant.isHost && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> HOST
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                {participant.micOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
                {participant.micOn ? "Mic On" : "Muted"}
              </span>
              <span className="flex items-center gap-1">
                {participant.videoOn ? <Video className="w-3 h-3 text-emerald-400" /> : <VideoOff className="w-3 h-3 text-rose-400" />}
                {participant.videoOn ? "Cam On" : "Cam Off"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onTogglePin(participant.socketId);
              onClose();
            }}
            className={`h-9 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer ${
              isPinned
                ? "bg-[hsl(var(--accent))] text-white border-transparent"
                : "border-white/15 bg-white/5 text-gray-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>{isPinned ? "Unpin User" : "Pin User"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onExpand(participant);
              onClose();
            }}
            className="h-9 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer border-white/15 bg-white/5 text-gray-200 hover:text-white hover:bg-white/10"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Enlarge View</span>
          </Button>

          {!isLocal && onMuteParticipant && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onMuteParticipant(participant.socketId);
                onClose();
              }}
              className="h-9 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer border-white/15 bg-white/5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 col-span-2"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Request Mute</span>
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
