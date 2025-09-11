// frontend/sw.js

const API_CACHE_NAME = 'zipo-api-cache-v1';
const CACHE_NAME = 'zipo-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache the app shell. This is a minimal set of files.
      // In a real app, this would be populated by the build process.
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/assets/zipo_white.png'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For API calls to play modules, use a network-first strategy, falling back to cache.
  // This ensures the user gets the latest version if online, but can still play offline.
  if (url.pathname.startsWith('/api/modules/') && url.pathname.endsWith('/play')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return caches.open(API_CACHE_NAME).then((cache) => {
            console.log('Caching new API response:', request.url);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          console.log('Serving from API cache (network failed):', request.url);
          return caches.match(request);
        })
    );
    return;
  }

  // For all other requests, try cache first, then network.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then(networkResponse => {
          // For non-API GET requests, cache them in the main cache
          if(request.method === 'GET' && !url.pathname.startsWith('/api/')) {
              return caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, networkResponse.clone());
                  return networkResponse;
              });
          }
          return networkResponse;
      });
    })
  );
});
