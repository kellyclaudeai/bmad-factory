'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0e0f] text-[#e0e0e0] font-mono">
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-lg w-full border border-[#ff4444] rounded-lg p-6 bg-[#151a1c]">
            <h1 className="text-2xl font-bold text-[#ff4444] mb-4">
              ⚠️ Critical Error
            </h1>
            <p className="text-[#888888] mb-4">
              A critical error occurred. Please try refreshing the page.
            </p>
            <div className="bg-[#0a0e0f] border border-[#2a2f32] rounded p-3 mb-4">
              <div className="text-sm text-[#ff4444] break-all">
                {error.message || 'Unknown error'}
              </div>
              {error.digest && (
                <div className="text-xs text-[#ffaa00] mt-2">
                  Error ID: {error.digest}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 bg-[#00ff88] text-[#0a0e0f] rounded hover:bg-[#00cc6a] transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-[#2a2f32] rounded hover:border-[#00ff88] transition-colors"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
