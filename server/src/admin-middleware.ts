import type { Context, Next } from "hono"
import { log } from './logger.js'
import { getIp } from './utils.js'

export const adminMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header().authorization

  if(authHeader !== process.env.DAL_ACCESS_TOKEN) {
    log("warn", "admin-middleware", "Authentication failed", { 
      ip: getIp(c), 
      path: c.req.path,
      method: c.req.method 
    })
    return c.json({ success: false, error: "Auth Failed" }, 403)
  }

  log("debug", "admin-middleware", "Authentication successful", { 
    ip: getIp(c), 
    path: c.req.path,
    method: c.req.method 
  })

  await next()
}