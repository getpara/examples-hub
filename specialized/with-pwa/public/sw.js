// Minimal service worker for PWA installation
// No caching since Para auth requires online connectivity

self.addEventListener('install', (event) => {
  // Skip waiting and activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});

// Pass through all fetch requests without caching
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});