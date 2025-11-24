import { log } from './logger.js'

export const configCache = new Map<string, string | null>()

export let allConfigsCache: { value: Record<string, string> | undefined } = {
  value: undefined
}

export async function getConfig(key: string) {
  if(configCache.has(key)) {
    log("debug", "configs", "Config retrieved from cache", { key })
    return configCache.get(key)
  }

  try {
    const res = await fetch(process.env.DAL_ENDPOINT + "/configs/" + key, {
      method: "GET",
      headers: {
        Authorization: process.env.DAL_ACCESS_TOKEN || ""
      }
    })

    if (!res.ok) {
      log("warn", "configs", "Failed to get config from DAL", { key, status: res.status, statusText: res.statusText })
      configCache.set(key, null)
      return undefined
    }

    const resData = await res.json()

    if(!resData.success) {
      log("debug", "configs", "Config not found in DAL", { key })
      configCache.set(key, null)
      return undefined
    }

    configCache.set(key, resData.data)
    log("info", "configs", "Config retrieved from DAL", { key })

    return resData.data
  } catch (error) {
    log("error", "configs", "Error getting config from DAL", { key, error: error instanceof Error ? error.message : String(error) })
    configCache.set(key, null)
    return undefined
  }
}

export async function setConfig(key: string, value: string) {
  try {
    const res = await fetch(process.env.DAL_ENDPOINT + "/configs", {
      method: "POST",
      headers: {
        Authorization: process.env.DAL_ACCESS_TOKEN || ""
      },
      body: JSON.stringify({
        key, value
      })
    })

    if (!res.ok) {
      log("error", "configs", "Failed to set config in DAL", { key, status: res.status, statusText: res.statusText })
      return
    }

    configCache.set(key, value)

    if(allConfigsCache.value) {
      allConfigsCache.value[key] = value
    }

    log("info", "configs", "Config set in DAL", { key })
  } catch (error) {
    log("error", "configs", "Error setting config in DAL", { key, error: error instanceof Error ? error.message : String(error) })
  }
}

export async function getAllConfigs() {
  if(allConfigsCache.value) {
    log("debug", "configs", "All configs retrieved from cache", { count: Object.keys(allConfigsCache.value).length })
    return allConfigsCache.value
  }

  try {
    const res = await fetch(process.env.DAL_ENDPOINT + "/configs", {
      method: "GET",
      headers: {
        Authorization: process.env.DAL_ACCESS_TOKEN || ""
      }
    })

    if (!res.ok) {
      log("error", "configs", "Failed to get all configs from DAL", { status: res.status, statusText: res.statusText })
      return {}
    }

    const resData = await res.json()

    allConfigsCache.value = resData.data

    Object.keys(resData.data).forEach(key => {
      configCache.set(key, resData.data["key"])
    })

    log("info", "configs", "All configs retrieved from DAL", { count: Object.keys(resData.data).length })

    return resData.data
  } catch (error) {
    log("error", "configs", "Error getting all configs from DAL", { error: error instanceof Error ? error.message : String(error) })
    return {}
  }
}

export function initializeConfigCacheClearJob(timing: number = 5000) {
  log("info", "configs", "Initializing config cache clear job", { timing })
  const interval = setInterval(() => {
    configCache.clear()
    allConfigsCache.value = undefined
    log("debug", "configs", "Cleared config cache")
  }, timing)

  return interval
}