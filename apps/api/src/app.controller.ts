import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  getRobots(): string {
    const origin = this.getCanonicalOrigin();
    return `# Ratri Robots Directive
# Note: robots.txt is a crawl-budget and discovery control, not an access-control or security boundary.
User-agent: *
Allow: /
Allow: /watch-together
Allow: /watch-party
Allow: /screen-share
Allow: /listen-together
Disallow: /r/
Disallow: /v1/

Sitemap: ${origin}/sitemap.xml`;
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  getSitemap(): string {
    const origin = this.getCanonicalOrigin();
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/watch-together</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/watch-party</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/screen-share</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${origin}/listen-together</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  }

  private getCanonicalOrigin(): string {
    const envUrl = process.env.SITE_URL || process.env.CLIENT_ORIGIN;
    if (envUrl) {
      const origins = envUrl.split(',').map((o) => o.trim());
      const httpsOrigin = origins.find((o) => o.startsWith('https://'));
      if (httpsOrigin) return httpsOrigin.replace(/\/+$/, '');
    }
    return 'https://ratri-silk.vercel.app';
  }
}
