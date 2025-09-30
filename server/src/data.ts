import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"

const DATA_PATH = "./data/data.json"

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

export function addClick() {
  data.total++
  
  const currentDate = new Date().toDateString()
  const lastDate = new Date(data.daily.lastUpdate).toDateString()

  if(currentDate !== lastDate) {
    // New Day
    data.daily.amount = 1
  } else {
    data.daily.amount++
  }
  data.daily.lastUpdate = Date.now()
}

export function getData(){
  return data
}

export function loadData() {
  try {
    const rawData = readFileSync(DATA_PATH).toString()
    const structuredData = JSON.parse(rawData)
    data.daily.amount = structuredData.daily.amount
    data.daily.lastUpdate = structuredData.daily.lastUpdate
    data.total = structuredData.total
    
    return structuredData
  } catch (error) {
    // The file isn't there
    console.error(error)
  }

}

export function saveData() {
  const dir = "./data"
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const serializedData = JSON.stringify(data)
  writeFileSync(DATA_PATH, serializedData)
}

export function initializeSaveJob(timing: number = 5000) {
  const interval = setInterval(saveData, timing)

  return interval
}