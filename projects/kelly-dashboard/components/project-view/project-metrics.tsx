import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type SubagentData = {
  story?: string
  status: string
  duration?: string
  startedAt?: string
  completedAt?: string
  sessionKey?: string
  tokens?: {
    input?: number
    output?: number
  }
}

type ProjectMetricsProps = {
  subagents: SubagentData[]
  phases?: Record<string, { name: string; stories: number[]; status: string }>
}

function parseDuration(duration: string | undefined): number {
  if (!duration) return 0
  
  // Parse durations like "8m14s", "3m28s"
  const minutesMatch = duration.match(/(\d+)m/)
  const secondsMatch = duration.match(/(\d+)s/)
  
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0
  const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0
  
  return minutes * 60 + seconds
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  if (secs === 0) return `${mins}m`
  return `${mins}m ${secs}s`
}

function calculateActiveTime(subagents: SubagentData[]): string {
  const activeSubagent = subagents.find(s => s.status === 'active' && s.startedAt)
  
  if (activeSubagent?.startedAt) {
    const start = new Date(activeSubagent.startedAt).getTime()
    const now = Date.now()
    const diffSeconds = Math.floor((now - start) / 1000)
    return formatDuration(diffSeconds)
  }
  
  return '0s'
}

function calculateTotalTime(subagents: SubagentData[]): string {
  let totalSeconds = 0
  
  for (const subagent of subagents) {
    if (subagent.duration) {
      totalSeconds += parseDuration(subagent.duration)
    } else if (subagent.status === 'active' && subagent.startedAt) {
      const start = new Date(subagent.startedAt).getTime()
      const now = Date.now()
      totalSeconds += Math.floor((now - start) / 1000)
    }
  }
  
  return formatDuration(totalSeconds)
}

function calculateTotalTokens(subagents: SubagentData[]): number {
  let total = 0
  
  for (const subagent of subagents) {
    if (subagent.tokens) {
      total += (subagent.tokens.input || 0) + (subagent.tokens.output || 0)
    }
  }
  
  return total
}

function calculateCost(tokens: number): string {
  // Assuming $0.015 per 1K tokens (this is an estimate, adjust based on actual model costs)
  const cost = (tokens / 1000) * 0.015
  return cost.toFixed(2)
}

function calculateProgress(
  subagents: SubagentData[],
  phases?: Record<string, { stories: number[] }>
): string | null {
  if (!phases) {
    // No phases means planning hasn't completed - no stories exist yet
    return null
  }
  
  // Count stories: extract story numbers from subagent.story
  const allStoryNumbers = new Set<number>()
  const completeStoryNumbers = new Set<number>()
  
  for (const subagent of subagents) {
    if (subagent.story) {
      const match = subagent.story.match(/Story (\d+)/)
      if (match) {
        const storyNum = parseInt(match[1], 10)
        allStoryNumbers.add(storyNum)
        
        if (subagent.status === 'complete') {
          completeStoryNumbers.add(storyNum)
        }
      }
    }
  }
  
  // Also count from phases to get total expected stories
  let totalExpectedStories = 0
  for (const phase of Object.values(phases)) {
    totalExpectedStories += phase.stories.length
  }
  
  return `${completeStoryNumbers.size}/${totalExpectedStories}`
}

export function ProjectMetrics({ subagents, phases }: ProjectMetricsProps) {
  const totalTime = calculateTotalTime(subagents)
  const totalTokens = calculateTotalTokens(subagents)
  const cost = calculateCost(totalTokens)
  const progress = calculateProgress(subagents, phases)
  const activeTime = calculateActiveTime(subagents)
  
  const hasActiveSubagents = subagents.some(s => s.status === 'active')
  const hasStoryProgress = progress !== null
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${hasStoryProgress ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
      <Card className="bg-terminal-card border-terminal-border hover:border-terminal-green transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-terminal-dim">
            Total Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-terminal-green">
            {totalTime}
          </div>
          {hasActiveSubagents && (
            <div className="text-xs font-mono text-terminal-dim mt-1">
              Active: {activeTime}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-terminal-card border-terminal-border hover:border-terminal-green transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-terminal-dim">
            Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-terminal-green">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-xs font-mono text-terminal-dim mt-1">
            ~{(totalTokens / 1000).toFixed(1)}K
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-terminal-card border-terminal-border hover:border-terminal-green transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-terminal-dim">
            Estimated Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-terminal-green">
            ${cost}
          </div>
          <div className="text-xs font-mono text-terminal-dim mt-1">
            $0.015/1K tokens
          </div>
        </CardContent>
      </Card>
      
      {hasStoryProgress && (
        <Card className="bg-terminal-card border-terminal-border hover:border-terminal-green transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-terminal-dim">
              Story Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-terminal-green">
              {progress}
            </div>
            <div className="text-xs font-mono text-terminal-dim mt-1">
              stories complete
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
