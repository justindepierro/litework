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
  "/icons/apple-touch-icon.png"
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
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.destination === "document") {
            return caches.match("/offline");
          }
          
          // For API requests, return cached version if available
          if (event.request.url.includes('/api/')) {
            return caches.match(event.request);
          }
        });
    })
  );
});

// Background sync for offline workout completion
self.addEventListener('sync', (event) => {
  if (event.tag === 'workout-sync') {
    event.waitUntil(syncWorkoutData());
  }
});

// Sync workout data when connection is restored
async function syncWorkoutData() {
  // Get pending workout data from IndexedDB
  // Send to server when online
  // This would integrate with the workout completion system
  console.log('Syncing workout data...');
}

// Push notifications for workout reminders
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: data.url
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Handle offline page requests
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline');
      })
    );
  }
});