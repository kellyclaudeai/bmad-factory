'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SubagentCard } from './subagent-card'

interface Subagent {
  sessionKey?: string
  story?: string
  status: string
  startedAt?: string
  completedAt?: string
  duration?: string
  branch?: string
}

interface SubagentGridProps {
  subagents: Subagent[]
}

interface Section {
  title: string
  items: Subagent[]
  defaultExpanded: boolean
  titleColor: string
  emptyMessage: string
}

export function SubagentGrid({ subagents }: SubagentGridProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    live: true,
    past: false,
    queued: false,
  })
  
  // Group subagents by status
  const liveSubagents = subagents.filter(
    (s) => s.status === 'active'
  )
  
  const pastSubagents = subagents.filter(
    (s) => s.status === 'complete'
  )
  
  const queuedSubagents = subagents.filter(
    (s) => s.status === 'queued' || s.status === 'pending'
  )
  
  const sections: Section[] = [
    {
      title: 'Live Subagents',
      items: liveSubagents,
      defaultExpanded: true,
      titleColor: 'text-terminal-green',
      emptyMessage: 'No live subagents',
    },
    {
      title: 'Past Subagents',
      items: pastSubagents,
      defaultExpanded: false,
      titleColor: 'text-terminal-dim',
      emptyMessage: 'No past subagents',
    },
    {
      title: 'Queued Subagents',
      items: queuedSubagents,
      defaultExpanded: false,
      titleColor: 'text-terminal-amber',
      emptyMessage: 'No queued subagents',
    },
  ]
  
  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }
  
  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const sectionKey = ['live', 'past', 'queued'][index]
        const isExpanded = expandedSections[sectionKey]
        
        return (
          <div key={sectionKey} className="space-y-3">
            <button
              onClick={() => toggleSection(sectionKey)}
              className={`
                flex items-center gap-2 w-full
                font-mono font-bold text-lg
                transition-colors duration-200
                hover:${section.titleColor.replace('text-', 'text-')}/80
                ${section.titleColor}
              `}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              {section.title}
              <span className="ml-2 text-sm font-normal text-terminal-dim">
                ({section.items.length})
              </span>
            </button>
            
            {isExpanded && (
              <div
                className="animate-in slide-in-from-top-2 duration-200"
              >
                {section.items.length === 0 ? (
                  <p className="text-terminal-dim text-sm font-mono ml-7">
                    {section.emptyMessage}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((subagent, idx) => (
                      <SubagentCard
                        key={subagent.sessionKey || `${sectionKey}-${idx}`}
                        sessionKey={subagent.sessionKey}
                        story={subagent.story}
                        status={subagent.status as 'active' | 'complete' | 'queued' | 'pending'}
                        startedAt={subagent.startedAt}
                        completedAt={subagent.completedAt}
                        duration={subagent.duration}
                        branch={subagent.branch}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
