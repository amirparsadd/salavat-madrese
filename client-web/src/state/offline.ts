import { reactive } from "vue";

export const offline = reactive<{
  isOffline: boolean,
  checkOffline: () => Promise<void>
}>({
  isOffline: false,
  async checkOffline() {
    try {
      // Better to use a seperate state if we need to do something different later
      const res = await fetch(import.meta.env.VITE_API_ENDPOINT + "/up")
      this.isOffline = !res.ok   
    } catch (error) {
      this.isOffline = true
    }
  }
})