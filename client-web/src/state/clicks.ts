import { reactive } from "vue"
import { interval } from "./interval"
import { useToast } from "vue-toastification"

const toast = useToast()

export const clicks = reactive<{
  total: number,
  today: number,
  you: number
  loading: boolean,
  click: () => Promise<void>,
  sync: () => void,
  fetch: () => Promise<void>
}>({
  total: 0,
  today: 0,
  you: -1,
  loading: true,
  async click() {
    this.today++
    this.total++
    this.you++
    const req = await fetch(import.meta.env.VITE_API_ENDPOINT + "/click", { method: "POST" })

    if(req.status === 429) {
      this.today--
      this.total--
      this.you--
      toast.error("خیلی تند تند صلوات میفرستیا، یکم آروم تر")
      return
    }

    clicks.sync()

    const data = await req.json() as {
      success: boolean,
      achievement : {
        type: "1k-click",
        data: unknown
      } | undefined
    }

    if(data.achievement) {
      switch (data.achievement.type) {
        case "1k-click": {
          toast.success(`تو ${data.achievement.data}مین کلیک بودی!`)
        }
      }
    }

    interval.restart()
  },
  sync () {
    const LOCAL_STORAGE_KEY = "clicks"

    if(this.you === -1) {
      const localStorageVal = localStorage.getItem(LOCAL_STORAGE_KEY)

      this.you = localStorageVal !== null ? parseInt(localStorageVal) : 0
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, String(this.you))
  },
  async fetch() {
    const req = await fetch(import.meta.env.VITE_API_ENDPOINT + "/")
    const data = await req.json()

    if(this.total < data.total) {
      this.total = data.total
    }
    const newToday = data.daily.amount
    if (newToday > this.today || newToday < this.today / 2) {
      this.today = newToday
    }
    this.loading = false
  }
})