const https = require('https');
const fs = require('fs');
const path = require('path');

function testLocalFiles() {
  console.log('=== 1. Local Dist & Source SEO Validation ===');
  const distHtmlPath = path.join(__dirname, '../../apps/web/dist/index.html');
  if (!fs.existsSync(distHtmlPath)) {
    console.error('Dist index.html not found! Run build first.');
    return false;
  }
  const html = fs.readFileSync(distHtmlPath, 'utf8');

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']*)["']/i);
  const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i);
  const ogTypeMatch = html.match(/<meta\s+property=["']og:type["']\s+content=["']([^"']*)["']/i);
  const twitterUrlMatch = html.match(/<meta\s+property=["']twitter:url["']\s+content=["']([^"']*)["']/i);
  const twitterImgMatch = html.match(/<meta\s+property=["']twitter:image["']\s+content=["']([^"']*)["']/i);

  console.log('Dist HTML Canonical:', canonicalMatch ? canonicalMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML og:url:   ', ogUrlMatch ? ogUrlMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML og:image: ', ogImgMatch ? ogImgMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML og:type:  ', ogTypeMatch ? ogTypeMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML twitter:url:  ', twitterUrlMatch ? twitterUrlMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML twitter:image:', twitterImgMatch ? twitterImgMatch[1] : 'FAIL (Missing)');

  const sitemapPath = path.join(__dirname, '../../apps/web/public/sitemap.xml');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
  console.log('\nSitemap URLs count:', sitemapLocs.length);
  sitemapLocs.forEach(loc => console.log('  -', loc));

  const robotsPath = path.join(__dirname, '../../apps/web/public/robots.txt');
  const robots = fs.readFileSync(robotsPath, 'utf8');
  console.log('\nRobots.txt content:\n' + robots.trim());

  const vercelPath = path.join(__dirname, '../../apps/web/vercel.json');
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const rHeader = vercel.headers.find(h => h.source === '/r/(.*)');
  console.log('\nVercel /r/* X-Robots-Tag configured:', rHeader ? JSON.stringify(rHeader.headers) : 'FAIL');

  return true;
}

const liveUrls = [
  'https://ratri-silk.vercel.app/',
  'https://ratri-silk.vercel.app/watch-together',
  'https://ratri-silk.vercel.app/watch-party',
  'https://ratri-silk.vercel.app/screen-share',
  'https://ratri-silk.vercel.app/listen-together',
  'https://ratri-silk.vercel.app/hero_showcase.jpg',
  'https://ratri-silk.vercel.app/robots.txt',
  'https://ratri-silk.vercel.app/sitemap.xml'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        if (data.length < 50000) data += chunk;
      });
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          bodySnippet: data.slice(0, 3000)
        });
      });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function run() {
  testLocalFiles();

  console.log('\n=== 2. Live Deployment Status Check (Pre-Deployment Baseline) ===');
  console.log('Target Live Origin: https://ratri-silk.vercel.app/\n');
  for (const url of liveUrls) {
    const res = await checkUrl(url);
    if (res.error) {
      console.log(`[ERROR] ${url}: ${res.error}`);
      continue;
    }
    console.log(`[${res.status}] ${url}`);
    console.log(`  Content-Type: ${res.headers['content-type']}`);
    console.log(`  X-Robots-Tag: ${res.headers['x-robots-tag'] || 'NONE'}`);
  }
}

run();
