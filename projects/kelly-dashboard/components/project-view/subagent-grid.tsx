'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SubagentCard } from './subagent-card'

interface Subagent {
  sessionKey?: string
  story?: string
  storyId?: string
  storyTitle?: string
  persona?: string
  role?: string
  task?: string
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
    now: true,
    next: false,
    history: false,
  })
  
  // Group subagents by status
  // NOW: Currently active subagents (running right now)
  const nowSubagents = subagents.filter(
    (s) => s.status === 'active'
  )
  
  // HISTORY: Completed subagents with duration and status
  const historySubagents = subagents.filter(
    (s) => s.status === 'complete'
  )
  
  // NEXT: Queued/pending stories that haven't started
  const nextSubagents = subagents.filter(
    (s) => s.status === 'queued' || s.status === 'pending'
  )
  
  const sections: Section[] = [
    {
      title: 'Now: Active Subagents',
      items: nowSubagents,
      defaultExpanded: true,
      titleColor: 'text-terminal-green',
      emptyMessage: 'No subagents currently running',
    },
    {
      title: 'History: Completed Subagents',
      items: historySubagents,
      defaultExpanded: false,
      titleColor: 'text-terminal-dim',
      emptyMessage: 'No completed subagents',
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
        const sectionKey = ['now', 'next', 'history'][index]
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
                focus:outline-none focus:ring-2 focus:ring-terminal-green rounded px-2 py-1 -mx-2
              `}
              aria-expanded={isExpanded}
              aria-controls={`subagent-section-${sectionKey}`}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${section.title} section`}
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
                id={`subagent-section-${sectionKey}`}
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
                        story={subagent.story || subagent.storyId}
                        storyTitle={subagent.storyTitle}
                        persona={subagent.persona}
                        role={subagent.role}
                        task={subagent.task}
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
