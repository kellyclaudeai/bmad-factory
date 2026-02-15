import { TerminalBadge } from '@/components/shared/terminal-badge'

interface StatusIndicatorProps {
  status: 'active' | 'completed' | 'failed' | 'idle' | 'waiting' | 'pending'
  className?: string
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  // Map status to health levels
  const statusMap = {
    active: { level: 'healthy' as const, label: 'Active', icon: '●' },
    completed: { level: 'healthy' as const, label: 'Completed', icon: '✓' },
    idle: { level: 'warning' as const, label: 'Idle', icon: '◐' },
    waiting: { level: 'warning' as const, label: 'Waiting', icon: '⏸' },
    pending: { level: 'warning' as const, label: 'Pending', icon: '○' },
    failed: { level: 'critical' as const, label: 'Failed', icon: '✕' },
  }

  const statusInfo = statusMap[status] || statusMap.pending

  return (
    <TerminalBadge status={statusInfo.level} className={className}>
      <span className="mr-1">{statusInfo.icon}</span>
      {statusInfo.label}
    </TerminalBadge>
  )
}
