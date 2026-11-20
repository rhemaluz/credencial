// Credencial Rhema Luz — guarda o app para abrir sem internet
const CACHE = 'credencial-v2';
const ARQS = ['./', 'index.html', 'logo.png', 'logo-ouro.png', 'logo-marrom.png', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.hostname.endsWith('script.google.com') || u.hostname.endsWith('googleusercontent.com')) return; // API sempre na rede
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    if (resp.ok && (u.origin === location.origin || u.hostname.includes('fonts.g'))) {
      const cp = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cp));
    }
    return resp;
  }).catch(() => caches.match('index.html'))));
});
