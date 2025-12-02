import "dotenv/config"

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getClickData, initializeSyncJob, loadClickData, addClick, addClicks } from './clicks.js'
import { rateLimiter, type Store } from 'hono-rate-limiter'
import { cors } from 'hono/cors'
import { getIp } from './utils.js'
import { getAllConfigs, getConfig, initializeConfigCacheClearJob, setConfig } from './configs.js'
import { adminMiddleware } from './admin-middleware.js'
import { log } from './logger.js'
import RedisStore from 'rate-limit-redis'
import { redisClient } from './redis.js'

try {
  await loadClickData()
  log("info", "hono", "Click data loaded on startup")
} catch (error) {
  log("error", "hono", "Failed to load click data on startup", { 
    error: error instanceof Error ? error.message : String(error) 
  })
}

initializeSyncJob()
initializeConfigCacheClearJob()
log("info", "hono", "Background jobs initialized")

const app = new Hono()

app.use(cors())
app.use(async (c, next) => {
  const startTime = Date.now()
  await next()
  const duration = Date.now() - startTime
  const status = c.res.status
  
  if (status === 429) {
    log("warn", "hono", "Rate limit reached", { 
      method: c.req.method, 
      url: c.req.url, 
      ip: getIp(c)
    })
  }
  
  log("info", "hono", "Request processed", { 
    method: c.req.method, 
    url: c.req.url, 
    ip: getIp(c),
    status,
    duration 
  })
})

app.get("/", (c) => {
  const data = getClickData()
  log("debug", "hono", "Click data retrieved", { total: data.total, daily: data.daily.amount })
  return c.json(data)
})

app.get("/up", (c) => c.text("Im up!"))

app.post("/click",
  rateLimiter({
    keyGenerator: getIp,
    limit: async () => {
      const parsedConfig = parseInt(await getConfig("ratelimit"))

      if(Number.isNaN(parsedConfig) || parsedConfig < 1) {
        return 40
      }

      return parsedConfig
    },
    windowMs: 1000 * 60,
    standardHeaders: "draft-6",
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      prefix: "ratelimit-clicks:"
    }) as unknown as Store,
  }),
  (c) => {
  addClick()
  log("info", "hono", "Click submitted", { ip: getIp(c) })

  if(getClickData().total % 1000 === 0) {
    return c.json({
      success: true,
      achievement: {
        type: "1k-click",
        data: getClickData().total
      }
    })
  }

  return c.json({ success: true }, 201)
  }
)

app.get("/configs", async (c) => {
  try {
    const configs = await getAllConfigs()
    log("debug", "hono", "All configs retrieved", { count: Object.keys(configs).length })
    return c.json(configs)
  } catch (error) {
    log("error", "hono", "Error retrieving all configs", { error: error instanceof Error ? error.message : String(error) })
    return c.json({ error: "Internal server error" }, 500)
  }
})

app.get("/configs/:key", async (c) => {
  try {
    const key = c.req.param().key
    const config = await getConfig(key)

    if (config === null || config === undefined) {
      log("debug", "hono", "Config not found", { key })
      return c.json({ data: config }, 404)
    }

    log("debug", "hono", "Config retrieved", { key })
    return c.json({ data: config }, 200)
  } catch (error) {
    log("error", "hono", "Error retrieving config", { 
      key: c.req.param().key, 
      error: error instanceof Error ? error.message : String(error) 
    })
    return c.json({ error: "Internal server error" }, 500)
  }
})

app.post("/configs/:key",
  adminMiddleware,
  async (c) => {
    try {
      const key = c.req.param().key
      const { value } = (await c.req.json()) as { value: string }

      if(!key || !value || key.trim().length === 0 || value.trim().length === 0) {
        log("warn", "hono", "Invalid config key or value", { key, hasValue: !!value })
        return c.json({ success: false, error: "Invalid Key or Value" }, 400)
      }

      await setConfig(key, value)
      log("info", "hono", "Config set", { key, ip: getIp(c) })

      return c.json({ succes: true, value }, 201)
    } catch (error) {
      log("error", "hono", "Error setting config", { 
        key: c.req.param().key, 
        error: error instanceof Error ? error.message : String(error) 
      })
      return c.json({ success: false, error: "Internal server error" }, 500)
    }
  }
)

app.post("/clicks",
  adminMiddleware,
  async (c) => {
    try {
      const amount = (await c.req.json()).amount

      if(!amount || typeof amount !== "number") {
        log("warn", "hono", "Invalid clicks amount", { amount, ip: getIp(c) })
        return c.json({ success: false, error: "Invalid Amount" }, 400)
      }

      addClicks(amount)
      const total = getClickData().total
      log("info", "hono", "Clicks added via admin", { amount, total, ip: getIp(c) })

      return c.json({ success: true, clicks: total }, 201)
    } catch (error) {
      log("error", "hono", "Error adding clicks", { 
        error: error instanceof Error ? error.message : String(error) 
      })
      return c.json({ success: false, error: "Internal server error" }, 500)
    }
  }
)

serve({
  fetch: app.fetch,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  hostname: "0.0.0.0"
}, (info) => {
  log("info", "hono", `Server is running on http://${info.address}:${info.port}`, { port: info.port, address: info.address })
})
