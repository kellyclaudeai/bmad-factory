import React from 'react'
import { cn } from '@/lib/utils'

type TerminalBadgeProps = {
  children: React.ReactNode
  status: 'healthy' | 'warning' | 'critical' | 'active'
  className?: string
  pulse?: boolean
}

export function TerminalBadge({ children, status, className, pulse = false }: TerminalBadgeProps) {
  const statusStyles = {
    healthy: 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]',
    warning: 'bg-[#ffaa00]/10 text-[#ffaa00] border-[#ffaa00]',
    critical: 'bg-[#ff4444]/10 text-[#ff4444] border-[#ff4444]',
    active: 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium border',
        statusStyles[status],
        pulse && 'animate-pulse-status',
        className
      )}
    >
      {children}
    </span>
  )
}
