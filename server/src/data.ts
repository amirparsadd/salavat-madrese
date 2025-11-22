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
}

export function getData(): DataStructure {
  return {
    daily: {
      amount: data.daily.amount + clickCountBuffer.value,
      lastUpdate: data.daily.lastUpdate
    },
    total: data.total + clickCountBuffer.value
  }
}

export async function loadData() {
  const res = await fetch(process.env.DAL_ENDPOINT + "/clicks", {
    method: "GET",
    headers: {
      Authorization: process.env.DAL_ACCESS_TOKEN || ""
    }
  })
  const resData = (await res.json()).data

  data.daily = resData.daily
  data.total = resData.total
}

export async function syncData() {
  if(clickCountBuffer.value !== 0) {
    await fetch(process.env.DAL_ENDPOINT + "/clicks", {
      method: "POST",
      headers: {
        Authorization: process.env.DAL_ACCESS_TOKEN || ""
      },
      body: JSON.stringify({
        amount: clickCountBuffer.value
      })
    })

    clickCountBuffer.value = 0
  }

  await loadData()

  console.log("Synced data with DAL")
}

export function initializeSyncJob(timing: number = 1000) {
  const interval = setInterval(syncData, timing)

  return interval
}