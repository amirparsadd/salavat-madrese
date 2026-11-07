import { computed } from "vue"
import { useQuery } from "@tanstack/vue-query"
import { API_ENDPOINT } from "../api"

async function checkUp(): Promise<boolean> {
  const req = await fetch(API_ENDPOINT + "/up")

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
