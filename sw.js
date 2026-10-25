const CACHE_NAME = 'delala-cache-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './rental.html',
  './news.css',
  './s.png',
  './manifest.json'
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
  if (request.method !== 'GET' || url.pathname.includes('/api/')) {
    return;
  }

  // 2. Handle static GET assets caching
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // 3. Network fetch fallback
      return fetch(request).catch(() => {
        // 4. Navigation Fallback: Serve cached index.html when offline
        if (request.mode === 'navigate') {
          console.log('[Service Worker] Network failed, serving cached index.html');
          return caches.match('./index.html');
        }
      });
    })
  );
});
