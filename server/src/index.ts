import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getData, initializeSaveJob, loadData, addClick } from './data.js'
import { rateLimiter } from 'hono-rate-limiter'
import { getConnInfo } from '@hono/node-server/conninfo'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

loadData()
initializeSaveJob()

const app = new Hono()

app.use(cors())
app.use(logger())

app.get('/', (c) => {
  return c.json(getData())
})

app.post("/click",
  rateLimiter({
    keyGenerator: (c) => c.req.header()["ar-real-ip"] || String(getConnInfo(c).remote.address),
    limit: 10,
    windowMs: 1000 * 30,
    standardHeaders: "draft-6"
  }),
  (c) => {
  addClick()
  console.log("New click from:" + (c.req.header()["ar-real-ip"] || String(getConnInfo(c).remote.address)))
  
  return c.text("Submitted", 201)
  }
)

serve({
  fetch: app.fetch,
  port: 3000,
  hostname: "0.0.0.0"
}, (info) => {
  console.log(`Server is running on http://${info.address}:${info.port}`)
})
