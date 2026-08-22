const CACHE_NAME = 'delala-cache-v2'; // Updated cache version
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/rental.html',
  '/news.css',
  '/s.png',
  '/manifest.json'
];

// Install Event: Cache essential app assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Bypass non-GET & API requests, serve cached static assets offline
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass Service Worker entirely for POST/PUT requests or backend API routes
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return; // Direct browser network call
  }

  // 2. Handle static GET assets caching
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
