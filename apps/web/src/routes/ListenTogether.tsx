import { useNavigate } from 'react-router-dom';
import { SeoHead } from '../components/seo/SeoHead';
import { Music, Radio, Volume2, Sparkles } from 'lucide-react';

export function ListenTogether() {
  const navigate = useNavigate();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Listen to Music Together Online — Ratri',
    url: 'https://ratri.app/listen-together',
    description: 'Listen to music together with friends in virtual sound lounges. Synchronized audio playback with spatial voice chat.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ratri.app/' },
        { '@type': 'ListItem', position: 2, name: 'Listen Together', item: 'https://ratri.app/listen-together' },
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
        title="Listen to Music Together Online in Virtual Lounges — Ratri"
        description="Listen to music together with friends online in virtual sound lounges. Enjoy synchronized audio playback, spatial voice chat, and custom room atmospheres."
        canonicalPath="/listen-together"
        jsonLd={jsonLd}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Music className="w-3.5 h-3.5" /> Music Lounges
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-tight">
            Listen to Music & Chill Lounges with Friends
          </h1>
          <p className="text-sm sm:text-base text-[hsl(var(--text-secondary))] leading-relaxed">
            Relax in spatial audio lounges, queue your favorite tracks, and vibe with friends or matched chill partners in real-time.
          </p>
          <div className="pt-2">
            <button
              onClick={handleCreateRoom}
              className="px-6 py-3.5 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm rounded-xl shadow-lg shadow-[hsl(var(--accent))/0.25] transition-all transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
            >
              Enter Music Lounge <Radio className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Shared Music Queue</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Add tracks, organize playlists, and enjoy perfectly synchronized audio playback with your friends.
            </p>
          </div>

          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Spatial Voice Chat</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Experience warm, human voice audio with custom spatial audio channels for natural conversation.
            </p>
          </div>

          <div className="ui-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[hsl(var(--text))]">Atmospheric Themes</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Choose from Study, Chill, Music Party, or Gaming atmospheres to set the ideal mood.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
