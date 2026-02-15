import Link from 'next/link'
import { TerminalBadge } from '@/components/shared/terminal-badge'

type ProjectHeaderProps = {
  projectId: string
  projectName: string
  stage: string
}

function getStageStatus(stage: string): 'healthy' | 'warning' | 'critical' {
  const lowerStage = stage.toLowerCase()
  
  if (lowerStage.includes('complete') || lowerStage.includes('shipped')) {
    return 'healthy'
  }
  
  if (lowerStage.includes('implementation') || lowerStage.includes('active')) {
    return 'warning'
  }
  
  if (lowerStage.includes('planning') || lowerStage.includes('queued')) {
    return 'healthy'
  }
  
  return 'critical'
}

export function ProjectHeader({ projectId, projectName, stage }: ProjectHeaderProps) {
  const stageStatus = getStageStatus(stage)
  
  return (
    <header className="mb-8">
      <nav className="text-terminal-dim font-mono text-sm mb-4 flex items-center gap-2 flex-wrap">
        <Link 
          href="/" 
          className="hover:text-terminal-green transition-colors focus:outline-none focus:ring-2 focus:ring-terminal-green rounded px-1"
        >
          Factory View
        </Link>
        <span className="mx-1">/</span>
        <span className="text-terminal-green">{projectName}</span>
        <span className="mx-2 text-terminal-border">|</span>
        <Link 
          href="/#active-projects" 
          className="text-terminal-amber hover:text-terminal-green transition-colors focus:outline-none focus:ring-2 focus:ring-terminal-green rounded px-1"
        >
          ← Back to Active Projects
        </Link>
      </nav>
      
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-4xl font-mono font-bold text-terminal-green">
          {projectName}
        </h1>
        <TerminalBadge status={stageStatus}>
          {stage}
        </TerminalBadge>
      </div>
      
      {projectId !== projectName && (
        <p className="mt-2 text-terminal-dim font-mono text-sm">
          ID: {projectId}
        </p>
      )}
    </header>
  )
}
