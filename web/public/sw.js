/* Hilty PWA service worker — minimal, safe runtime cache. Never caches /api or /admin. */
const CACHE = 'hilty-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
  self.clients.claim()
})
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) return
  e.respondWith(
    (async () => {
      try {
        const res = await fetch(e.request)
        if (res.ok && url.origin === self.location.origin) {
          const cache = await caches.open(CACHE)
          cache.put(e.request, res.clone())
        }
        return res
      } catch {
        const cached = await caches.match(e.request)
        return cached || Response.error()
      }
    })(),
  )
})
