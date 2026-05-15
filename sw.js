const CACHE = 'inkwell-v1';
const VIDEO_CACHE = 'inkwell-videos-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE && k !== VIDEO_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  if (url.includes('.mp4')) {
    e.respondWith(
      caches.open(VIDEO_CACHE).then(async cache => {
        const cached = await cache.match(url);

        if (cached) return cached;

        const res = await fetch(e.request);

        if (res.ok) {
          cache.put(url, res.clone());
        }

        return res;
      })
    );

    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
