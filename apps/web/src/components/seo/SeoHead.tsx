import { useEffect } from 'react';

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const DOMAIN = 'https://ratri.app';

export function SeoHead({
  title,
  description,
  canonicalPath = '/',
  noindex = false,
  ogType = 'website',
  ogImage = `${DOMAIN}/hero_showcase.jpg`,
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper function to set or create meta tags
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to set or create link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    const fullCanonical = `${DOMAIN}${canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath}`;

    // 2. Primary Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setLinkTag('canonical', fullCanonical);

    // 3. Open Graph
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonical);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);

    // 4. Twitter Cards
    setMetaTag('meta[property="twitter:card"]', 'property', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[property="twitter:title"]', 'property', 'twitter:title', title);
    setMetaTag('meta[property="twitter:description"]', 'property', 'twitter:description', description);
    setMetaTag('meta[property="twitter:url"]', 'property', 'twitter:url', fullCanonical);
    setMetaTag('meta[property="twitter:image"]', 'property', 'twitter:image', ogImage);

    // 5. Dynamic JSON-LD Structured Data
    const scriptId = 'dynamic-json-ld';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.text = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [title, description, canonicalPath, noindex, ogType, ogImage, jsonLd]);

  return null;
}
