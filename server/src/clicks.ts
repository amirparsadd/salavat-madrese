import { log } from './logger.js'

interface DataStructure {
  daily: {
    amount: number,
    lastUpdate: number
  },
  total: number
}

let data: DataStructure = {
  daily: {
    amount: 0,
    lastUpdate: 0
  },
  total: 0
}

let clickCountBuffer = {
  value: 0
}

export function addClick() {
  clickCountBuffer.value++
  log("debug", "clicks", "Click added", { bufferValue: clickCountBuffer.value })
}

export function addClicks(amount: number) {
  clickCountBuffer.value += amount
  log("info", "clicks", "Clicks added", { amount, bufferValue: clickCountBuffer.value })
}

export function getClickData(): DataStructure {
  return {
    daily: {
      amount: data.daily.amount + clickCountBuffer.value,
      lastUpdate: data.daily.lastUpdate
    },
    total: data.total + clickCountBuffer.value
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

    log("info", "clicks", "Loaded click data from DAL", { daily: data.daily.amount, total: data.total })
  } catch (error) {
    log("error", "clicks", "Error loading click data from DAL", { error: error instanceof Error ? error.message : String(error), error_raw: JSON.stringify(error) })
  }
}

export async function syncClickData() {
  try {
    if(clickCountBuffer.value !== 0) {
      const res = await fetch(process.env.DAL_ENDPOINT + "/clicks", {
        method: "POST",
        headers: {
          Authorization: process.env.DAL_ACCESS_TOKEN || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: clickCountBuffer.value
        })
      })

      if (!res.ok) {
        log("error", "clicks", "Failed to sync click data to DAL", { status: res.status, statusText: res.statusText, amount: clickCountBuffer.value })
        return
      }

      const syncedAmount = clickCountBuffer.value
      clickCountBuffer.value = 0

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