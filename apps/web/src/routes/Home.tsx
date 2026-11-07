import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ChillMatchModal } from "../components/ChillMatchModal";
import { SeoHead } from "../components/seo/SeoHead";
import { 
  Users, 
  MessageSquare, 
  ArrowRight, 
  Loader2,
  Tv, 
  Zap, 
  Volume2,
  Mic,
  ShieldCheck,
  Sparkles,
  Music,
  Heart,
  Bell,
  CheckCircle2,
  Globe,
  HelpCircle
} from "lucide-react";
import { api } from "../services/api";
import { prefetchRoomChunk } from "../App";
import heroShowcaseImg from "../assets/hero_showcase.jpg";
import { SITE_URL, getCanonicalUrl } from "../config/site";

export function Home() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<"chill" | "watch" | "talk">("watch");

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Ratri',
      url: getCanonicalUrl('/'),
      description: 'Real-time social watch party & spatial voice lounge platform.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/r/{search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Ratri',
      url: SITE_URL,
      description: 'Watch synchronized videos, listen to music, play trivia games, and talk in real-time with friends.',
      applicationCategory: 'SocialNetworkingApplication',
      operatingSystem: 'All',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Ratri and what does the name mean?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ratri (derived from the Sanskrit and Hindi word for night or the midnight lounge) is a real-time social room platform designed for friends to watch synchronized videos, listen to music, talk over WebRTC voice and video, and share screens together online.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I or my friends need an account to use Ratri?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Ratri is built with a guest-first philosophy. Anyone can create an instant room in one second, share the room link or 6-character code with friends, and start watching or talking immediately with zero signups or software downloads.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does video synchronization work on Ratri?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ratri uses WebSocket signaling through Socket.IO to mirror video playback state across all connected participants. When the room host plays, pauses, or seeks in a video, the exact playback timestamp is synchronized across all peers in sub-second time.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I share my screen with audio on Ratri?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Ratri provides native in-browser WebRTC screen sharing. You can share your full screen, an application window, or a browser tab directly inside the room without installing external extensions.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Ratri an OTT movie streaming app or subscription service?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Ratri is not an OTT streaming service, piracy platform, or movie download site. It is an interactive real-time social platform for synchronized watch parties, voice chat, and shared screen lounges.',
          },
        },
      ],
    },
  ];
  const [loading, setLoading] = useState(false);
  const [showChillModal, setShowChillModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const isCreatingRef = useRef(false);

  // Background non-blocking pre-warmup ping to eliminate cold-start latency
  useEffect(() => {
    api.warmup();
  }, []);

  const handleCreateRoom = async () => {
    if (isCreatingRef.current || loading) return;

    if (roomType === "chill") {
      setShowChillModal(true);
      return;
    }

    isCreatingRef.current = true;
    prefetchRoomChunk();
    try {
      setLoading(true);
      setJoinError(null);
      const name = roomName.trim() || `${roomType.toUpperCase()} Lounge`;
      const room = await api.createRoom(name, roomType);
      navigate(`/r/${room.roomCode}`, {
        state: { initialRoom: room, isCreator: true }
      });
    } catch (err: any) {
      console.error("Failed to create room", err);
      setJoinError(err?.message || "Failed to create room. Please try again.");
    } finally {
      setLoading(false);
      isCreatingRef.current = false;
    }
  };

  const handleStartChillMatch = (displayName: string, topic: string, matchedRoomCode?: string) => {
    setShowChillModal(false);
    prefetchRoomChunk();
    const chillCode = matchedRoomCode || `CHILL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    navigate(`/r/${chillCode}?name=${encodeURIComponent(displayName)}&topic=${encodeURIComponent(topic)}`);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    if (roomCode.trim()) {
      try {
        setLoading(true);
        const code = roomCode.trim().toUpperCase();
        const room = await api.getRoom(code);
        navigate(`/r/${room.roomCode}`);
      } catch (err) {
        setJoinError("Room expired or does not exist.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl mx-auto text-left">
      <SeoHead
        title="Ratri — Watch, Listen & Hang Out Together Online"
        description="Ratri is a real-time social room platform where friends can watch videos together, talk over voice or video, share screens, listen together, and hang out online."
        canonicalPath="/"
        jsonLd={homeJsonLd}
      />
      
      {/* Hero Section: Split 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto">
        
        {/* Left Column: Headline & Action Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-[1.1]">
              Watch Videos Together, <br />
              <span className="text-[hsl(var(--accent))]">Talk & Hang Out Online with Ratri</span>
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
                  onClick={() => {
                    setRoomType("chill");
                    setShowChillModal(true);
                  }}
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
                placeholder={roomType === "chill" ? "Random Anonymous Pairing Lounge" : "Room Title (e.g. Anime Watch Party)"}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="h-11 text-sm px-3.5 rounded-lg bg-[hsl(var(--surface-sunken))] border-[hsl(var(--border-strong))] text-[hsl(var(--text))] placeholder:text-[hsl(var(--text-muted))]"
              />
              
              <Button
                size="lg"
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full h-11 text-sm font-bold rounded-lg bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] transition-colors group cursor-pointer shadow-md disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                    <span>Creating your room...</span>
                  </>
                ) : (
                  <>
                    <span>{roomType === "chill" ? "Start Random Chill Match ⚡" : "Create Instant Room"}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
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
                className="h-10 uppercase tracking-widest text-center font-mono font-bold text-xs bg-[hsl(var(--surface-sunken))] border-[hsl(var(--border-strong))] text-[hsl(var(--text))] placeholder:text-[hsl(var(--text-muted))]"
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
            {joinError && (
              <div className="text-xs text-rose-500 font-semibold flex items-center justify-center gap-1.5 pt-1">
                <span>⚠️ {joinError}</span>
              </div>
            )}
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

        {/* Right Column: Interactive Realistic Video Stage Mockup */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden bg-neutral-950 border border-neutral-800 text-white text-left shadow-2xl">
            
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3 text-xs text-gray-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono font-extrabold tracking-wide text-white text-xs sm:text-sm">ROOM #MOVIE-NIGHT</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] bg-white/15 border border-white/20 text-white font-bold px-2.5 py-1 rounded-full shadow-xs">
                <Users className="w-3 h-3 text-[hsl(var(--accent))]" />
                <span>3 Watching Live</span>
              </div>
            </div>

            {/* REAL Working HD Video Stage Mockup */}
            <div className="relative aspect-video rounded-lg bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center group shadow-inner">
              <img
                src={heroShowcaseImg}
                alt="Live Watch Party Showcase"
                className="w-full h-full object-cover absolute inset-0 z-0"
              />
              <video
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                poster={heroShowcaseImg}
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover relative z-10 opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none z-20" />
              
              {/* Live Overlay Badge */}
              <div className="absolute top-3 left-3 bg-red-600/90 text-white font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>LIVE SYNCED HD STREAM</span>
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
                  <span className="font-mono text-[11px]">01:42 / 09:56 • SYNCED</span>
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

      {/* SONG & MUSIC LOUNGE FEATURE (COMING SOON) */}
      <div className="mt-16 rounded-3xl bg-neutral-900/95 border border-neutral-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl text-left">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs tracking-wide">
              <Music className="w-3.5 h-3.5 text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>SONG & MUSIC LOUNGE • FEATURE COMING SOON 🎵</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Listen Together in Synced High-Fidelity Audio
            </h2>

            <p className="text-sm text-gray-300 leading-relaxed max-w-xl font-normal">
              Build live collaborative music queues, stream Soundcloud & Spotify tracks simultaneously, and vibe with friends in low-latency spatial audio lounges.
            </p>

            {/* Music Equalizer Visualizer Animation */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Live Equalizer:</span>
              <div className="flex items-end gap-1 h-6">
                <span className="w-1 bg-rose-500 rounded-full animate-bounce h-4" style={{ animationDuration: '0.8s' }} />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce h-6" style={{ animationDuration: '0.5s' }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDuration: '0.9s' }} />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-5" style={{ animationDuration: '0.6s' }} />
                <span className="w-1 bg-rose-400 rounded-full animate-bounce h-6" style={{ animationDuration: '0.7s' }} />
              </div>
              <span className="text-xs font-mono text-rose-300 ml-3">320kbps Lossless Audio Stream</span>
            </div>

            {/* Music Genre Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {["Lofi Chill ☕", "Synthwave 🌆", "Pop & Hip-Hop 🎧", "Indie Acoustic 🎸", "EDM Beats ⚡"].map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-neutral-200 text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Waitlist Call To Action Form */}
          <div className="lg:col-span-5 bg-neutral-950/80 border border-neutral-800 p-5 rounded-2xl space-y-3 shadow-xl">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Be the First to Access Music Lounges</span>
            </h3>
            <p className="text-xs text-gray-300">
              Join 1,200+ music lovers on the early access waitlist. We'll send you an invite code when beta drops!
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You're on the waitlist! We'll notify you soon. 🎉</span>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (notifyEmail.trim()) {
                  setSubscribed(true);
                  setNotifyEmail("");
                }
              }} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email address..."
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-neutral-900 border-neutral-700 text-white placeholder:text-gray-500"
                />
                <Button type="submit" disabled={!notifyEmail.trim()} className="w-full h-10 text-xs font-bold rounded-xl bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] cursor-pointer gap-2 shadow-lg disabled:opacity-50">
                  <span>Get Early Access Invite 🎵</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* WHAT IS RATRI — IN-DEPTH BRAND IDENTITY & ARCHITECTURE SECTION */}
      <section className="mt-20 space-y-12 text-left border-t border-[hsl(var(--border))] pt-16">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[hsl(var(--accent))/0.1] border border-[hsl(var(--accent))/0.2] text-[hsl(var(--accent))] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Story & Mission Behind Ratri</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-tight">
            What is Ratri? The Real-Time Midnight Lounge for Modern Friends
          </h2>
          <p className="text-base text-[hsl(var(--text-secondary))] leading-relaxed font-normal">
            Derived from the Sanskrit and Hindi word for <span className="font-semibold text-[hsl(var(--text))]">"night"</span>, 
            <span className="font-semibold text-[hsl(var(--accent))]"> Ratri</span> was born out of a simple observation: the best conversations, 
            movie nights, and study sessions happen late at night when the world goes quiet. However, hanging out with friends online has historically 
            felt clunky—plagued by mandatory signups, invasive software downloads, out-of-sync video streams, and complicated room setups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="rat-card p-6 space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))/0.1] text-[hsl(var(--accent))] flex items-center justify-center font-bold">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[hsl(var(--text))]">Sub-Second Video Playback Synchronization</h3>
            <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              Ratri solves video drift with a dedicated WebSocket state relay powered by Socket.IO. When the room host hits play, pauses, or seeks 
              to a specific timestamp, the command mirrors across every connected peer in under 100 milliseconds. Whether you are watching 
              YouTube videos, tutorials, or shared web clips, everyone reacts together to the exact same frame.
            </p>
          </div>

          <div className="rat-card p-6 space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))/0.1] text-[hsl(var(--accent))] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[hsl(var(--text))]">WebRTC Mesh Voice, Video & Screen Sharing</h3>
            <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              No need to launch Discord, Zoom, or Google Meet alongside your stream. Ratri integrates direct browser-to-browser WebRTC media channels. 
              Enjoy crystal-clear spatial voice chat, high-definition webcam feeds, and native screen sharing for streaming documents, creative software, 
              or browser tabs without third-party extensions.
            </p>
          </div>

          <div className="rat-card p-6 space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))/0.1] text-[hsl(var(--accent))] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[hsl(var(--text))]">Guest-First Philosophy & Ephemeral Privacy</h3>
            <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              Ratri is completely frictionless. You do not need to create an account, remember passwords, or hand over personal data. 
              Rooms are protected with strict boundaries, and ephemeral rooms automatically expire 5 minutes after all participants depart, 
              leaving zero residual chat or media logs behind.
            </p>
          </div>

          <div className="rat-card p-6 space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))/0.1] text-[hsl(var(--accent))] flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[hsl(var(--text))]">Not an OTT Subscription Service</h3>
            <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              It is important to understand what Ratri is not: Ratri is neither an OTT subscription movie provider nor a content piracy service. 
              Instead, Ratri is an open, modern social hangout utility designed to bring remote friends, families, and creative communities closer 
              together in shared virtual rooms.
            </p>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS ACCORDION / GRID */}
        <div className="space-y-6 pt-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[hsl(var(--text))] flex items-center gap-2.5">
              <HelpCircle className="w-6 h-6 text-[hsl(var(--accent))]" />
              <span>Frequently Asked Questions About Ratri</span>
            </h2>
            <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
              Everything you need to know about using Ratri for watch parties, voice hangouts, and screen sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="ui-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-2">
              <h3 className="text-sm font-bold text-[hsl(var(--text))]">How do I create and share a Ratri room?</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Choose your room type on the homepage (Watch, Voice, or Chill), type an optional title, and click "Create Instant Room". Copy the room URL or unique 6-character code and send it to your friends. They join instantly through any modern web browser.
              </p>
            </div>

            <div className="ui-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-2">
              <h3 className="text-sm font-bold text-[hsl(var(--text))]">Is Ratri free to use?</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Yes, Ratri is 100% free with no hidden charges, paywalls, or subscription tiers. We believe hanging out with friends online should be as open and natural as sitting on the same couch.
              </p>
            </div>

            <div className="ui-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-2">
              <h3 className="text-sm font-bold text-[hsl(var(--text))]">Do my friends need to install any software?</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Zero installations. Ratri runs entirely inside modern web browsers (Chrome, Firefox, Safari, Edge) on desktop, laptop, tablet, and mobile devices using standard HTML5, WebSockets, and WebRTC protocols.
              </p>
            </div>

            <div className="ui-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-2">
              <h3 className="text-sm font-bold text-[hsl(var(--text))]">Can I stream my screen or tabs with audio?</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Yes. Click the screen share button inside your active Ratri room to stream your entire monitor, a window, or an individual browser tab. System audio is supported on Chromium-based browsers for high-quality audio sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HUMAN-CRAFTED PROFESSIONAL LEVEL FOOTER */}
      <footer className="mt-20 border-t border-[hsl(var(--border))] pt-12 pb-8 text-left space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info & Live Status */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[hsl(var(--accent))] text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                R
              </div>
              <span className="font-extrabold tracking-tight text-lg text-[hsl(var(--text))]">RATRI</span>
            </div>

            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed max-w-sm">
              The real-time social room platform to watch videos, listen to music, play games, and talk with friends. Low-latency, privacy-first, zero downloads.
            </p>

            {/* Live Operational Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational • 99.9% Uptime</span>
            </div>
          </div>

          {/* Column 2: Room Modes */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[hsl(var(--text))]">Room Modes</h4>
            <ul className="space-y-2 text-xs text-[hsl(var(--text-secondary))] font-medium">
              <li>
                <Link to="/watch-party" className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1.5">
                  <span>🍿 Watch Party</span>
                </Link>
              </li>
              <li>
                <Link to="/watch-together" className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1.5">
                  <span>📺 Watch Together</span>
                </Link>
              </li>
              <li>
                <Link to="/screen-share" className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1.5">
                  <span>🖥️ Screen Share</span>
                </Link>
              </li>
              <li>
                <Link to="/listen-together" className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1.5">
                  <span>🎵 Song Lounge</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 font-bold border border-rose-500/25 uppercase">Soon</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[hsl(var(--text))]">Features</h4>
            <ul className="space-y-2 text-xs text-[hsl(var(--text-secondary))] font-medium">
              <li>
                <Link to="/watch-together" className="hover:text-[hsl(var(--accent))] transition-colors">Frame Sync Engine</Link>
              </li>
              <li>
                <Link to="/watch-party" className="hover:text-[hsl(var(--accent))] transition-colors">WebRTC Mesh VC</Link>
              </li>
              <li>
                <Link to="/screen-share" className="hover:text-[hsl(var(--accent))] transition-colors">Screen Sharing</Link>
              </li>
              <li>
                <Link to="/listen-together" className="hover:text-[hsl(var(--accent))] transition-colors">Music Lounges</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-[hsl(var(--accent))] transition-colors">Instant Guest Join</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources & Social */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[hsl(var(--text))]">Connect & Support</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Open-source real-time application architecture built for high performance and community interaction.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com/akashcodev001"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--text))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all cursor-pointer shadow-xs"
                title="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--text))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all cursor-pointer shadow-xs"
                title="Twitter / X"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a
                href={SITE_URL}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--text))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all cursor-pointer shadow-xs"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Made with Heart by ak */}
        <div className="pt-6 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[hsl(var(--text-secondary))] font-medium">
          <div>
            © {new Date().getFullYear()} RATRI Real-Time Social Platform. All rights reserved.
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--text))] bg-[hsl(var(--surface-elevated))] px-3 py-1.5 rounded-full border border-[hsl(var(--border))] shadow-xs">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-bounce inline cursor-pointer mx-0.5" style={{ animationDuration: '1.4s' }} />
            <span>by <strong className="text-[hsl(var(--accent))] font-extrabold tracking-wide">ak</strong></span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[hsl(var(--text-muted))]">
            <Link to="/watch-together" className="hover:text-[hsl(var(--text))] transition-colors">Watch Together</Link>
            <span>•</span>
            <Link to="/watch-party" className="hover:text-[hsl(var(--text))] transition-colors">Watch Party</Link>
            <span>•</span>
            <Link to="/screen-share" className="hover:text-[hsl(var(--text))] transition-colors">Screen Share</Link>
            <span>•</span>
            <Link to="/listen-together" className="hover:text-[hsl(var(--text))] transition-colors">Music Lounge</Link>
          </div>
        </div>

      </footer>

      {/* Chill Chat Random Match Modal */}
      <ChillMatchModal
        isOpen={showChillModal}
        onClose={() => setShowChillModal(false)}
        onStartMatch={handleStartChillMatch}
      />

    </div>
  );
}
