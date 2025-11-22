// Load .env
if(process.env.NODE_ENV !== "production") {
  const dotenv = require("dotenv")
  dotenv.configDotenv()
}

const http = require("http")
const { handler } = require("./handler")
const { PORT, HOSTNAME, ACCESS_TOKEN } = require("./config")
const { initialize } = require("./db")

// Validate access token
if(!ACCESS_TOKEN || ACCESS_TOKEN.trim().length === 0) {
  console.error("No ACCESS_TOKEN found, quitting...")
  process.exit(1)
}

// Init DB
initialize()

// Setup server
const server = http.createServer(handler)
server.listen(
  PORT,
  HOSTNAME,
  undefined,
  () => {
    console.info(`Server is up at http://${HOSTNAME}:${PORT}`)
  }
)

module.exports = {
  server
}