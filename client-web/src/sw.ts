import { clientsClaim } from "workbox-core"
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching"
import { registerRoute, setCatchHandler } from "workbox-routing"
import { NetworkFirst } from "workbox-strategies"

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string, revision: string | null }>
}

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

clientsClaim()

registerRoute(
  ({ url }) => url.origin === self.location.origin,
  new NetworkFirst({ cacheName: "salavat-madrese-cache" })
)

setCatchHandler(async () => new Response("You are offline", { status: 503 }))
