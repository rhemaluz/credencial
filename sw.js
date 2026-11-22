// Credencial Rhema Luz — modo offline.
// A página (index.html) vem SEMPRE da internet primeiro (assim toda atualização aparece na hora);
// sem internet, abre a última cópia salva. Imagens e bibliotecas: cópia salva primeiro.
const CACHE = 'credencial-v21';
const ARQS = ['./', 'index.html', 'logo.png', 'logo-ouro.png', 'logo-marrom.png', 'assinatura.png', 'assinatura-branca.png', 'assinatura-clara.png', 'assinatura-preta.png', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE)
    .then(c => Promise.all(ARQS.map(u => fetch(new Request(u, { cache: 'reload' })).then(r => r.ok && c.put(u, r)).catch(() => {}))))
    .then(() => self.skipWaiting())));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.hostname.endsWith('script.google.com') || u.hostname.endsWith('googleusercontent.com')) return; // API sempre na rede
  const pagina = e.request.mode === 'navigate' || (u.origin === location.origin && /(\/|index\.html|\.js|\.webmanifest)$/.test(u.pathname));
  if (pagina) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    if (resp.ok && (u.origin === location.origin || u.hostname.includes('fonts.g') || u.hostname.includes('cdnjs'))) {
      const cp = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cp));
    }
    return resp;
  })));
});
