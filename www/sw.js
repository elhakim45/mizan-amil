// Service worker: aplikasi tetap terbuka saat offline.
const CACHE = 'mizan-amil-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './logo-hes.png', './favicon.png',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png',
  './fonts/plus-jakarta-sans-latin-400-normal.woff2', './fonts/plus-jakarta-sans-latin-500-normal.woff2',
  './fonts/plus-jakarta-sans-latin-600-normal.woff2', './fonts/plus-jakarta-sans-latin-700-normal.woff2',
  './fonts/plus-jakarta-sans-latin-800-normal.woff2', './fonts/amiri-arabic-400-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Halaman: jaringan dulu (agar pembaruan cepat masuk), cadangan dari cache.
// Berkas lain (ikon, font): cache dulu.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Harga terbaru selalu dari jaringan, tidak pernah dari cache.
  if (new URL(req.url).pathname.endsWith('/harga.json')) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && new URL(req.url).origin === location.origin) {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy));
    }
    return r;
  })));
});
