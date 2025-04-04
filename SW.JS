const APP_CACHE_NAME = 'my-site-cache-v3'; // غيّر الإصدار (v2, v3, إلخ) عند كل تحديث كبير
const urlsToCache = [
  '/',              // Home page
  '/index.html',
  '/style.css',
  '/script.js',
  '/data.json',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE_NAME)
      .then(async cache => {
        console.log(`Caching ${urlsToCache.length} files into cache: ${APP_CACHE_NAME}`);
        const results = await Promise.allSettled(urlsToCache.map(url => cache.add(url)));
        results.forEach(result => {
          if (result.status === 'rejected') {
            console.error(`Failed to cache ${result.reason}`);
          }
        });

        // Ensure '/index.html' is cached
        if (!results.some(result => result.status === 'fulfilled' && result.value === '/index.html')) {
          console.error('Critical error: /index.html was not cached successfully.');
        }
      })
  );
});

// Intercept network requests and use the cached version if offline.
// The strategy used here is "Cache, falling back to network":
// 1. Try to find a matching response in the cache.
const fetchWithTimeout = (request, timeout = 5000) => {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    )
  ]);
};

// The activation event is used to clean up old caches and ensure only the current cache version is retained.
self.addEventListener('activate', Event => {
  const cacheWhitelist = [APP_CACHE_NAME];
            return caches.delete(cacheName).catch(error => {
              console.error(`Failed to delete cache ${cacheName}:`, error);
            });
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    });
  });

  self.addEventListener('fetch', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});