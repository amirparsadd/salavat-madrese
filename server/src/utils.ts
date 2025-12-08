import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context, Env, Input } from "hono";

/**
 * Get the request's ip
 * 
 * @param c The context of the request
 * @returns The request's ip
 */
export function getIp(c: Context<Env, string, Input>): string {
  return c.req.header()["ar-real-ip"]
    ?? c.req.header()["x-forwarded-for"]?.split(",")[0].trim()
    ?? String(getConnInfo(c).remote.address)
}