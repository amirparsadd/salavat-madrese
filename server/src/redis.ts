import "dotenv/config"
import { log } from "console"
import { createClient } from 'redis'

export const redisClient = createClient({
  url: process.env.REDIS_URL
})

try {
  await redisClient.connect()
  log("info", "redis", "connected to redis")
} catch (error) {
  console.log(error)
  log("error", "redis", "Failed to connect to redis: " + error)
  process.exit(1)
}