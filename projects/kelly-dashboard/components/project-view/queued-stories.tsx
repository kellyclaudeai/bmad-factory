'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Story {
  id: string
  title: string
  epic?: string
  estimatedHours?: number
  dependsOn: string[]
  blockedBy?: string[]
}

interface QueuedStoriesProps {
  stories: Record<string, Story>
  completedStoryIds: string[]
  activeStoryIds: string[]
}

export function QueuedStories({ stories, completedStoryIds, activeStoryIds }: QueuedStoriesProps) {
  // If no stories data, show graceful message
  if (!stories || Object.keys(stories).length === 0) {
    return (
      <Card className="bg-terminal-card border-terminal-border">
        <CardContent className="pt-6 text-terminal-dim font-mono text-sm">
          Queued stories data not available (planning incomplete)
        </CardContent>
      </Card>
    )
  }

  // Filter queued stories: dependencies complete but story not yet started
  const queuedStories = Object.values(stories).filter((story) => {
    // Skip if already started or completed
    if (activeStoryIds.includes(story.id) || completedStoryIds.includes(story.id)) {
      return false
    }

    // Check if all dependencies are complete
    const allDepsComplete = story.dependsOn.every((depId) => completedStoryIds.includes(depId))
    
    return allDepsComplete
  })

  // Sort by number of dependencies (ready-first: fewest dependencies first)
  queuedStories.sort((a, b) => a.dependsOn.length - b.dependsOn.length)

  if (queuedStories.length === 0) {
    return (
      <Card className="bg-terminal-card border-terminal-border">
        <CardContent className="pt-6 text-terminal-dim font-mono text-sm">
          No queued stories (all dependencies not yet complete or all stories started)
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {queuedStories.map((story) => {
        const allDepsComplete = story.dependsOn.length === 0 || story.dependsOn.every((depId) => completedStoryIds.includes(depId))
        
        return (
          <Card 
            key={story.id}
            className="bg-terminal-card border-terminal-border transition-all duration-200 hover:border-terminal-amber hover:shadow-[0_0_10px_rgba(251,191,36,0.1)]"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-mono text-sm font-semibold text-terminal-text line-clamp-2 flex-1">
                  {story.id}: {story.title}
                </h3>
                <Badge 
                  variant="outline"
                  className="text-xs font-mono shrink-0 bg-terminal-amber/10 text-terminal-amber border-terminal-amber"
                >
                  {allDepsComplete ? 'Ready' : 'Queued'}
                </Badge>
              </div>
              
              <div className="space-y-1.5 text-xs font-mono">
                {story.epic && (
                  <div className="flex items-start gap-2 text-terminal-dim">
                    <span>Epic:</span>
                    <span className="text-terminal-text line-clamp-2 flex-1">{story.epic}</span>
                  </div>
                )}
                
                {story.estimatedHours !== undefined && (
                  <div className="flex items-center gap-2 text-terminal-dim">
                    <span>Est:</span>
                    <span className="text-terminal-green">{story.estimatedHours}h</span>
                  </div>
                )}
                
                {story.dependsOn.length > 0 && (
                  <div className="flex items-start gap-2 text-terminal-dim">
                    <span>Depends on:</span>
                    <span className="text-terminal-green flex-1">
                      {story.dependsOn.map((depId, idx) => (
                        <span key={depId}>
                          {depId}
                          {completedStoryIds.includes(depId) ? ' ✓' : ' ⏳'}
                          {idx < story.dependsOn.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
                
                {story.dependsOn.length === 0 && (
                  <div className="text-terminal-green">
                    No dependencies - ready to start
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
