import { NextResponse } from 'next/server'

type HealthMetric = {
  label: string
  value: string
  status: 'healthy' | 'warning' | 'critical'
}

type FactoryState = {
  active: string[]
  queued: string[]
  completed: string[]
  shipped: string[]
}

type Session = {
  sessionKey: string
  label: string
  status: string
  error?: string
  tokens?: {
    input: number
    output: number
  }
  lastActivity?: string
}

export const revalidate = 10 // Cache for 10 seconds

export async function GET(request: Request) {
  try {
    // Use the request's origin to construct the base URL (handles any port)
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`
    
    // Fetch data from existing APIs
    const [factoryRes, sessionsRes] = await Promise.all([
      fetch(`${baseUrl}/api/factory-state`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/sessions`, { cache: 'no-store' }),
    ])

    const factoryState: FactoryState = factoryRes.ok ? await factoryRes.json() : { active: [], queued: [], completed: [], shipped: [] }
    const sessions: Session[] = sessionsRes.ok ? await sessionsRes.json() : []

    const metrics: HealthMetric[] = []

    // 1. Session Failures/Retries
    const failureCount = sessions.filter(s => s.status === 'failed' || s.error).length
    metrics.push({
      label: 'Session Failures',
      value: `${failureCount} failures`,
      status: failureCount === 0 ? 'healthy' : failureCount <= 3 ? 'warning' : 'critical',
    })

    // 2. Protocol Violations (stub for now)
    const violationCount = 0 // TODO: Scan transcripts
    metrics.push({
      label: 'Protocol Violations',
      value: `${violationCount} violations`,
      status: violationCount === 0 ? 'healthy' : violationCount <= 2 ? 'warning' : 'critical',
    })

    // 3. Queue Depth + Throughput
    const queueDepth = factoryState.queued.length
    const throughput = sessions.filter(s => s.status === 'active').length
    metrics.push({
      label: 'Queue Depth',
      value: `${queueDepth} queued, ${throughput} active`,
      status: queueDepth < 5 ? 'healthy' : queueDepth <= 10 ? 'warning' : 'critical',
    })

    // 4. Cost/Token Burn
    const totalTokens = sessions.reduce((sum, s) => {
      if (s.tokens) {
        return sum + s.tokens.input + s.tokens.output
      }
      return sum
    }, 0)
    const estimatedCost = (totalTokens / 1000) * 0.015
    metrics.push({
      label: 'Token Burn',
      value: `$${estimatedCost.toFixed(2)} today`,
      status: estimatedCost < 50 ? 'healthy' : estimatedCost <= 100 ? 'warning' : 'critical',
    })

    // 5. Blocked Projects (projects with last activity > 4 hours ago)
    const now = Date.now()
    const fourHoursAgo = now - (4 * 60 * 60 * 1000)
    let blockedCount = 0
    
    for (const projectId of factoryState.active) {
      try {
        const projectRes = await fetch(`${baseUrl}/api/project-state?id=${projectId}`, { cache: 'no-store' })
        if (projectRes.ok) {
          const projectState = await projectRes.json()
          const lastActivity = projectState.lastActivity ? new Date(projectState.lastActivity).getTime() : now
          if (lastActivity < fourHoursAgo) {
            blockedCount++
          }
        }
      } catch (error) {
        // Ignore project state fetch errors
      }
    }
    
    metrics.push({
      label: 'Blocked Projects',
      value: `${blockedCount} blocked >4h`,
      status: blockedCount === 0 ? 'healthy' : blockedCount === 1 ? 'warning' : 'critical',
    })

    // 6. Bottleneck Timestamps (slowest story in active projects)
    let slowestDurationMin = 0
    let slowestStoryId = 'None'

    for (const projectId of factoryState.active) {
      try {
        const projectRes = await fetch(`${baseUrl}/api/project-state?id=${projectId}`, { cache: 'no-store' })
        if (projectRes.ok) {
          const projectState = await projectRes.json()
          if (projectState.subagents && Array.isArray(projectState.subagents)) {
            for (const subagent of projectState.subagents) {
              if (subagent.startedAt && subagent.completedAt) {
                const duration = new Date(subagent.completedAt).getTime() - new Date(subagent.startedAt).getTime()
                const durationMin = Math.floor(duration / (60 * 1000))
                if (durationMin > slowestDurationMin) {
                  slowestDurationMin = durationMin
                  slowestStoryId = subagent.storyId || subagent.persona || 'Unknown'
                }
              }
            }
          }
        }
      } catch (error) {
        // Ignore project state fetch errors
      }
    }

    metrics.push({
      label: 'Slowest Story',
      value: slowestDurationMin > 0 ? `${slowestStoryId} (${slowestDurationMin}m)` : 'None',
      status: slowestDurationMin < 30 ? 'healthy' : slowestDurationMin <= 60 ? 'warning' : 'critical',
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Health metrics error:', error)
    // Return empty array on error so metrics.map doesn't fail
    return NextResponse.json([])
  }
}
