export const configCache = new Map<string, string | null>()

export let allConfigsCache: { value: Record<string, string> | undefined } = {
  value: undefined
}

export async function getConfig(key: string) {
  if(configCache.has(key)) {
    return configCache.get(key)
  }

  const res = await fetch(process.env.DAL_ENDPOINT + "/configs/" + key, {
    method: "GET",
    headers: {
      Authorization: process.env.DAL_ACCESS_TOKEN || ""
    }
  })

  const resData = await res.json()

  if(!resData.success) {
    configCache.set(key, null)
    return undefined
  }

  configCache.set(key, resData.data)

  return resData.data
}

export async function setConfig(key: string, value: string) {
  await fetch(process.env.DAL_ENDPOINT + "/configs", {
    method: "POST",
    headers: {
      Authorization: process.env.DAL_ACCESS_TOKEN || ""
    },
    body: JSON.stringify({
      key, value
    })
  })

  configCache.set(key, value)

  if(allConfigsCache.value) {
    allConfigsCache.value[key] = value
  }
}

export async function getAllConfigs() {
  if(allConfigsCache.value) return allConfigsCache.value

  const res = await fetch(process.env.DAL_ENDPOINT + "/configs", {
    method: "GET",
    headers: {
      Authorization: process.env.DAL_ACCESS_TOKEN || ""
    }
  })

  const resData = await res.json()

  allConfigsCache.value = resData.data

  Object.keys(resData.data).forEach(key => {
    configCache.set(key, resData.data["key"])
  })

  return resData.data
}

export function initializeConfigCacheClearJob(timing: number = 5000) {
  const interval = setInterval(() => {
    configCache.clear()
    allConfigsCache.value = undefined
    console.log("Cleared config cache")
  }, timing)

  return interval
}