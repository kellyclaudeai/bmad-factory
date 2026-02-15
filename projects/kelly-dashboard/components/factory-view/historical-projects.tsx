'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type FactoryStateResponse = {
  active: string[]
  queued: string[]
  completed: string[]
  shipped: string[]
}

type HistoricalProject = {
  id: string
  stage: 'completed' | 'shipped'
}

export function HistoricalProjects() {
  const router = useRouter()
  const [projects, setProjects] = useState<HistoricalProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/factory-state')
        if (!response.ok) {
          throw new Error('Failed to fetch factory state')
        }
        
        const data: FactoryStateResponse = await response.json()
        
        // Combine completed and shipped projects
        const historicalProjects: HistoricalProject[] = [
          ...data.completed.map(id => ({ id, stage: 'completed' as const })),
          ...data.shipped.map(id => ({ id, stage: 'shipped' as const })),
        ]
        
        setProjects(historicalProjects)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Pagination logic
  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = projects.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Historical Projects</CardTitle>
          <CardDescription>Completed and shipped projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-terminal-dim">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Historical Projects</CardTitle>
          <CardDescription>Completed and shipped projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-terminal-red">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Historical Projects</CardTitle>
          <CardDescription>Completed and shipped projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-terminal-dim">No historical projects found</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono">Historical Projects</CardTitle>
        <CardDescription>
          {projects.length} {projects.length === 1 ? 'project' : 'projects'} (Page {currentPage} of {totalPages})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {currentProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleProjectClick(project.id)
                }
              }}
              className="flex items-center justify-between p-3 rounded-lg border border-terminal-border hover:border-terminal-green hover:bg-terminal-hover cursor-pointer transition-colors focus:ring-2 focus:ring-terminal-green focus:outline-none"
              tabIndex={0}
              role="button"
              aria-label={`View ${project.id} project, status: ${project.stage}`}
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-terminal-text">{project.id}</span>
                <Badge 
                  variant={project.stage === 'shipped' ? 'default' : 'secondary'}
                  className={project.stage === 'shipped' ? 'bg-terminal-green text-terminal-bg' : ''}
                >
                  {project.stage}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  )
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = index > 0 && page - array[index - 1] > 1
                  
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsisBefore && (
                        <span className="px-2 text-terminal-dim">...</span>
                      )}
                      <Button
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={page === currentPage ? 'bg-terminal-green text-terminal-bg' : ''}
                        aria-label={`Go to page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                      >
                        {page}
                      </Button>
                    </div>
                  )
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
