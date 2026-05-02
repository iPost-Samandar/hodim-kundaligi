// Hodim Kundaligi — Service Worker
// Strategy:
//  - HTML / app shell: network-first, fallback to cache
//  - Static assets (icons, manifest, fonts): cache-first
//  - API requests (/api/*, supabase): network-only (no caching)
//
// Bump CACHE_VERSION to force users onto a new release.

const CACHE_VERSION = "hk-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const SHELL_CACHE = `${CACHE_VERSION}-shell`;

const STATIC_ASSETS = [
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
  "/icon-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isApiOrSupabase(url) {
  return url.pathname.startsWith("/api/") ||
         url.hostname.endsWith(".supabase.co") ||
         url.hostname.endsWith(".supabase.in");
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never cache API / Supabase — always network
  if (isApiOrSupabase(url)) return;

  // Same-origin app shell (HTML): network-first
  if (url.origin === self.location.origin && req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/")))
    );
    return;
  }

  // Static assets (icons, fonts, _next): cache-first
  if (
    url.origin === self.location.origin ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});

// Listen for skip-waiting message from app
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
