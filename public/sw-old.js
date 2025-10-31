const CACHE_NAME = "workout-tracker-v2";
const STATIC_CACHE = "static-v2";
const DYNAMIC_CACHE = "dynamic-v2";
const IMAGES_CACHE = "images-v2";

const urlsToCache = [
  "/",
  "/dashboard",
  "/workouts",
  "/progress",
  "/schedule",
  "/athletes", 
  "/login",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  // Add essential CSS and JS from Next.js build
];

// Essential API endpoints to cache for offline functionality
const apiEndpointsToCache = [
  "/api/workouts",
  "/api/exercises", 
  "/api/groups",
  "/api/users"
];

// Install event - Enhanced caching strategy
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - Enhanced cleanup
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && cacheName !== IMAGES_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
        
// Enhanced fetch event with improved caching strategies
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip requests to external domains
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          
          // Determine cache strategy based on request type
          let targetCache = CACHE_NAME;
          
          // Cache API responses for offline access
          if (event.request.url.includes('/api/')) {
            targetCache = DYNAMIC_CACHE;
            // Only cache essential read-only API endpoints
            const isEssentialAPI = apiEndpointsToCache.some(endpoint => 
              event.request.url.includes(endpoint)
            );
            
            if (isEssentialAPI) {
              caches.open(targetCache).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
          }
          // Cache images
          else if (event.request.url.includes('/icons/') || 
                   event.request.destination === 'image') {
            targetCache = IMAGES_CACHE;
            caches.open(targetCache).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          // Cache static assets
          else {
            caches.open(targetCache).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.destination === "document") {
            return caches.match("/offline");
          }
        });
    })
  );
});

// Background sync for offline data
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implement background sync logic for workout data
  return new Promise((resolve) => {
    // Placeholder for syncing offline workout data
    console.log("Background sync triggered");
    resolve();
  });
}

// Push notifications (future enhancement)
self.addEventListener("push", (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(
      self.registration.showNotification("Workout Tracker", options)
    );
  }
});
