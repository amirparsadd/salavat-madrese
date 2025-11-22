const { ACCESS_TOKEN } = require("./config");
const { getClickCount, incrementClickCount, getConfig, setConfig, getAllConfigs } = require("./db");

/**
 * The request handler
 * 
 * @param {import("http").IncomingMessage} req 
 * @param {import("http").ServerResponse} res 
 */
async function handler(req, res) {
  const rawBody = await new Promise((resolve, reject) => {
    let result = "";
    
    req.on("data", (chunk) => result += chunk);
    req.on("end", () => resolve(result));
    req.on("error", (err) => reject(err));
  });

  res.appendHeader("Content-Type", "application/json")

  const authorizationHeader = req.headers.authorization

  if(!authorizationHeader || authorizationHeader !== ACCESS_TOKEN) {
    res.writeHead(403)
    res.write(JSON.stringify({
      success: false,
      error: "Invalid authorization header"   
    }))
    return res.end()
  }

  if(req.method.toLowerCase() === "get" && req.url.startsWith("/clicks")) {
    res.write(JSON.stringify({
      success: true,
      data: await getClickCount()
    }))
    return res.end()
  } else if(req.method.toLowerCase() === "post" && req.url.startsWith("/clicks")) {
    let body;
    try {
      body = JSON.parse(rawBody)
    } catch (error) {
      console.error(error)
    }

    if(!body || !body.amount || typeof body.amount !== "number" || body.amount < 0) {
      res.writeHead(400)
      res.write(JSON.stringify({
        success: false,
        error: "Invalid body"   
      }))
      return res.end()
    }

    await incrementClickCount(body.amount)

    res.writeHead(201)
    res.write(JSON.stringify({
      success: true
    }))
    return res.end()
  } else if(req.method.toLowerCase() === "get" && req.url.startsWith("/configs")) {
    const urlParts = req.url.split("/").filter(Boolean)
    
    if(urlParts.length === 1) {
      const configs = await getAllConfigs()
      res.write(JSON.stringify({
        success: true,
        data: configs
      }))
      return res.end()
    } else if(urlParts.length === 2) {
      const key = urlParts[1]
      const value = await getConfig(key)
      
      if(value === null) {
        res.writeHead(404)
        res.write(JSON.stringify({
          success: false,
          error: "Config not found"
        }))
        return res.end()
      }
      
      res.write(JSON.stringify({
        success: true,
        data: value
      }))
      return res.end()
    }
  } else if((req.method.toLowerCase() === "post" || req.method.toLowerCase() === "put") && req.url.startsWith("/configs")) {
    const urlParts = req.url.split("/").filter(Boolean)
    let body;
    
    try {
      body = JSON.parse(rawBody)
    } catch (error) {
      console.error(error)
    }

    if(urlParts.length === 1) {
      if(!body || !body.key || typeof body.key !== "string" || !body.value || typeof body.value !== "string") {
        res.writeHead(400)
        res.write(JSON.stringify({
          success: false,
          error: "Invalid body. Expected { key: string, value: string }"
        }))
        return res.end()
      }

      await setConfig(body.key, body.value)

      res.writeHead(201)
      res.write(JSON.stringify({
        success: true
      }))
      return res.end()
    } else if(urlParts.length === 2) {
      const key = urlParts[1]
      
      if(!body || !body.value || typeof body.value !== "string") {
        res.writeHead(400)
        res.write(JSON.stringify({
          success: false,
          error: "Invalid body. Expected { value: string }"
        }))
        return res.end()
      }

      await setConfig(key, body.value)

      res.writeHead(200)
      res.write(JSON.stringify({
        success: true
      }))
      return res.end()
    }
  }

  res.writeHead(404)
  res.write(JSON.stringify({
    success: false,
    error: "Not found"
  }))
  return res.end()
}

module.exports = {
  handler
}