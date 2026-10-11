import { useNavigate, Link } from 'react-router-dom';
import { SeoHead } from '../components/seo/SeoHead';
import { Monitor, Zap, Shield, Users } from 'lucide-react';
import { api } from '../services/api';

export function ScreenShareLanding() {
  const navigate = useNavigate();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Real-Time Screen Sharing Lounge — Ratri',
    url: 'https://ratri.app/screen-share',
    description: 'Share your screen with friends online in real-time. High-quality WebRTC video streaming with low latency and spatial voice chat.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ratri.app/' },
        { '@type': 'ListItem', position: 2, name: 'Screen Share', item: 'https://ratri.app/screen-share' },
      ],
    },
  };

  const handleCreateRoom = async () => {
    try {
      const room = await api.createRoom('Screen Stage', 'talk');
      navigate(`/r/${room.roomCode}`);
    } catch (e) {
      console.error('Failed to create room', e);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      <SeoHead
        title="Real-Time Screen Share Lounge with Friends — Ratri"
        description="Share your browser screen, gameplay, or presentations with friends online in real-time. Ultra low-latency WebRTC streaming with instant room links."
        canonicalPath="/screen-share"
        jsonLd={jsonLd}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Monitor className="w-3.5 h-3.5" /> WebRTC Screen Share
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-tight">
            Share Your Screen Online with Friends in Real-Time
          </h1>
          <p className="text-sm sm:text-base text-[hsl(var(--text-secondary))] leading-relaxed">
            Stream your entire screen, specific application window, or browser tab with high frame rates and low latency. Ideal for gaming, presentations, and collaborative viewing.
          </p>
          <div className="pt-2">
            <button
              onClick={handleCreateRoom}
              className="px-6 py-3.5 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm rounded-xl shadow-lg shadow-[hsl(var(--accent))/0.25] transition-all transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
            >
              Start Screen Share Lounge <Zap className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Low Latency WebRTC</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Sub-second video latency ensures instant real-time synchronization between host and spectators.
            </p>
          </div>

          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Private & Encrypted</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Peer-to-peer WebRTC connections keep your screen share stream secure between room members.
            </p>
          </div>

          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Integrated Voice Chat</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Talk and comment live with your friends while sharing your screen in full high definition.
            </p>
          </div>
        </section>

        {/* Related Feature Navigation */}
        <section className="border-t border-[hsl(var(--border))] pt-8 text-center space-y-4">
          <h2 className="text-sm font-bold text-[hsl(var(--text))]">Explore More Ways to Hang Out on Ratri</h2>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-[hsl(var(--accent))]">
            <Link to="/watch-together" className="hover:underline">Watch Videos Together</Link>
            <span>•</span>
            <Link to="/watch-party" className="hover:underline">Virtual Watch Party</Link>
            <span>•</span>
            <Link to="/listen-together" className="hover:underline">Listen to Music Together</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
