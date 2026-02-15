'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-terminal-bg p-8 flex items-center justify-center">
      <Card className="max-w-lg w-full border-terminal-red">
        <CardHeader>
          <CardTitle className="text-terminal-red font-mono text-2xl">
            ⚠️ Something went wrong
          </CardTitle>
          <CardDescription className="text-terminal-dim">
            An unexpected error occurred while loading this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-terminal-card border border-terminal-border rounded p-3 font-mono text-sm text-terminal-dim">
            <div className="text-terminal-text mb-1">Error details:</div>
            <div className="text-terminal-red break-all">
              {error.message || 'Unknown error'}
            </div>
            {error.digest && (
              <div className="mt-2 text-xs">
                Error ID: <span className="text-terminal-amber">{error.digest}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={reset}
              className="bg-terminal-green hover:bg-terminal-green/80 text-terminal-bg"
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-terminal-border hover:border-terminal-green"
            >
              Go to home
            </Button>
          </div>
          
          <div className="text-xs text-terminal-dim mt-4">
            If this error persists, check the browser console for more details or
            ensure the OpenClaw Gateway is running on <span className="font-mono">localhost:3000</span>.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
