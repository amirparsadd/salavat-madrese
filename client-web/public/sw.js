const CACHE_NAME = "salavat-madrese-cache-v2"

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)
  const isAppEndpoint = url.origin === self.location.origin
  if (!isAppEndpoint) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      try {
        const response = await fetch(request)
        await cache.put(request, response.clone())
        return response
      } catch (err) {
        const cachedResponse = await cache.match(request)
        if (cachedResponse) return cachedResponse
        return new Response("You are offline", { status: 503 })
      }
    })()
  )
})