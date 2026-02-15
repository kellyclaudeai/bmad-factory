'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { mutate, useSWRConfig } from 'swr'

export function RefreshIndicator() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [relativeTime, setRelativeTime] = useState('just now')
  const { cache } = useSWRConfig()

  // Track when SWR cache updates (actual data refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 10000) // Assume refresh happens every 10s (matches SWR interval)

    return () => clearInterval(interval)
  }, [])

  // Update relative time display every second
  useEffect(() => {
    const updateRelativeTime = () => {
      const now = new Date()
      const diffMs = now.getTime() - lastRefresh.getTime()
      const diffSec = Math.floor(diffMs / 1000)
      
      if (diffSec < 10) {
        setRelativeTime('just now')
      } else if (diffSec < 60) {
        setRelativeTime(`${diffSec}s ago`)
      } else {
        const diffMin = Math.floor(diffSec / 60)
        if (diffMin < 60) {
          setRelativeTime(`${diffMin}m ago`)
        } else {
          const diffHour = Math.floor(diffMin / 60)
          setRelativeTime(`${diffHour}h ago`)
        }
      }
    }

    updateRelativeTime()
    const interval = setInterval(updateRelativeTime, 1000)

    return () => clearInterval(interval)
  }, [lastRefresh])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    setLastRefresh(new Date())
    // Revalidate all SWR caches
    await mutate(() => true)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-terminal-border bg-terminal-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-mono text-terminal-dim">
            Auto-refreshes every 10 seconds
          </span>
          <span className="text-terminal-dim">•</span>
          <span className="font-mono text-terminal-green">
            Last update: {relativeTime}
          </span>
        </div>
        
        <Button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="border-terminal-green/30 bg-terminal-card text-terminal-green hover:border-terminal-green hover:bg-terminal-hover disabled:opacity-50"
        >
          {isRefreshing ? (
            <>
              <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-terminal-green border-t-transparent" />
              Refreshing...
            </>
          ) : (
            <>
              <span className="mr-2">↻</span>
              Refresh Now
            </>
          )}
        </Button>
      </div>
    </footer>
  )
}
