'use client'

import { useEffect, useState } from 'react'

interface TimestampProps {
  date: string | Date
  className?: string
}

export function Timestamp({ date, className = '' }: TimestampProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className={className}>...</span>
  }

  const timestamp = new Date(date)
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  let relative = ''
  if (days > 0) {
    relative = `${days}d ago`
  } else if (hours > 0) {
    relative = `${hours}h ago`
  } else if (minutes > 0) {
    relative = `${minutes}m ago`
  } else {
    relative = `${seconds}s ago`
  }
  
  const absolute = timestamp.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  
  return (
    <span 
      className={`cursor-help ${className}`}
      title={absolute}
    >
      {relative}
    </span>
  )
}
