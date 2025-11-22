import { reactive } from "vue";

export const configs = reactive<{
  value: Record<string, string>,
  fetch: () => Promise<void>
}>({
  value: {},
  async fetch() {
    const req = await fetch(import.meta.env.VITE_API_ENDPOINT + "/configs")
    const data = await req.json()

    this.value = data
  }
})