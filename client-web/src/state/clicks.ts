import { reactive } from "vue";
import { interval } from "./interval";
import { useToast } from "vue-toastification";

const toast = useToast()

export const clicks = reactive<{
  total: number,
  today: number,
  loading: boolean,
  click: () => Promise<void>,
  fetch: () => Promise<void>
}>({
  total: 0,
  today: 0,
  loading: true,
  async click() {
    this.today++
    this.total++
    const req = await fetch(import.meta.env.VITE_API_ENDPOINT + "/click", { method: "POST" })

    if(req.status === 429) {
      this.today--
      this.total--
      toast.error("خیلی تند تند صلوات میفرستیا، یکم آروم تر")
      return
    }

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
  async fetch() {
    const req = await fetch(import.meta.env.VITE_API_ENDPOINT + "/")
    const data = await req.json()

    this.total = data.total
    this.today = data.daily.amount
    this.loading = false
  }
})