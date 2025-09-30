import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context, Env, Input } from "hono";

export function getIp(c: Context<Env, string, Input>) {
  return c.req.header()["ar-real-ip"] || String(getConnInfo(c).remote.address)
}