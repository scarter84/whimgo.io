const CACHE_NAME = 'whim-v2';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/fire.png',
  '/assets/Whim.png',
  '/assets/whimeco.png',
  '/assets/whimpm.png',
  '/assets/whim_screenshot.png',
  '/assets/GeoF.png',
  '/assets/nodeflow.png',
  '/assets/nodeflow2.png',
  '/assets/phone_rec_tab_v4.jpg',
  '/assets/phone_wake_tab_v4.jpg',
  '/assets/phone_geof_tab.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return undefined;
      });

      return cached || fetchPromise;
    })
  );
});
