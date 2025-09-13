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
        '/assets/zipo_white.png',
        '/assets/zipo_black.png'
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

  // For the module list and module playback data, use a network-first strategy.
  // This ensures the user gets the latest data if online, but can still see the list
  // and play cached modules when offline.
  if (url.pathname === '/api/modules' || (url.pathname.startsWith('/api/modules/') && url.pathname.endsWith('/play'))) {
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

  // For all other requests, try cache first, then network, with a fallback for navigation.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // If we have a cached response, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not, fetch from the network.
      return fetch(request).then(networkResponse => {
          // For non-API GET requests, cache them for future offline use.
          if(request.method === 'GET' && !url.pathname.startsWith('/api/')) {
              return caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, networkResponse.clone());
                  return networkResponse;
              });
          }
          return networkResponse;
      }).catch(error => {
        // If the network fetch fails, it's an offline scenario.
        console.log('Network fetch failed for:', request.url, error);
        // For navigation requests, serve the main index.html as a fallback.
        if (request.mode === 'navigate') {
          console.log('Serving index.html as fallback for navigation.');
          return caches.match('/index.html');
        }
        // For other assets (js, css, images), if they are not in the cache and network fails,
        // there's nothing to serve. The request will fail.
      });
    })
  );
});