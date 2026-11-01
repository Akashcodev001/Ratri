const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('[prerender] dist/index.html not found. Please build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const routes = [
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
    }
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
    }
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
    }
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
    }
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

  // Replace JSON-LD
  const jsonLdString = JSON.stringify(route.jsonLd);
  html = html.replace(/<script type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i, `<script type="application/ld+json">\n${jsonLdString}\n    </script>`);

  const routeDir = path.join(distDir, route.path);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const outputPath = path.join(routeDir, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`[prerender] Generated static HTML for: /${route.path}`);
});

console.log('[prerender] Successfully generated static route entry points for search engine pre-rendering.');
