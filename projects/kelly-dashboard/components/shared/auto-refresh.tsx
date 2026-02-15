'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAutoRefresh<T>(
  url: string,
  intervalMs: number = 10000
) {
  return useSWR<T>(url, fetcher, {
    refreshInterval: intervalMs,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })
}
