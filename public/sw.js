const CACHE_NAME = "dineo-cache-v1";
const OFFLINE_URL = "/offline.html";

// Assets to cache immediately
const PRECACHE_ASSETS = [
  "/",
  "/favicon.ico",
  "/logo-light.png",
  "/logo-dark.png",
];

// Install Event - Pre-cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network first, cache fallback for menu pages & assets
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Exclude API calls or auth endpoints from being cached as HTML
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the request succeeded, clone it and save it in the cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network request fails (offline), look for matches in the cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If no cache entry matches, check if we're requesting a page
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});
