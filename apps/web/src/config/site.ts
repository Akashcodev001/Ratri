/**
 * Site configuration and canonical domain resolution.
 * Configurable via build-time or runtime environment variable VITE_SITE_URL.
 * Default canonical origin: https://ratri-silk.vercel.app
 */

export const SITE_URL: string = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  'https://ratri-silk.vercel.app'
).replace(/\/+$/, '');

export const SITE_NAME = 'Ratri';
export const SITE_TAGLINE = 'Watch, Listen & Hang Out Together Online';
export const SITE_DESCRIPTION =
  'Ratri is a real-time social room platform where friends can watch videos together, talk over voice or video, share screens, listen together, and hang out online.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero_showcase.jpg`;

export function getCanonicalUrl(path: string = '/'): string {
  if (!path || path === '/') {
    return `${SITE_URL}/`;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function getAbsoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
