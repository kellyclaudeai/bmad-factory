import { TerminalBadge } from '@/components/shared/terminal-badge'

interface StatusIndicatorProps {
  status: 'active' | 'completed' | 'failed' | 'idle' | 'waiting' | 'pending'
  className?: string
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  // Map status to health levels
  const statusMap = {
    active: { level: 'active' as const, label: 'Active', icon: '●', pulse: true },
    completed: { level: 'healthy' as const, label: 'Completed', icon: '✓', pulse: false },
    idle: { level: 'warning' as const, label: 'Idle', icon: '◐', pulse: false },
    waiting: { level: 'warning' as const, label: 'Waiting', icon: '⏸', pulse: false },
    pending: { level: 'warning' as const, label: 'Pending', icon: '○', pulse: false },
    failed: { level: 'critical' as const, label: 'Failed', icon: '✕', pulse: false },
  }

  const statusInfo = statusMap[status] || statusMap.pending

  return (
    <TerminalBadge status={statusInfo.level} className={className} pulse={statusInfo.pulse}>
      <span className="mr-1">{statusInfo.icon}</span>
      {statusInfo.label}
    </TerminalBadge>
  )
}
