const CACHE_NAME = 'bisindo-v2'; 
const urlsToCache = [
  './',
  './index.html',
  './tebak.html',
  './kategori.html', 
  './icon.png',
  './manifest.json',
  './logo-animasi.json'
];

// Instalasi dan langsung memaksakan Service Worker baru untuk aktif (Skip Waiting)
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Menghapus cache versi lama secara otomatis agar aplikasi selalu update
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategi "Network First, fallback to Cache"
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Jika ada internet dan berhasil memuat, perbarui cache secara diam-diam
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Jika sedang offline (tidak ada koneksi), gunakan data dari cache
        return caches.match(event.request);
      })
  );
});
