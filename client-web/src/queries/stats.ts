import { API_ENDPOINT } from "../api"

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { useToast } from "vue-toastification"
import { you } from "../state/you"

export interface Stats {
  total: number,
  daily: {
    amount: number,
    lastUpdate: number
  },
  provinces: Record<string, number>
}

interface ClickResponse {
  success: boolean,
  achievement: {
    type: "1k-click",
    data: unknown
  } | undefined
}

const STATS_QUERY_KEY = ["stats"]

class RateLimitError extends Error {}

async function fetchStats(): Promise<Stats> {
  const req = await fetch(API_ENDPOINT + "/")

  if (!req.ok) {
    throw new Error(`Fetching stats failed with status ${req.status}`)
  }

  const data = await req.json()

  return {
    ...data,
    provinces: data.provinces ?? {}
  }
}

function applyClick(stats: Stats, province: string, delta: number): Stats {
  const provinces = { ...stats.provinces }

  if (province) {
    provinces[province] = (provinces[province] ?? 0) + delta
  }

  return {
    total: stats.total + delta,
    daily: {
      ...stats.daily,
      amount: stats.daily.amount + delta
    },
    provinces
  }
}

export function useStats() {
  return useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: fetchStats,
    refetchInterval: 2 * 1000
  })
}

export function useClick() {
  const toast = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (province: string) => {
      const req = await fetch(API_ENDPOINT + "/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province })
      })

      if (req.status === 429) {
        throw new RateLimitError()
      }

      if (!req.ok) {
        throw new Error(`Click failed with status ${req.status}`)
      }

      return req.json() as Promise<ClickResponse>
    },
    onMutate: async (province) => {
      await queryClient.cancelQueries({ queryKey: STATS_QUERY_KEY })
      queryClient.setQueryData<Stats>(STATS_QUERY_KEY, (stats) => stats && applyClick(stats, province, 1))
      you.value++
    },
    onError: (error, province) => {
      queryClient.setQueryData<Stats>(STATS_QUERY_KEY, (stats) => stats && applyClick(stats, province, -1))
      you.value--

      if (error instanceof RateLimitError) {
        toast.error("خیلی تند تند صلوات میفرستیا، یکم آروم تر")
      }
    },
    onSuccess: (data) => {
      if (data.achievement) {
        switch (data.achievement.type) {
          case "1k-click": {
            toast.success(`تو ${data.achievement.data}مین کلیک بودی!`)
          }
        }
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY })
  })
}
