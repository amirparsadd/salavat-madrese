import { computed } from "vue"
import { useQuery } from "@tanstack/vue-query"

async function checkUp(): Promise<boolean> {
  const req = await fetch(import.meta.env.VITE_API_ENDPOINT + "/up")

  return req.ok
}

export function useOffline() {
  const query = useQuery({
    queryKey: ["offline"],
    queryFn: checkUp,
    refetchInterval: 2 * 1000,
    retry: false
  })

  return computed(() => query.isError.value || query.data.value === false)
}
