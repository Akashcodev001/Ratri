import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, VideoOff, Shield, Volume2 } from "lucide-react";

interface ParticipantTileProps {
  id: string;
  name: string;
  isHost: boolean;
  isLocal: boolean;
  micOn: boolean;
  videoOn: boolean;
  isSpeaking?: boolean;
  stream: MediaStream | null;
  className?: string;
  showControls?: boolean;
}

export function ParticipantTile({
  name,
  isHost,
  isLocal,
  micOn,
  videoOn,
  isSpeaking,
  stream,
  className = "",
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Check if stream has an enabled video track that has not ended
  const hasVideoTrack = Boolean(
    videoOn &&
    stream &&
    stream.getVideoTracks().some(t => t.enabled && t.readyState !== "ended")
  );

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (!hasVideoTrack || !stream) {
      setIsVideoPlaying(false);
      videoEl.srcObject = null;
      return;
    }

    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }
    videoEl.play().catch(() => {});

    const handleReady = () => {
      if (videoEl.videoWidth > 0) {
        setIsVideoPlaying(true);
      }
    };

    videoEl.addEventListener("playing", handleReady);
    videoEl.addEventListener("loadeddata", handleReady);
    videoEl.addEventListener("timeupdate", handleReady);

    const videoTracks = stream.getVideoTracks();
    const handleUnmute = () => {
      videoEl.play().catch(() => {});
    };
    videoTracks.forEach(t => t.addEventListener("unmute", handleUnmute));

    return () => {
      videoEl.removeEventListener("playing", handleReady);
      videoEl.removeEventListener("loadeddata", handleReady);
      videoEl.removeEventListener("timeupdate", handleReady);
      videoTracks.forEach(t => t.removeEventListener("unmute", handleUnmute));
    };
  }, [stream, hasVideoTrack, videoOn]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "P";

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-black border transition-all duration-200 flex flex-col items-center justify-center select-none shadow-lg ${
        isSpeaking
          ? "border-emerald-500 shadow-emerald-500/20 shadow-md ring-2 ring-emerald-500/30"
          : "border-[hsl(var(--border))]"
      } ${className}`}
    >
      {/* 1. Base Layer: Fallback Avatar Tile (ALWAYS present underneath — never blank white) */}
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[hsl(var(--surface))] to-[hsl(var(--surface-sunken))] text-center space-y-3">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[hsl(var(--accent))] to-pink-600 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md border-2 border-[hsl(var(--border))]">
            {initials}
          </div>
          {isSpeaking && (
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow animate-pulse">
              <Volume2 className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        <div className="space-y-0.5">
          <div className="font-semibold text-sm text-[hsl(var(--text))] flex items-center justify-center gap-1.5">
            <span>{name}</span>
            {isLocal && <span className="text-[10px] text-gray-400 font-normal">(You)</span>}
          </div>
          <div className="text-[11px] text-[hsl(var(--text-muted))] flex items-center justify-center gap-1">
            <VideoOff className="w-3 h-3 text-rose-400" />
            <span>{videoOn ? "Connecting Video..." : "Camera Off"}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Video Layer: Seamlessly overlays avatar once video frames are actively playing */}
      {hasVideoTrack && stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          onLoadedMetadata={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
          onCanPlay={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
          className={`absolute inset-0 w-full h-full object-cover bg-black transition-opacity duration-300 ${
            isVideoPlaying ? "opacity-100 z-[1]" : "opacity-0 pointer-events-none"
          } ${isLocal ? "transform -scale-x-100" : ""}`}
        />
      )}

      {/* Top Left Badges: Host & Local */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
        {isHost && (
          <span className="bg-[hsl(var(--accent))] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Shield className="w-3 h-3" />
            <span>HOST</span>
          </span>
        )}
      </div>

      {/* Bottom Overlay Label & Status Bar */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center justify-between z-10 border border-white/10">
        <span className="text-xs font-medium text-white truncate max-w-[120px]">
          {name} {isLocal ? "(You)" : ""}
        </span>
        <div className="flex items-center gap-1.5">
          {micOn ? (
            <span className={`p-1 rounded-full ${isSpeaking ? "bg-emerald-500 text-white animate-pulse" : "text-emerald-400 bg-emerald-500/10"}`}>
              <Mic className="w-3 h-3" />
            </span>
          ) : (
            <span className="p-1 rounded-full bg-rose-500/20 text-rose-400">
              <MicOff className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
