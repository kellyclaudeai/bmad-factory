'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ScrollToBottomProps {
  children: ReactNode
  className?: string
}

export function ScrollToBottom({ children, className }: ScrollToBottomProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [children])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
