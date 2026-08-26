/*
 * Hilty service worker — recovery/kill-switch.
 * The previous caching SW could serve stale JavaScript after the many early deploys, which broke
 * interactivity on some browsers. This version caches nothing, clears all old caches, unregisters
 * itself, and reloads open pages so every visitor gets fresh assets. (Add-to-home-screen still
 * works via the web manifest.)
 */
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) {
        try {
          client.navigate(client.url)
        } catch {
          /* ignore */
        }
      }
    })(),
  )
})

// Always go to the network; never serve cached responses.
self.addEventListener('fetch', () => {})
