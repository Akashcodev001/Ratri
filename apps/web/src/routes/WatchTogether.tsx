import { useNavigate } from 'react-router-dom';
import { SeoHead } from '../components/seo/SeoHead';
import { Users, Video, Zap, Shield, Play } from 'lucide-react';

export function WatchTogether() {
  const navigate = useNavigate();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Watch Together Online with Synchronized Playback — Ratri',
    url: 'https://ratri.app/watch-together',
    description: 'Watch synchronized YouTube and web videos together with friends in real-time. Zero signups, low-latency WebRTC spatial voice & text chat.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ratri.app/' },
        { '@type': 'ListItem', position: 2, name: 'Watch Together', item: 'https://ratri.app/watch-together' },
      ],
    },
  };

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/r/${code}`);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      <SeoHead
        title="Watch Together Online with Synchronized Playback — Ratri"
        description="Watch synchronized YouTube & web videos with friends in real-time. Instant browser rooms, low-latency spatial voice chat, and zero signups required."
        canonicalPath="/watch-together"
        jsonLd={jsonLd}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--accent))/0.1] border border-[hsl(var(--accent))/0.2] text-[hsl(var(--accent))] text-xs font-semibold uppercase tracking-wider">
            <Play className="w-3.5 h-3.5 fill-current" /> Synchronized Playback
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-tight">
            Watch Videos Together Online with Friends
          </h1>
          <p className="text-sm sm:text-base text-[hsl(var(--text-secondary))] leading-relaxed">
            Create an instant browser room, paste any YouTube link, and enjoy frame-perfect playback synchronization with crystal-clear spatial voice chat. No account needed.
          </p>
          <div className="pt-2">
            <button
              onClick={handleCreateRoom}
              className="px-6 py-3.5 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm rounded-xl shadow-lg shadow-[hsl(var(--accent))/0.25] transition-all transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
            >
              Start Watch Room Now <Zap className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Core Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Frame-Sync Playback</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Automatic drift correction ensures all participants watch every frame simultaneously without buffer lags.
            </p>
          </div>

          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Low-Latency Voice Lounge</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Peer-to-peer WebRTC voice and video streams let you talk, laugh, and react in real-time as you watch.
            </p>
          </div>

          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Zero Account Mandatory</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              No mandatory signup or password required. Click a link, enter your display name, and join instantly.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="ui-card p-8 rounded-2xl border border-[hsl(var(--border))] space-y-6">
          <h2 className="text-xl font-bold text-center text-[hsl(var(--text))]">How to Watch Videos Together in 3 Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] font-bold text-xs flex items-center justify-center mx-auto border border-[hsl(var(--border))]">1</div>
              <h3 className="text-sm font-semibold text-[hsl(var(--text))]">Create a Room</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Generate a private room link in seconds with one click.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] font-bold text-xs flex items-center justify-center mx-auto border border-[hsl(var(--border))]">2</div>
              <h3 className="text-sm font-semibold text-[hsl(var(--text))]">Invite Friends</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Share the room code or URL with your friends via chat or email.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--surface-elevated))] text-[hsl(var(--accent))] font-bold text-xs flex items-center justify-center mx-auto border border-[hsl(var(--border))]">3</div>
              <h3 className="text-sm font-semibold text-[hsl(var(--text))]">Watch & Chat</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Paste your YouTube link and enjoy synced videos with live voice chat.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
