const CACHE_NAME = "lantern-static-v1";

const PRE_CACHE_URLS = [
  "/offline",
  "/manifest.webmanifest",
  "/icon",
  "/apple-icon",
];

const CACHEABLE_DESTINATIONS = new Set([
  "style",
  "script",
  "font",
  "image",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await Promise.all(
        PRE_CACHE_URLS.map(async (url) => {
          try {
            await cache.add(url);
          } catch (error) {
            console.warn(
              `LANtern service worker: nepodařilo se precachovat ${url}`,
              error,
            );
          }
        }),
      );

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("lantern-"))
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const offlinePage = await caches.match("/offline");

        return offlinePage ?? Response.error();
      }),
    );

    return;
  }

  const isStaticNextAsset = url.pathname.startsWith("/_next/static/");
  const isCacheableAsset =
    isStaticNextAsset ||
    CACHEABLE_DESTINATIONS.has(request.destination);

  if (!isCacheableAsset) {
    return;
  }

  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);

          await cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch {
        return new Response("", {
          status: 504,
          statusText: "Offline asset unavailable",
        });
      }
    }),
  );
});