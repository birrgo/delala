const CACHE_NAME = 'delala-cache-v3'; // Updated cache version to 'v3' so it saves the new files
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/rental.html',
  '/news.css',
  '/s.png',
  '/manifest.json',
  '/offline.html', // Added offline screen
  '/low.html'      // Added low connection screen
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
      // Return cached asset if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // 3. Custom Network Logic for Page Navigations (Added Low & Offline Function)
      if (request.mode === 'navigate') {
        const fetchPromise = fetch(request);
        
        // Create an 8-second timeout to detect slow network connections
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 8000)
        );

        // Race the network fetch against the 8-second timeout
        return Promise.race([fetchPromise, timeoutPromise]).catch((error) => {
          if (error.message === 'timeout') {
            // If it took longer than 8 seconds, show Low Connection page
            console.log('[Service Worker] Connection too slow, serving low.html');
            return caches.match('/low.html');
          }
          // If the network completely failed (offline), show Offline page
          console.log('[Service Worker] Network failed, serving offline.html');
          return caches.match('/offline.html');
        });
      }

      // 4. Standard fallback for everything else (images, scripts, etc.)
      return fetch(request).catch(() => {
        // Keeping your previous fallback logic intact just in case
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
