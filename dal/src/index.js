// Load .env
if(process.env.NODE_ENV !== "production") {
  const dotenv = require("dotenv")
  dotenv.configDotenv({
    quiet: true
  })
}

const app = require("./handler")
const { PORT, HOSTNAME, ACCESS_TOKEN } = require("./config")
const { initialize } = require("./db")

// Validate access token
if(!ACCESS_TOKEN || ACCESS_TOKEN.trim().length === 0) {
  console.error("No ACCESS_TOKEN found, quitting...")
  process.exit(1)
}

// Init DB
initialize()

module.exports = {
  fetch: app.fetch,
  port: PORT ?? 3000,
  hostname: HOSTNAME ?? "0.0.0.0" 
}