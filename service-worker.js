const CACHE_NAME = 'memory-fortress-v48';
const OFFLINE_FILES = [
  './',
  './index.html',
  './styles.css',
  './motion.css',
  './control-reskin.css',
  './app.js',
  './manifest.webmanifest',
  './assets/icon-v2-180.png',
  './assets/icon-v2-192.png',
  './assets/icon-v2-512.png',
  './assets/fortress-deck-v2.png',
  './assets/manta-drone.png',
  './assets/mothership-b.png',
  './assets/telescope-dome-b.png',
  './assets/twin-cannon-turret.png'
  ,'./assets/console-rank-key-v1.png'
  ,'./assets/console-suit-key-v1.png'
  ,'./assets/menu-command-frame-v1.png'
  ,'./assets/cockpit-shell-v1.png'
  ,'./assets/ship-fortress-v1.png'
  ,'./assets/ship-strike-v1.png'
  ,'./assets/ship-interceptor-v1.png'
  ,'./assets/dashboard-fortress-approved-v1.png'
  ,'./assets/dashboard-fortress-windows-v1.png'
  ,'./assets/dashboard-strike-windows-v1.png'
  ,'./assets/dashboard-interceptor-windows-v1.png'
  ,'./assets/dashboard-raiders-training-v1.png'
  ,'./assets/dashboard-raiders-keypad-v1.png'
  ,'./assets/menu-mode-panel-v1.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request, {ignoreSearch: true});
    if (cached) return cached;
    if (event.request.mode === 'navigate') return caches.match('./index.html');
    return Response.error();
  }));
});
