const https = require('https');
const fs = require('fs');
const path = require('path');
const MAX_SITEMAP_AGE_DAYS = 14;

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
  const twitterCardMatch = html.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']*)["']/i);
  const twitterUrlMatch = html.match(/<meta\s+name=["']twitter:url["']\s+content=["']([^"']*)["']/i);
  const twitterImgMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']*)["']/i);

  console.log('Dist HTML Canonical:', canonicalMatch ? canonicalMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML og:url:   ', ogUrlMatch ? ogUrlMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML og:image: ', ogImgMatch ? ogImgMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML og:type:  ', ogTypeMatch ? ogTypeMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML twitter:card: ', twitterCardMatch ? twitterCardMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML twitter:url:   ', twitterUrlMatch ? twitterUrlMatch[1] : 'FAIL (Missing)');
  console.log('Dist HTML twitter:image: ', twitterImgMatch ? twitterImgMatch[1] : 'FAIL (Missing)');

  const sitemapPath = path.join(__dirname, '../../apps/web/public/sitemap.xml');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
  const sitemapDates = [...sitemap.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map(m => m[1]);
  console.log('\nSitemap URLs count:', sitemapLocs.length);
  sitemapLocs.forEach(loc => console.log('  -', loc));
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const oldestAllowed = new Date(today);
  oldestAllowed.setDate(oldestAllowed.getDate() - MAX_SITEMAP_AGE_DAYS);
  const sitemapDatesValid = sitemapDates.length === sitemapLocs.length &&
    sitemapDates.every((value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const date = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(date.getTime()) && date <= today && date >= oldestAllowed;
    });
  console.log('Sitemap dates valid/current:', sitemapDatesValid ? 'YES' : 'FAIL');

  const robotsPath = path.join(__dirname, '../../apps/web/public/robots.txt');
  const robots = fs.readFileSync(robotsPath, 'utf8');
  console.log('\nRobots.txt content:\n' + robots.trim());

  const llmsPath = path.join(__dirname, '../../apps/web/public/llms.txt');
  const llms = fs.readFileSync(llmsPath, 'utf8');
  console.log('\nllms.txt present:', llms.includes('# Ratri') ? 'YES' : 'FAIL');

  const vercelPath = path.join(__dirname, '../../apps/web/vercel.json');
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const llmsHeader = vercel.headers.find(h => h.source === '/llms.txt');
  console.log('Vercel /llms.txt content type configured:', llmsHeader ? JSON.stringify(llmsHeader.headers) : 'FAIL');
  const spaRewrite = vercel.rewrites.find(r => r.destination === '/index.html');
  const spaExcludesSeoFiles = Boolean(
    spaRewrite &&
    spaRewrite.source.includes('llms') &&
    spaRewrite.source.includes('sitemap') &&
    spaRewrite.source.includes('robots')
  );
  console.log('SPA fallback excludes SEO files:', spaExcludesSeoFiles ? 'YES' : 'FAIL');
  const rHeader = vercel.headers.find(h => h.source === '/r/(.*)');
  console.log('\nVercel /r/* X-Robots-Tag configured:', rHeader ? JSON.stringify(rHeader.headers) : 'FAIL');

  const localChecksPassed =
    sitemapLocs.length === 5 &&
    sitemapLocs.every((loc) => loc.startsWith('https://ratri-silk.vercel.app/')) &&
    sitemapLocs.every((loc) => !loc.includes('/r/')) &&
    sitemapDatesValid &&
    robots.includes('Disallow: /r/') &&
    robots.includes('Disallow: /v1/') &&
    llms.includes('# Ratri') &&
    !llms.includes('<!doctype html') &&
    Boolean(llmsHeader) &&
    spaExcludesSeoFiles &&
    Boolean(rHeader);
  if (!localChecksPassed) {
    process.exitCode = 1;
  }

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
  'https://ratri-silk.vercel.app/sitemap.xml',
  'https://ratri-silk.vercel.app/llms.txt'
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

function validateLiveResponse(res, expectedType) {
  if (res.error) return `ERROR: ${res.error}`;
  const contentType = res.headers['content-type'] || '';
  const typeOk = contentType.toLowerCase().includes(expectedType);
  const body = res.bodySnippet || '';
  const bodyOk = expectedType === 'text/plain'
    ? body.includes('# Ratri') && !body.includes('<!doctype html')
    : expectedType === 'application/xml'
      ? body.includes('<urlset') && !body.includes('<!doctype html')
      : true;
  return typeOk && bodyOk ? 'PASS' : `FAIL (content-type=${contentType}, body=${body.slice(0, 80)})`;
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
    if (url.endsWith('/llms.txt')) console.log(`  Acceptance: ${validateLiveResponse(res, 'text/plain')}`);
    if (url.endsWith('/sitemap.xml')) console.log(`  Acceptance: ${validateLiveResponse(res, 'application/xml')}`);
  }
}

run();
