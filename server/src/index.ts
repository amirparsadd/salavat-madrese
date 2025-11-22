if(process.env.NODE_ENV !== "production") {
  (await import("dotenv")).configDotenv()
}

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getClickData, initializeSyncJob, loadClickData, addClick, addClicks } from './clicks.js'
import { rateLimiter } from 'hono-rate-limiter'
import { cors } from 'hono/cors'
import { getIp } from './utils.js'
import { getAllConfigs, getConfig, initializeConfigCacheClearJob, setConfig } from './configs.js'
import { adminMiddleware } from './admin-middleware.js'

await loadClickData()
initializeSyncJob()
initializeConfigCacheClearJob()

const app = new Hono()

app.use(cors())
app.use(async (c, next) => {
  console.log(`${c.req.method} @ ${c.req.url} | ${getIp(c)}`)
  await next()
})

app.get("/", (c) => {
  return c.json(getClickData())
})

app.post("/click",
  rateLimiter({
    keyGenerator: getIp,
    limit: 40,
    windowMs: 1000 * 60,
    standardHeaders: "draft-6"
  }),
  (c) => {
  addClick()
  
  return c.text("Submitted", 201)
  }
)

app.get("/configs", async (c) => {
  return c.json(await getAllConfigs())
})

app.get("/configs/:key", async (c) => {
  const config = await getConfig(c.req.param().key)

  return c.json({ data: config }, config === null ? 404 : 200)
})

app.post("/configs/:key",
  adminMiddleware,
  async (c) => {
    const key = c.req.param().key
    const { value } = (await c.req.json()) as { value: string }

    if(!key || !value || key.trim().length === 0 || value.trim().length === 0) {
      return c.json({ success: false, error: "Invalid Key or Value" }, 400)
    }

    await setConfig(key, value)

    return c.json({ succes: true, value }, 201)
  }
)

app.post("/clicks",
  adminMiddleware,
  async (c) => {
    const amount = (await c.req.json()).amount

    if(!amount || typeof amount !== "number") {
      return c.json({ success: false, error: "Invalid Amount" }, 400)
    }

    addClicks(amount)

    return c.json({ success: true, clicks: getClickData().total }, 201)
  }
)

serve({
  fetch: app.fetch,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  hostname: "0.0.0.0"
}, (info) => {
  console.log(`Server is running on http://${info.address}:${info.port}`)
})
