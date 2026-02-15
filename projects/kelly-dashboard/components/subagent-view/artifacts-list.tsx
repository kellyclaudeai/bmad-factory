import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ArtifactsListProps {
  artifacts?: string[]
  projectId?: string
}

export function ArtifactsList({ artifacts, projectId }: ArtifactsListProps) {
  // If no artifacts available, show placeholder
  if (!artifacts || artifacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-lg">Artifacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-terminal-dim">
            No artifacts recorded for this session.
            {projectId && (
              <p className="mt-2 text-xs">
                Check project directory for files created during this subagent&apos;s work.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-lg flex items-center justify-between">
          <span>Artifacts</span>
          <span className="text-sm font-normal text-terminal-dim">
            {artifacts.length} file{artifacts.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {artifacts.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded bg-terminal-card border border-terminal-border hover:border-terminal-green transition-colors"
            >
              <span className="text-terminal-green">📄</span>
              <span className="text-sm font-mono text-terminal-text break-all">
                {file}
              </span>
            </div>
          ))}
        </div>

        {projectId && (
          <div className="mt-4 pt-4 border-t border-terminal-border">
            <div className="text-xs text-terminal-dim">
              <span className="font-mono">Project:</span>{' '}
              <span className="font-mono text-terminal-text">{projectId}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
