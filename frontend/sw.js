const API_CACHE_NAME = 'zipo-api-cache-v1';
const CACHE_NAME = 'zipo-cache-v1';
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/zipo_white.png',
    '/assets/zipo_black.png'
];

// Install: Caches the app shell.
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

// Activate: Cleans up old caches and takes control of clients.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all open clients without waiting for a reload.
      return self.clients.claim();
    })
  );
});

// Fetch: Serves requests from cache or network.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // For API calls (module list, sessions, and playback), use a network-first strategy.
  if (url.pathname.startsWith('/api/modules') || url.pathname.startsWith('/api/sessions')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If fetch is successful, cache the response and return it.
          return caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // If fetch fails (offline), try to serve from the cache.
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || Response.error();
          });
        })
    );
    return;
  }

  // For all other GET requests (app shell, assets), use a cache-first strategy.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // If in cache, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network, cache it, and then return it.
      return fetch(request).then(networkResponse => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // If network fails and it's a navigation request, return the offline page.
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // For other assets that aren't in the cache and fail to fetch,
        // return a network error. This prevents a TypeError.
        return Response.error();
      });
    })
  );
});
