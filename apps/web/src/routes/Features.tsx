import { Monitor, Music, Shield, Users, Video, Zap } from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';
import { getCanonicalUrl } from '../config/site';

const featureGroups = [
  {
    title: 'Watch videos together',
    description:
      'Create a private room, share a video link, and keep playback synchronized for everyone in the room.',
    id: 'watch-videos',
    icon: Video,
  },
  {
    title: 'Host watch parties',
    description:
      'Bring friends together for remote movie nights with live reactions, text chat, and voice or video conversation.',
    id: 'watch-parties',
    icon: Users,
  },
  {
    title: 'Share your screen',
    description:
      'Stream a browser tab, application window, presentation, or game with low-latency WebRTC video and audio.',
    id: 'screen-sharing',
    icon: Monitor,
  },
  {
    title: 'Listen and chill together',
    description:
      'Use shared music lounges with synchronized audio, shared queues, spatial voice chat, and custom atmospheres.',
    id: 'music-lounges',
    icon: Music,
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Ratri Features',
  url: getCanonicalUrl('/features'),
  description:
    'Explore Ratri features for synchronized video watching, online watch parties, screen sharing, music lounges, voice chat, and private guest rooms.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: featureGroups.map((feature, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: feature.title,
      url: `${getCanonicalUrl('/features')}#${feature.id}`,
    })),
  },
};

export function Features() {
  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      <SeoHead
        title="Ratri Features — Watch, Share, Listen and Hang Out Together"
        description="Explore everything Ratri offers: synchronized video watching, virtual watch parties, WebRTC screen sharing, music lounges, voice chat, and private guest rooms."
        canonicalPath="/features"
        jsonLd={jsonLd}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--accent))/0.1] border border-[hsl(var(--accent))/0.2] text-[hsl(var(--accent))] text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> One social room for everything
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Everything you can do with Ratri
          </h1>
          <p className="text-sm sm:text-base text-[hsl(var(--text-secondary))] leading-relaxed">
            Ratri gives friends one private browser room for watching videos, talking,
            sharing screens, listening to music, and hanging out together. No downloads
            or mandatory accounts.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Ratri features">
          {featureGroups.map(({ title, description, id, icon: Icon }) => (
            <article
              key={id}
              id={id}
              className="ui-card p-7 rounded-2xl border border-[hsl(var(--border))] space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[hsl(var(--accent))/0.1] text-[hsl(var(--accent))] flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                {description}
              </p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold">Guest-first rooms</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              Start with a room link and display name. No mandatory signup or password is required.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">Live communication</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              Talk over low-latency WebRTC voice and video while you watch, listen, or share.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold">Fast browser experience</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              Open a link in a modern browser and start collaborating without installing extra software.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
