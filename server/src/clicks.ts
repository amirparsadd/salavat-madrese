import { log } from './logger.js'
import type { Province } from './provinces.js'

interface DataStructure {
  daily: {
    amount: number,
    lastUpdate: number
  },
  total: number,
  provinces: Record<string, number>
}

let data: DataStructure = {
  daily: {
    amount: 0,
    lastUpdate: 0
  },
  total: 0,
  provinces: {}
}

let clickCountBuffer = {
  value: 0,
  provinces: {} as Record<string, number>
}

export function addClick(province?: Province) {
  clickCountBuffer.value++

  if (province) {
    clickCountBuffer.provinces[province] = (clickCountBuffer.provinces[province] ?? 0) + 1
  }

  log("debug", "clicks", "Click added", { bufferValue: clickCountBuffer.value, province })
}

export function addClicks(amount: number) {
  clickCountBuffer.value += amount
  log("info", "clicks", "Clicks added", { amount, bufferValue: clickCountBuffer.value })
}

export function getClickData(): DataStructure {
  const provinces = { ...data.provinces }

  for (const [province, amount] of Object.entries(clickCountBuffer.provinces)) {
    provinces[province] = (provinces[province] ?? 0) + amount
  }

  return {
    daily: {
      amount: data.daily.amount + clickCountBuffer.value,
      lastUpdate: data.daily.lastUpdate
    },
    total: data.total + clickCountBuffer.value,
    provinces
  }
}

export async function loadClickData() {
  try {
    const res = await fetch(process.env.DAL_ENDPOINT + "/clicks", {
      method: "GET",
      headers: {
        Authorization: process.env.DAL_ACCESS_TOKEN || "",
        "Content-Type": "application/json"
      }
    })

    if (!res.ok) {
      log("error", "clicks", "Failed to load click data from DAL", { status: res.status, statusText: res.statusText })
      return
    }

    const resData = (await res.json()).data

    data.daily = resData.daily
    data.total = resData.total
    data.provinces = resData.provinces ?? {}

    log("info", "clicks", "Loaded click data from DAL", { daily: data.daily.amount, total: data.total })
  } catch (error) {
    log("error", "clicks", "Error loading click data from DAL", { error: error instanceof Error ? error.message : String(error), error_raw: JSON.stringify(error) })
  }
}

export async function syncClickData() {
  try {
    if(clickCountBuffer.value !== 0) {
      const syncedAmount = clickCountBuffer.value
      const syncedProvinces = { ...clickCountBuffer.provinces }

      const res = await fetch(process.env.DAL_ENDPOINT + "/clicks", {
        method: "POST",
        headers: {
          Authorization: process.env.DAL_ACCESS_TOKEN || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: syncedAmount,
          provinces: syncedProvinces
        })
      })

      if (!res.ok) {
        log("error", "clicks", "Failed to sync click data to DAL", { status: res.status, statusText: res.statusText, amount: syncedAmount })
        return
      }

      // Only remove what was synced, clicks received during the request stay in the buffer
      clickCountBuffer.value -= syncedAmount
      for (const [province, amount] of Object.entries(syncedProvinces)) {
        clickCountBuffer.provinces[province] = (clickCountBuffer.provinces[province] ?? 0) - amount

        if (clickCountBuffer.provinces[province] === 0) {
          delete clickCountBuffer.provinces[province]
        }
      }

      log("info", "clicks", "Synced click data to DAL", { amount: syncedAmount })
    }

    await loadClickData()

    log("debug", "clicks", "Synced data with DAL", { bufferValue: clickCountBuffer.value })
  } catch (error) {
    log("error", "clicks", "Error syncing click data with DAL", { error: error instanceof Error ? error.message : String(error) })
  }
}

export function initializeSyncJob(timing: number = 500) {
  log("info", "clicks", "Initializing sync job", { timing })
  const interval = setInterval(syncClickData, timing)

  return interval
}