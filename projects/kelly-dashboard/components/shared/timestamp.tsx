'use client'

import { useEffect, useState } from 'react'

interface TimestampProps {
  date: string | Date
  className?: string
}

function formatRelativeTime(timestamp: Date, nowMs: number): string {
  const diffSeconds = Math.max(0, Math.floor((nowMs - timestamp.getTime()) / 1000))

  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`
  }

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function formatAbsoluteTime(timestamp: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(timestamp)

  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  const month = getPart('month')
  const day = getPart('day')
  const year = getPart('year')
  const hour = getPart('hour')
  const minute = getPart('minute')
  const second = getPart('second')
  const dayPeriod = getPart('dayPeriod')
  const timeZoneName = getPart('timeZoneName')

  return `${month} ${day}, ${year} ${hour}:${minute}:${second} ${dayPeriod} ${timeZoneName}`
}

export function Timestamp({ date, className = '' }: TimestampProps) {
  const [mounted, setMounted] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    setMounted(true)
    setNowMs(Date.now())

    const interval = setInterval(() => {
      setNowMs(Date.now())
    }, 30_000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return <span className={className}>...</span>
  }

  const timestamp = new Date(date)
  if (Number.isNaN(timestamp.getTime())) {
    return <span className={className}>Invalid date</span>
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const absolute = formatAbsoluteTime(timestamp, timeZone)
  const relative = formatRelativeTime(timestamp, nowMs)

  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`} title={absolute}>
      <span>{absolute}</span>
      <span className="text-xs opacity-70">({relative})</span>
    </span>
  )
}
