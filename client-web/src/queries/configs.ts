import { useQuery } from "@tanstack/vue-query"

async function fetchConfigs(): Promise<Record<string, string>> {
  const req = await fetch(import.meta.env.VITE_API_ENDPOINT + "/configs")

  if (!req.ok) {
    throw new Error(`Fetching configs failed with status ${req.status}`)
  }

  return req.json()
}

export function useConfigs() {
  return useQuery({
    queryKey: ["configs"],
    queryFn: fetchConfigs
  })
}
