'use client'

import { useEffect } from 'react'

/**
 * Recovery: ensure the old caching service worker is removed and its caches cleared, so no browser
 * keeps serving stale JavaScript from the early deploys. We intentionally do NOT register a caching
 * SW right now (add-to-home-screen still works via the manifest). The kill-switch /sw.js also
 * self-unregisters for browsers that still load it.
 */
export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    void (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations()
        if (regs.length) {
          // Load the kill-switch SW once so it clears caches + unregisters, then remove registrations.
          await navigator.serviceWorker.register('/sw.js').catch(() => {})
          await Promise.all(regs.map((r) => r.unregister().catch(() => {})))
        }
        if (window.caches) {
          const keys = await caches.keys()
          await Promise.all(keys.map((k) => caches.delete(k)))
        }
      } catch {
        /* best effort */
      }
    })()
  }, [])
  return null
}
