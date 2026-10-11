import { useNavigate, Link } from 'react-router-dom';
import { SeoHead } from '../components/seo/SeoHead';
import { PartyPopper, Tv, Sparkles, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

export function WatchParty() {
  const navigate = useNavigate();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Create Virtual Watch Parties Online — Ratri',
    url: 'https://ratri.app/watch-party',
    description: 'Host virtual movie nights and watch parties with friends remotely. Free, instant browser rooms with voice lounge and live reactions.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ratri.app/' },
        { '@type': 'ListItem', position: 2, name: 'Watch Party', item: 'https://ratri.app/watch-party' },
      ],
    },
  };

  const handleCreateRoom = async () => {
    try {
      const room = await api.createRoom('Watch Party Lounge', 'watch');
      navigate(`/r/${room.roomCode}`);
    } catch (e) {
      console.error('Failed to create room', e);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      <SeoHead
        title="Virtual Watch Party Online with Friends (Zero Signup) — Ratri"
        description="Host virtual movie nights and watch parties online with friends remotely. Enjoy synchronized video streaming, spatial voice chat, and live emoji reactions."
        canonicalPath="/watch-party"
        jsonLd={jsonLd}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <PartyPopper className="w-3.5 h-3.5" /> Virtual Watch Parties
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-tight">
            Host Virtual Movie Nights & Watch Parties Online
          </h1>
          <p className="text-sm sm:text-base text-[hsl(var(--text-secondary))] leading-relaxed">
            Gather your friends in a private social watch room. Synchronize video playback, chat over live WebRTC audio/video, and share real-time reactions without creating an account.
          </p>
          <div className="pt-2">
            <button
              onClick={handleCreateRoom}
              className="px-6 py-3.5 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm rounded-xl shadow-lg shadow-[hsl(var(--accent))/0.25] transition-all transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
            >
              Create Your Watch Party Room <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Tv className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Synchronized Video Lounge</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Everyone stays strictly in sync. Pause, play, or seek, and every participant reflects the exact frame instantaneously.
            </p>
          </div>

          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Floating Emoji Reactions</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Express yourself with animated floating reactions that burst across the screen during intense movie moments.
            </p>
          </div>

          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Voice & Text Moderation</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Maintain control over your party with host controls, kick/mute features, and room locking options.
            </p>
          </div>
        </section>

        {/* Related Feature Navigation */}
        <section className="border-t border-[hsl(var(--border))] pt-8 text-center space-y-4">
          <h2 className="text-sm font-bold text-[hsl(var(--text))]">Explore More Ways to Hang Out on Ratri</h2>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-[hsl(var(--accent))]">
            <Link to="/watch-together" className="hover:underline">Watch Videos Together</Link>
            <span>•</span>
            <Link to="/screen-share" className="hover:underline">Screen Share Lounge</Link>
            <span>•</span>
            <Link to="/listen-together" className="hover:underline">Listen to Music Together</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
