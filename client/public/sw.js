// Minimal pass-through Service Worker for native browser PWA installability.
// Never caches /api/*, Neon PostgreSQL responses, or Google Drive media so data is always live.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept cross-origin requests, API calls, or Vite dev HMR assets
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/')
  ) {
    return;
  }

  // Pure network pass-through (always fresh, no stale cache)
  event.respondWith(fetch(request));
});
