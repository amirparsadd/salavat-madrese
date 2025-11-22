import type { Context, Next } from "hono";

export const adminMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header().authorization

  if(authHeader !== process.env.DAL_ACCESS_TOKEN) {
    return c.json({ success: false, error: "Auth Failed" }, 403)
  }

  await next()
}