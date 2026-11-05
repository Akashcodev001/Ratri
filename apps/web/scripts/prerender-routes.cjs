const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('[prerender] dist/index.html not found. Please build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Shared Header HTML
const sharedHeaderHtml = `
<header class="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--surface)/0.9)] backdrop-blur-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2.5 font-bold text-lg text-[hsl(var(--text))] group">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20">
        <span class="font-extrabold text-sm">R</span>
      </div>
      <span class="font-display font-extrabold text-lg tracking-tight">RATRI</span>
    </a>
    <nav aria-label="Main Navigation" class="hidden sm:flex items-center gap-4 text-xs font-semibold text-[hsl(var(--text-secondary))]">
      <a href="/watch-together" class="hover:text-[hsl(var(--text))] transition-colors">Watch Together</a>
      <a href="/watch-party" class="hover:text-[hsl(var(--text))] transition-colors">Watch Party</a>
      <a href="/screen-share" class="hover:text-[hsl(var(--text))] transition-colors">Screen Share</a>
      <a href="/listen-together" class="hover:text-[hsl(var(--text))] transition-colors">Music Lounge</a>
    </nav>
    <div class="flex items-center gap-2 text-xs font-medium text-[hsl(var(--text-secondary))]">
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      <span>Online</span>
    </div>
  </div>
</header>
<nav aria-label="Mobile Navigation" class="sm:hidden border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-sunken)/0.8)] px-4 py-2 flex items-center justify-between text-[11px] font-semibold text-[hsl(var(--text-secondary))] overflow-x-auto gap-2">
  <a href="/watch-together" class="whitespace-nowrap px-1 py-0.5 hover:text-[hsl(var(--text))]">Watch Together</a>
  <span class="text-[hsl(var(--border-strong))]">•</span>
  <a href="/watch-party" class="whitespace-nowrap px-1 py-0.5 hover:text-[hsl(var(--text))]">Watch Party</a>
  <span class="text-[hsl(var(--border-strong))]">•</span>
  <a href="/screen-share" class="whitespace-nowrap px-1 py-0.5 hover:text-[hsl(var(--text))]">Screen Share</a>
  <span class="text-[hsl(var(--border-strong))]">•</span>
  <a href="/listen-together" class="whitespace-nowrap px-1 py-0.5 hover:text-[hsl(var(--text))]">Music Lounge</a>
</nav>
`;

// Shared Footer HTML
const sharedFooterHtml = `
<footer class="mt-20 border-t border-[hsl(var(--border))] pt-12 pb-8 text-left space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-xs text-[hsl(var(--text-secondary))]">
  <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
    <div class="md:col-span-5 space-y-4">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-[hsl(var(--accent))] text-white flex items-center justify-center font-extrabold text-sm shadow-md">R</div>
        <span class="font-extrabold tracking-tight text-lg text-[hsl(var(--text))]">RATRI</span>
      </div>
      <p class="leading-relaxed max-w-sm">
        The real-time social room platform to watch videos, listen to music, and talk with friends online. Low-latency, privacy-first, zero downloads.
      </p>
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold tracking-wide">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>All Systems Operational • 99.9% Uptime</span>
      </div>
    </div>
    <div class="md:col-span-2 space-y-3">
      <h4 class="font-extrabold uppercase tracking-wider text-[hsl(var(--text))]">Room Modes</h4>
      <ul class="space-y-2 font-medium">
        <li><a href="/watch-party" class="hover:text-[hsl(var(--accent))] transition-colors">🍿 Watch Party</a></li>
        <li><a href="/watch-together" class="hover:text-[hsl(var(--accent))] transition-colors">📺 Watch Together</a></li>
        <li><a href="/screen-share" class="hover:text-[hsl(var(--accent))] transition-colors">🖥️ Screen Share</a></li>
        <li><a href="/listen-together" class="hover:text-[hsl(var(--accent))] transition-colors">🎵 Song Lounge</a></li>
      </ul>
    </div>
    <div class="md:col-span-2 space-y-3">
      <h4 class="font-extrabold uppercase tracking-wider text-[hsl(var(--text))]">Features</h4>
      <ul class="space-y-2 font-medium">
        <li><a href="/watch-together" class="hover:text-[hsl(var(--accent))] transition-colors">Frame Sync Engine</a></li>
        <li><a href="/watch-party" class="hover:text-[hsl(var(--accent))] transition-colors">WebRTC Mesh VC</a></li>
        <li><a href="/screen-share" class="hover:text-[hsl(var(--accent))] transition-colors">Screen Sharing</a></li>
        <li><a href="/listen-together" class="hover:text-[hsl(var(--accent))] transition-colors">Music Lounges</a></li>
        <li><a href="/" class="hover:text-[hsl(var(--accent))] transition-colors">Instant Guest Join</a></li>
      </ul>
    </div>
    <div class="md:col-span-3 space-y-3">
      <h4 class="font-extrabold uppercase tracking-wider text-[hsl(var(--text))]">Connect &amp; Support</h4>
      <p class="leading-relaxed">
        Open-source real-time application architecture built for high performance and community interaction.
      </p>
      <div class="flex items-center gap-2 pt-1">
        <a href="https://github.com/akashcodev001/Ratri" target="_blank" rel="noreferrer" class="p-2 rounded-xl bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] text-[hsl(var(--text))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all">GitHub Repo</a>
        <a href="https://ratri-silk.vercel.app/" class="p-2 rounded-xl bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] text-[hsl(var(--text))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all">Official Site</a>
      </div>
    </div>
  </div>
  <div class="pt-6 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
    <div>&copy; 2026 RATRI Real-Time Social Platform. All rights reserved.</div>
    <div class="flex flex-wrap items-center justify-center gap-4 text-[hsl(var(--text-muted))]">
      <a href="/watch-together" class="hover:text-[hsl(var(--text))]">Watch Together</a>
      <span>•</span>
      <a href="/watch-party" class="hover:text-[hsl(var(--text))]">Watch Party</a>
      <span>•</span>
      <a href="/screen-share" class="hover:text-[hsl(var(--text))]">Screen Share</a>
      <span>•</span>
      <a href="/listen-together" class="hover:text-[hsl(var(--text))]">Music Lounge</a>
    </div>
  </div>
</footer>
`;

const routes = [
  {
    path: '',
    title: 'Ratri — Watch, Listen & Hang Out Together Online',
    description: 'Ratri is a real-time social room platform where friends can watch videos together, talk over voice or video, share screens, listen together, and hang out online.',
    canonical: 'https://ratri-silk.vercel.app/',
    bodyContent: `
    <div class="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))] flex flex-col font-sans">
      ${sharedHeaderHtml}
      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-16 text-left">
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div class="lg:col-span-6 space-y-6">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-[1.1]">
              Watch Videos Together, <br />
              <span class="text-[hsl(var(--accent))]">Talk &amp; Hang Out Online with Ratri</span>
            </h1>
            <p class="text-base sm:text-lg text-[hsl(var(--text-secondary))] max-w-xl font-normal leading-relaxed">
              Create a room in 1 second. Share the link with friends to watch videos, listen to music, and talk over low-latency audio—no signups or downloads needed.
            </p>
            <div class="rat-card p-6 space-y-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
              <div class="space-y-1.5">
                <span class="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider block">1. Select Room Type</span>
                <div class="grid grid-cols-3 gap-2 p-1 rounded-lg bg-[hsl(var(--surface-sunken))]">
                  <span class="flex items-center justify-center py-2 px-3 rounded-md text-xs font-bold bg-[hsl(var(--accent))] text-white shadow-sm">Watch 🍿</span>
                  <span class="flex items-center justify-center py-2 px-3 rounded-md text-xs font-bold text-[hsl(var(--text-secondary))]">Voice 🎙️</span>
                  <span class="flex items-center justify-center py-2 px-3 rounded-md text-xs font-bold text-[hsl(var(--text-secondary))]">Chill ⚡</span>
                </div>
              </div>
              <a href="/watch-together" class="w-full h-11 text-sm font-bold rounded-lg bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] flex items-center justify-center gap-2 shadow-md">
                <span>Create Instant Room &rarr;</span>
              </a>
              <div class="text-center pt-1 text-xs text-[hsl(var(--text-secondary))] font-medium">
                Guest friendly • No password or account setup required
              </div>
            </div>
          </div>
          <div class="lg:col-span-6">
            <div class="rounded-2xl p-4 sm:p-5 bg-neutral-950 border border-neutral-800 text-white text-left shadow-2xl space-y-3">
              <div class="flex items-center justify-between border-b border-white/15 pb-2 text-xs">
                <span class="font-mono font-extrabold tracking-wide text-white">ROOM #MOVIE-NIGHT</span>
                <span class="text-[11px] bg-white/15 px-2 py-0.5 rounded-full font-bold">3 Watching Live</span>
              </div>
              <div class="relative aspect-video rounded-lg bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center">
                <img src="/hero_showcase.jpg" alt="Ratri Live Watch Party Showcase" class="w-full h-full object-cover" />
                <div class="absolute top-3 left-3 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">LIVE SYNCED HD STREAM</div>
              </div>
              <p class="text-xs text-gray-300">Synchronized video playback with WebRTC spatial audio and real-time chat.</p>
            </div>
          </div>
        </section>

        <!-- Feature Cards -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="rat-card p-5 space-y-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <h3 class="font-bold text-sm text-[hsl(var(--text))]">Frame-Accurate Video Sync</h3>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              State-machine playback control ensures everyone in the room watches the exact same video frame synchronously.
            </p>
          </div>
          <div class="rat-card p-5 space-y-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <h3 class="font-bold text-sm text-[hsl(var(--text))]">Low-Latency WebRTC Voice</h3>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Drop into crystal-clear spatial audio or share high-definition camera and screen streams with zero configuration.
            </p>
          </div>
          <div class="rat-card p-5 space-y-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <h3 class="font-bold text-sm text-[hsl(var(--text))]">Guest-First Access</h3>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              No forced user registration or account setup required. Send your unique 6-character room link to start immediately.
            </p>
          </div>
        </section>

        <!-- Brand Identity & Mission -->
        <section class="border-t border-[hsl(var(--border))] pt-16 space-y-8 text-left">
          <div class="max-w-3xl space-y-3">
            <span class="text-xs font-bold tracking-wide uppercase text-[hsl(var(--accent))]">The Story &amp; Mission Behind Ratri</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--text))]">
              What is Ratri? The Real-Time Midnight Lounge for Modern Friends
            </h2>
            <p class="text-base text-[hsl(var(--text-secondary))] leading-relaxed font-normal">
              Derived from the Sanskrit and Hindi word for "night", Ratri was created so friends can watch synchronized videos, listen to music, talk over WebRTC voice and video, and share screens together online—without logins, downloads, or buffer lag.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="rat-card p-6 space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
              <h3 class="text-base font-bold text-[hsl(var(--text))]">Sub-Second Video Playback Synchronization</h3>
              <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Ratri uses a high-performance Socket.IO state relay. When the room host plays, pauses, or seeks, playback timestamps synchronize across all connected peers in sub-100ms time.
              </p>
            </div>
            <div class="rat-card p-6 space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
              <h3 class="text-base font-bold text-[hsl(var(--text))]">WebRTC Mesh Voice, Video &amp; Screen Sharing</h3>
              <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Direct browser-to-browser WebRTC channels provide spatial voice chat, webcam streams, and native desktop or browser tab screen sharing with system audio.
              </p>
            </div>
            <div class="rat-card p-6 space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
              <h3 class="text-base font-bold text-[hsl(var(--text))]">Guest-First Philosophy &amp; Ephemeral Privacy</h3>
              <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Zero signups, no passwords, and no personal data collection. Ephemeral rooms expire automatically 5 minutes after everyone departs, keeping your sessions private.
              </p>
            </div>
            <div class="rat-card p-6 space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
              <h3 class="text-base font-bold text-[hsl(var(--text))]">Not an OTT Subscription Service</h3>
              <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Ratri is neither an OTT streaming provider nor a piracy platform. It is a modern social hangout utility for synchronized co-viewing, voice lounges, and collaboration.
              </p>
            </div>
          </div>
        </section>

        <!-- FAQs -->
        <section class="space-y-6 pt-4 text-left">
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[hsl(var(--text))]">
            Frequently Asked Questions About Ratri
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-2">
              <h3 class="text-sm font-bold text-[hsl(var(--text))]">What is Ratri and what does the name mean?</h3>
              <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Ratri (derived from the Sanskrit and Hindi word for night) is a real-time social room platform designed for friends to watch synchronized videos, listen to music, talk over WebRTC voice and video, and share screens together online.
              </p>
            </div>
            <div class="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-2">
              <h3 class="text-sm font-bold text-[hsl(var(--text))]">Do I or my friends need an account to use Ratri?</h3>
              <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                No. Ratri is guest-first. Anyone can create an instant room, share the 6-character code or link with friends, and start watching or talking immediately with zero signups or software downloads.
              </p>
            </div>
            <div class="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-2">
              <h3 class="text-sm font-bold text-[hsl(var(--text))]">How does video synchronization work on Ratri?</h3>
              <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Ratri uses WebSocket signaling through Socket.IO to mirror video playback state across participants. Play, pause, and seek events sync to the exact same millisecond across all viewers.
              </p>
            </div>
            <div class="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-2">
              <h3 class="text-sm font-bold text-[hsl(var(--text))]">Can I share my screen with audio on Ratri?</h3>
              <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                Yes. Ratri provides in-browser WebRTC screen sharing. You can share your entire screen, an application window, or a browser tab directly inside the room without external software.
              </p>
            </div>
          </div>
        </section>
      </main>
      ${sharedFooterHtml}
    </div>
    `
  },
  {
    path: 'watch-together',
    title: 'Watch Together Online with Synchronized Playback — Ratri',
    description: 'Watch synchronized YouTube & web videos with friends in real-time. Instant browser rooms, low-latency spatial voice chat, and zero signups required.',
    canonical: 'https://ratri-silk.vercel.app/watch-together',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Watch Together Online with Synchronized Playback — Ratri',
      url: 'https://ratri-silk.vercel.app/watch-together',
      description: 'Watch synchronized YouTube and web videos together with friends in real-time. Zero signups, low-latency WebRTC spatial voice & text chat.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ratri-silk.vercel.app/' },
          { '@type': 'ListItem', position: 2, name: 'Watch Together', item: 'https://ratri-silk.vercel.app/watch-together' }
        ]
      }
    },
    bodyContent: `
    <div class="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))] flex flex-col font-sans">
      ${sharedHeaderHtml}
      <main class="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-center">
        <section class="space-y-6 max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--accent))/0.1] border border-[hsl(var(--accent))/0.2] text-[hsl(var(--accent))] text-xs font-semibold uppercase tracking-wider">
            Synchronized Playback
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-tight">
            Watch Videos Together Online with Friends
          </h1>
          <p class="text-sm sm:text-base text-[hsl(var(--text-secondary))] leading-relaxed">
            Create an instant browser room, paste any YouTube link, and enjoy frame-perfect playback synchronization with crystal-clear spatial voice chat. No account needed.
          </p>
          <div class="pt-2">
            <a href="/" class="px-6 py-3.5 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm rounded-xl shadow-lg transition-all inline-flex items-center gap-2">
              Start Watch Room Now &rarr;
            </a>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Frame-Sync Playback</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Automatic drift correction ensures all participants watch every frame simultaneously without buffer lags.
            </p>
          </div>
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Low-Latency Voice Lounge</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Peer-to-peer WebRTC voice and video streams let you talk, laugh, and react in real-time as you watch.
            </p>
          </div>
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Zero Account Mandatory</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              No mandatory signup or password required. Click a link, enter your display name, and join instantly.
            </p>
          </div>
        </section>

        <section class="p-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-6 text-left">
          <h2 class="text-xl font-bold text-center text-[hsl(var(--text))]">How to Watch Videos Together in 3 Steps</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[hsl(var(--text-secondary))]">
            <div class="space-y-2">
              <strong class="text-sm font-bold text-[hsl(var(--text))] block">1. Launch Room</strong>
              <p>Click "Create Instant Room" on Ratri. Your secure room is generated in milliseconds.</p>
            </div>
            <div class="space-y-2">
              <strong class="text-sm font-bold text-[hsl(var(--text))] block">2. Share Code</strong>
              <p>Copy your unique 6-character room code or link and send it to your friends.</p>
            </div>
            <div class="space-y-2">
              <strong class="text-sm font-bold text-[hsl(var(--text))] block">3. Watch in Sync</strong>
              <p>Paste any supported video link. Play, pause, seek, and react in perfect synchronization.</p>
            </div>
          </div>
        </section>
      </main>
      ${sharedFooterHtml}
    </div>
    `
  },
  {
    path: 'watch-party',
    title: 'Create Virtual Watch Parties Online — Ratri',
    description: 'Host virtual movie nights and watch parties with friends remotely. Free, instant browser rooms with voice lounge and live reactions.',
    canonical: 'https://ratri-silk.vercel.app/watch-party',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Create Virtual Watch Parties Online — Ratri',
      url: 'https://ratri-silk.vercel.app/watch-party',
      description: 'Host virtual movie nights and watch parties with friends remotely. Free, instant browser rooms with voice lounge and live reactions.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ratri-silk.vercel.app/' },
          { '@type': 'ListItem', position: 2, name: 'Watch Party', item: 'https://ratri-silk.vercel.app/watch-party' }
        ]
      }
    },
    bodyContent: `
    <div class="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))] flex flex-col font-sans">
      ${sharedHeaderHtml}
      <main class="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-center">
        <section class="space-y-6 max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--accent))/0.1] border border-[hsl(var(--accent))/0.2] text-[hsl(var(--accent))] text-xs font-semibold uppercase tracking-wider">
            Virtual Movie Nights
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-tight">
            Host Virtual Watch Parties with Friends
          </h1>
          <p class="text-sm sm:text-base text-[hsl(var(--text-secondary))] leading-relaxed">
            Gather your friends for weekend movie marathons and binge-watch sessions. Real-time video synchronization, group chat, and WebRTC audio lounge.
          </p>
          <div class="pt-2">
            <a href="/" class="px-6 py-3.5 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm rounded-xl shadow-lg transition-all inline-flex items-center gap-2">
              Create Watch Party &rarr;
            </a>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Shared Playback Controls</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Everyone stays on the exact same frame. When someone pauses for snacks, the video pauses for everyone.
            </p>
          </div>
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Voice &amp; Video Lounges</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Talk and laugh through low-latency WebRTC audio while watching without needing Discord or Zoom.
            </p>
          </div>
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Live Reactions &amp; Chat</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Drop real-time emoji reactions that float across the screen and chat with everyone in the room.
            </p>
          </div>
        </section>
      </main>
      ${sharedFooterHtml}
    </div>
    `
  },
  {
    path: 'screen-share',
    title: 'Real-Time Screen Sharing Lounge — Ratri',
    description: 'Share your screen with friends online in real-time. High-quality WebRTC video streaming with low latency and spatial voice chat.',
    canonical: 'https://ratri-silk.vercel.app/screen-share',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Real-Time Screen Sharing Lounge — Ratri',
      url: 'https://ratri-silk.vercel.app/screen-share',
      description: 'Share your screen with friends online in real-time. High-quality WebRTC video streaming with low latency and spatial voice chat.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ratri-silk.vercel.app/' },
          { '@type': 'ListItem', position: 2, name: 'Screen Share', item: 'https://ratri-silk.vercel.app/screen-share' }
        ]
      }
    },
    bodyContent: `
    <div class="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))] flex flex-col font-sans">
      ${sharedHeaderHtml}
      <main class="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-center">
        <section class="space-y-6 max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--accent))/0.1] border border-[hsl(var(--accent))/0.2] text-[hsl(var(--accent))] text-xs font-semibold uppercase tracking-wider">
            WebRTC Screen Sharing
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-tight">
            Share Your Screen with Friends in Real Time
          </h1>
          <p class="text-sm sm:text-base text-[hsl(var(--text-secondary))] leading-relaxed">
            Stream your desktop, application windows, or browser tabs directly to your friends with ultra-low latency and crystal-clear audio passthrough.
          </p>
          <div class="pt-2">
            <a href="/" class="px-6 py-3.5 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm rounded-xl shadow-lg transition-all inline-flex items-center gap-2">
              Start Screen Sharing &rarr;
            </a>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Full Screen &amp; Window Capture</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Share your entire monitor, creative applications (Figma, Photoshop, VS Code), or single browser tabs with 60 FPS streaming.
            </p>
          </div>
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">System Audio Streaming</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Chromium-based tab audio passthrough lets your friends hear games, movies, and music in high fidelity.
            </p>
          </div>
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Zero Software Plugins</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Works directly through modern HTML5 screen capture APIs without downloading third-party software or extensions.
            </p>
          </div>
        </section>
      </main>
      ${sharedFooterHtml}
    </div>
    `
  },
  {
    path: 'listen-together',
    title: 'Listen to Music Together Online — Ratri',
    description: 'Listen to music together with friends in virtual sound lounges. Synchronized audio playback with spatial voice chat.',
    canonical: 'https://ratri-silk.vercel.app/listen-together',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Listen to Music Together Online — Ratri',
      url: 'https://ratri-silk.vercel.app/listen-together',
      description: 'Listen to music together with friends in virtual sound lounges. Synchronized audio playback with spatial voice chat.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ratri-silk.vercel.app/' },
          { '@type': 'ListItem', position: 2, name: 'Listen Together', item: 'https://ratri-silk.vercel.app/listen-together' }
        ]
      }
    },
    bodyContent: `
    <div class="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))] flex flex-col font-sans">
      ${sharedHeaderHtml}
      <main class="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-center">
        <section class="space-y-6 max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--accent))/0.1] border border-[hsl(var(--accent))/0.2] text-[hsl(var(--accent))] text-xs font-semibold uppercase tracking-wider">
            Audio &amp; Music Lounge
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--text))] leading-tight">
            Listen to Music Together with Friends
          </h1>
          <p class="text-sm sm:text-base text-[hsl(var(--text-secondary))] leading-relaxed">
            Create collaborative sound lounges, vibe to synchronized music streams, and talk with friends in crystal-clear WebRTC audio.
          </p>
          <div class="pt-2">
            <a href="/" class="px-6 py-3.5 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm rounded-xl shadow-lg transition-all inline-flex items-center gap-2">
              Enter Music Lounge &rarr;
            </a>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Synchronized Sound Queues</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Everyone in the room hears the exact same beat in real-time with sub-second synchronization.
            </p>
          </div>
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Spatial Audio Chat</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Talk and sing along with friends without distorting or muting the underlying music stream.
            </p>
          </div>
          <div class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
            <h2 class="text-base font-bold text-[hsl(var(--text))]">Lossless 320kbps Quality</h2>
            <p class="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              High-definition audio streaming optimized for headphones, desktop speakers, and mobile listening.
            </p>
          </div>
        </section>
      </main>
      ${sharedFooterHtml}
    </div>
    `
  }
];

routes.forEach((route) => {
  let html = baseHtml;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);
  html = html.replace(/<meta\s+name=["']title["']\s+content=["'][^"']*["']/i, `<meta name="title" content="${route.title}"`);

  // Replace Description
  html = html.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']/i, `<meta name="description" content="${route.description}"`);

  // Replace Canonical
  html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["']/i, `<link rel="canonical" href="${route.canonical}"`);

  // Replace Open Graph
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']/i, `<meta property="og:title" content="${route.title}"`);
  html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']/i, `<meta property="og:description" content="${route.description}"`);
  html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'][^"']*["']/i, `<meta property="og:url" content="${route.canonical}"`);

  // Replace Twitter
  html = html.replace(/<meta\s+property=["']twitter:title["']\s+content=["'][^"']*["']/i, `<meta property="twitter:title" content="${route.title}"`);
  html = html.replace(/<meta\s+property=["']twitter:description["']\s+content=["'][^"']*["']/i, `<meta property="twitter:description" content="${route.description}"`);
  html = html.replace(/<meta\s+property=["']twitter:url["']\s+content=["'][^"']*["']/i, `<meta property="twitter:url" content="${route.canonical}"`);

  // Replace JSON-LD if route has custom one
  if (route.jsonLd) {
    const jsonLdString = JSON.stringify(route.jsonLd, null, 2);
    html = html.replace(/<script type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i, `<script type="application/ld+json">\n${jsonLdString}\n    </script>`);
  }

  // INJECT PRERENDERED SEMANTIC CONTENT DIRECTLY INTO <div id="root">
  if (route.bodyContent) {
    html = html.replace(/<div id=["']root["']>[\s\S]*?<\/div>/i, `<div id="root">\n${route.bodyContent}\n    </div>`);
  }

  if (route.path === '') {
    // Root homepage: update dist/index.html
    fs.writeFileSync(indexHtmlPath, html, 'utf8');
    console.log('[prerender] Injected full semantic prerendered content into dist/index.html (/)');
  } else {
    // Sub-route: write to dist/{route.path}/index.html
    const routeDir = path.join(distDir, route.path);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    const outputPath = path.join(routeDir, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`[prerender] Generated static prerendered HTML for: /${route.path}`);
  }
});

console.log('[prerender] Successfully generated full semantic static HTML for all 5 public routes!');
