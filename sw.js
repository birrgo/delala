const CACHE_NAME = 'delala-cache-v4'; // Updated to 'v4' to force browsers to save the new index.html
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/rental.html',
  '/news.css',
  '/s.png',
  '/manifest.json'
  // Removed offline.html and low.html since they are now popups inside index.html
];

// Install Event: Cache essential app assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
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
  self.clients.claim(); // Take control of all clients immediately
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
      // Return cached asset if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // 3. If not in cache, fetch from the network
      return fetch(request).catch(() => {
        
        // 4. Fallback Logic: If the network completely fails (offline) during navigation
        if (request.mode === 'navigate') {
          console.log('[Service Worker] Network failed, serving cached index.html');
          // Serve the main app shell. The JS inside index.html will trigger the offline popup instantly!
          return caches.match('/index.html');
        }
      });
    })
  );
});
