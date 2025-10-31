const CACHE_NAME = "workout-tracker-v4"; // Keep for potential future use
const STATIC_CACHE = "static-v4";
const DYNAMIC_CACHE = "dynamic-v4"; // Keep for potential future use
const IMAGES_CACHE = "images-v4";
const API_CACHE = "api-v4";
const WORKOUT_DATA_CACHE = "workout-data-v4";

// Enhanced cache configuration with TTL management
const CACHE_CONFIG = {
  STATIC_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  API_TTL: 5 * 60 * 1000, // 5 minutes
  WORKOUT_TTL: 24 * 60 * 60 * 1000, // 24 hours
  IMAGE_TTL: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Expanded cache with critical resources for gym WiFi scenarios
const urlsToCache = [
  "/",
  "/dashboard",
  "/workouts",
  "/progress",
  "/schedule",
  "/athletes",
  "/login",
  "/offline",
  "/performance-demo",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  // Critical CSS and JS chunks (will be updated by build process)
  "/_next/static/css/app.css",
  // Offline fallback pages
  "/workouts/offline",
  "/simple",
];

// Essential API endpoints to cache for offline functionality
const apiEndpointsToCache = [
  "/api/workouts",
  "/api/exercises",
  "/api/groups",
  "/api/users",
  "/api/analytics",
  "/api/assignments",
];

// Background sync data store (will be used for IndexedDB operations)
// const pendingWorkouts = []; // Reserved for future use
// const pendingSets = []; // Reserved for future use

// Request timeout for slow connections (gym WiFi scenarios)
const TIMEOUT_DURATION = 5000; // 5 seconds

// Enhanced network timeout wrapper with retry logic
function timeoutFetch(request, timeout = TIMEOUT_DURATION, retries = 2) {
  return new Promise((resolve, reject) => {
    const attemptFetch = (attempt) => {
      const timer = setTimeout(() => {
        reject(
          new Error(`Network timeout after ${timeout}ms (attempt ${attempt})`)
        );
      }, timeout);

      fetch(request)
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timer);
          if (attempt < retries) {
            // Exponential backoff
            const delay = Math.pow(2, attempt) * 1000;
            setTimeout(() => attemptFetch(attempt + 1), delay);
          } else {
            reject(error);
          }
        });
    };

    attemptFetch(1);
  });
}

// Install event - Enhanced caching strategy with preloading
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      // Cache critical static resources
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(urlsToCache);
      }),
      // Preload essential workout data for offline use
      preloadWorkoutData(),
      // Initialize IndexedDB for background sync
      initializeDatabase(),
    ])
  );
  self.skipWaiting();
});

// Activate event - Enhanced cleanup with better cache management
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old cache versions
            if (!cacheName.includes("v4")) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Clean up expired cache entries
      cleanExpiredCacheEntries(),
    ])
  );
  self.clients.claim();
});

// Advanced fetch event with intelligent caching strategies
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip requests to external domains
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // Handle different request types with appropriate strategies
  if (url.pathname.includes("/api/")) {
    event.respondWith(handleApiRequest(event.request));
  } else if (url.pathname.includes("/workouts/live/")) {
    event.respondWith(handleWorkoutSession(event.request));
  } else if (event.request.destination === "image") {
    event.respondWith(handleImageRequest(event.request));
  } else {
    event.respondWith(handleStaticRequest(event.request));
  }
});

// Specialized API request handler with stale-while-revalidate
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Determine if API endpoint should be cached
  const isEssentialAPI = apiEndpointsToCache.some((endpoint) =>
    request.url.includes(endpoint)
  );

  if (!isEssentialAPI) {
    // Non-cacheable API - network only
    try {
      return await timeoutFetch(request);
    } catch (error) {
      return new Response('{"error": "Network unavailable"}', {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Stale-while-revalidate strategy for essential APIs
  const fetchPromise = timeoutFetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        // Update cache with fresh data
        const responseClone = response.clone();
        cache.put(request, responseClone);
      }
      return response;
    })
    .catch(() => null);

  // Return cached version immediately if available
  if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.API_TTL)) {
    // Start background update but don't wait for it
    fetchPromise.catch(() => {}); // Ignore errors in background
    return cachedResponse;
  }

  // No cache or expired - wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  // Network failed - return stale cache if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Complete failure - return offline response
  return new Response('{"error": "Offline"}', {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

// Specialized workout session handler with optimized caching
async function handleWorkoutSession(request) {
  const cache = await caches.open(WORKOUT_DATA_CACHE);

  try {
    // Try network first for live sessions
    const response = await timeoutFetch(request, 3000); // Shorter timeout for live data

    if (response && response.status === 200) {
      // Cache successful workout session data
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fallback to cached version
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Generate offline workout session
    return generateOfflineWorkoutSession();
  }
}

// Enhanced image request handler with long-term caching
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGES_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.IMAGE_TTL)) {
    return cachedResponse;
  }

  try {
    const response = await timeoutFetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return cached version even if expired
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return placeholder image
    return new Response("", { status: 404 });
  }
}

// Static request handler with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.STATIC_TTL)) {
    return cachedResponse;
  }

  try {
    const response = await timeoutFetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return cached version or offline page
    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.destination === "document") {
      const offlineResponse = await cache.match("/offline");
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    return new Response("Offline", { status: 503 });
  }
}

// Utility functions for advanced caching
function isExpired(response, ttl) {
  const cacheDate = response.headers.get("sw-cache-date");
  if (!cacheDate) return true;

  const now = Date.now();
  const cached = parseInt(cacheDate);
  return now - cached > ttl;
}

async function preloadWorkoutData() {
  // Preload essential workout templates and exercises
  try {
    const cache = await caches.open(API_CACHE);
    const exercisesResponse = await fetch("/api/exercises");
    if (exercisesResponse.ok) {
      cache.put("/api/exercises", exercisesResponse);
    }
  } catch (error) {
    console.log("Preload failed:", error);
  }
}

async function initializeDatabase() {
  // Initialize IndexedDB for background sync data
  return new Promise((resolve) => {
    const request = indexedDB.open("WorkoutTracker", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store for pending workout completions
      if (!db.objectStoreNames.contains("pendingWorkouts")) {
        const workoutStore = db.createObjectStore("pendingWorkouts", {
          keyPath: "id",
          autoIncrement: true,
        });
        workoutStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      // Store for pending set completions
      if (!db.objectStoreNames.contains("pendingSets")) {
        const setStore = db.createObjectStore("pendingSets", {
          keyPath: "id",
          autoIncrement: true,
        });
        setStore.createIndex("workoutId", "workoutId", { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      resolve(null);
    };
  });
}

async function cleanExpiredCacheEntries() {
  const cacheNames = [API_CACHE, STATIC_CACHE, IMAGES_CACHE];

  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        const ttl =
          cacheName === API_CACHE
            ? CACHE_CONFIG.API_TTL
            : cacheName === IMAGES_CACHE
              ? CACHE_CONFIG.IMAGE_TTL
              : CACHE_CONFIG.STATIC_TTL;

        if (isExpired(response, ttl)) {
          await cache.delete(request);
        }
      }
    } catch (error) {
      console.log("Cache cleanup failed:", error);
    }
  }
}

function generateOfflineWorkoutSession() {
  // Generate basic offline workout session
  const sessionData = {
    id: "offline-session",
    workout: {
      name: "Offline Workout",
      exercises: [],
    },
    offline: true,
    message:
      "This is an offline workout session. Your progress will sync when you're back online.",
  };

  return new Response(JSON.stringify(sessionData), {
    headers: { "Content-Type": "application/json" },
  });
}

// Enhanced background sync for offline workout completion
self.addEventListener("sync", (event) => {
  if (event.tag === "workout-sync") {
    event.waitUntil(syncWorkoutData());
  } else if (event.tag === "set-sync") {
    event.waitUntil(syncSetData());
  }
});

// Sync workout data when connection is restored
async function syncWorkoutData() {
  try {
    const db = await initializeDatabase();
    if (!db) return;

    const transaction = db.transaction(["pendingWorkouts"], "readonly");
    const store = transaction.objectStore("pendingWorkouts");
    const pendingWorkouts = await new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });

    for (const workout of pendingWorkouts) {
      try {
        const response = await fetch("/api/workouts/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workout.data),
        });

        if (response.ok) {
          // Remove from pending store
          const deleteTransaction = db.transaction(
            ["pendingWorkouts"],
            "readwrite"
          );
          const deleteStore = deleteTransaction.objectStore("pendingWorkouts");
          deleteStore.delete(workout.id);
        }
      } catch (error) {
        console.log("Sync failed for workout:", workout.id, error);
      }
    }
  } catch (error) {
    console.log("Workout sync failed:", error);
  }
}

async function syncSetData() {
  try {
    const db = await initializeDatabase();
    if (!db) return;

    const transaction = db.transaction(["pendingSets"], "readonly");
    const store = transaction.objectStore("pendingSets");
    const pendingSets = await new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });

    for (const set of pendingSets) {
      try {
        const response = await fetch("/api/sets/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(set.data),
        });

        if (response.ok) {
          // Remove from pending store
          const deleteTransaction = db.transaction(
            ["pendingSets"],
            "readwrite"
          );
          const deleteStore = deleteTransaction.objectStore("pendingSets");
          deleteStore.delete(set.id);
        }
      } catch (error) {
        console.log("Sync failed for set:", set.id, error);
      }
    }
  } catch (error) {
    console.log("Set sync failed:", error);
  }
}

// Enhanced push notifications for workout reminders
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      tag: data.tag || "workout-reminder",
      requireInteraction: true,
      actions: [
        {
          action: "view",
          title: "View Workout",
          icon: "/icons/icon-192x192.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
      data: data.url,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks with enhanced routing
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view" && event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  } else if (event.action === "dismiss") {
    // Just close the notification
    return;
  } else if (event.notification.data) {
    // Default action - open the URL
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data && event.data.type === "CACHE_WORKOUT") {
    // Cache workout data for offline use
    cacheWorkoutData(event.data.workout);
  } else if (event.data && event.data.type === "SYNC_REQUEST") {
    // Trigger background sync
    self.registration.sync.register(event.data.tag);
  }
});

async function cacheWorkoutData(workout) {
  try {
    const cache = await caches.open(WORKOUT_DATA_CACHE);
    const response = new Response(JSON.stringify(workout), {
      headers: {
        "Content-Type": "application/json",
        "sw-cache-date": Date.now().toString(),
      },
    });
    await cache.put(`/api/workouts/${workout.id}`, response);
  } catch (error) {
    console.log("Failed to cache workout data:", error);
  }
}
