'use client'

import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TerminalBadge } from '@/components/shared/terminal-badge'

type HealthMetric = {
  label: string
  value: string
  status: 'healthy' | 'warning' | 'critical'
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function SkeletonCard() {
  return (
    <Card className="p-4 bg-[#151a1c] border-[#2a2f32]">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-32 bg-[#2a2f32]" />
        <Skeleton className="h-5 w-16 bg-[#2a2f32]" />
      </div>
      <Skeleton className="h-6 w-24 bg-[#2a2f32]" />
    </Card>
  )
}

export function HealthDashboard() {
  const { data: metrics, error, isLoading } = useSWR<HealthMetric[]>(
    '/api/health-metrics',
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: false,
    }
  )

  if (error) {
    return (
      <Card className="p-4 bg-[#151a1c] border-[#ff4444]">
        <p className="text-[#ff4444] font-mono text-sm">
          ⚠️ Unable to load health metrics
        </p>
      </Card>
    )
  }

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'critical':
        return '🔴'
      default:
        return '❓'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="p-4 bg-[#151a1c] border-[#2a2f32] hover:border-[#00ff88] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm text-[#888888]">
              {metric.label}
            </span>
            <TerminalBadge status={metric.status}>
              {getStatusIcon(metric.status)}
            </TerminalBadge>
          </div>
          <div className="font-mono text-lg font-bold text-[#00ff88]">
            {metric.value}
          </div>
        </Card>
      ))}
    </div>
  )
}
