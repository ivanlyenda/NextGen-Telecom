const CACHE_NAME = 'nexgen-cache-v18';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/3d.css',
  './css/responsive.css',
  './css/widgets-premium.css',
  './js/ui/app-shell.js',
  './js/animations/neural-net.js',
  './js/ui/global-events.js',
  './js/ui/widgets.js',
  './js/animations/gsap-core.js',
  './js/ui/sidebar.js',
  './js/ui/modal-tools.js',
  './js/ui/dock-theme.js',
  './js/ui/search.js',
  './js/animations/glass-effects.js',
  './js/animations/router-3d.js',
  './js/ui/widgets-premium.js',
  './js/main.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cache => cache !== CACHE_NAME)
          .map(cache => caches.delete(cache))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request, { cache: 'no-store' })
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
  );
});
