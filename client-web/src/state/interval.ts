import { reactive } from "vue";
import { clicks } from "./clicks";

const REFETCH_INTERVAL = 2 * 1000

export const interval = reactive<{
  value: number | undefined,
  restart: () => Promise<void>
}>({
  value: undefined,
  async restart() {
    if(this.value) {
      clearInterval(this.value)
    }
    
    this.value = setInterval(() => clicks.fetch(), REFETCH_INTERVAL)
  }
})