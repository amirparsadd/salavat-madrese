if(process.env.NODE_ENV !== "production") {
  (await import("dotenv")).configDotenv()
}

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getData, initializeSyncJob, loadData, addClick } from './data.js'
import { rateLimiter } from 'hono-rate-limiter'
import { cors } from 'hono/cors'
import { getIp } from './utils.js'

await loadData()
initializeSyncJob()

const app = new Hono()

app.use(cors())
app.use(async (c, next) => {
  console.log(`${c.req.method} @ ${c.req.url} | ${getIp(c)}`)
  await next()
})

app.get('/', (c) => {
  return c.json(getData())
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

serve({
  fetch: app.fetch,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  hostname: "0.0.0.0"
}, (info) => {
  console.log(`Server is running on http://${info.address}:${info.port}`)
})
