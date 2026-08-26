// Deliberately minimal — just enough to satisfy "installable PWA" criteria
// (a registered service worker with a fetch handler). Everything is
// pass-through to the network: test questions, scores, and star balances
// must always be fresh, so this never caches or intercepts /api/* (or
// anything else). No offline app-shell caching either — a stale bundle
// silently serving old code is worse than briefly failing to load.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // No-op: let the browser handle every request normally.
});
