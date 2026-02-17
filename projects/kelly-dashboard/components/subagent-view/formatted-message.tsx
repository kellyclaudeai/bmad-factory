'use client'

import { useState } from 'react'

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content?: string | Array<{type: string, text?: string, [key: string]: any}>
  toolCalls?: Array<{id: string, function: {name: string, arguments: string}}>
  toolCallId?: string
  name?: string // tool name for tool-result messages
  thinking?: string
  timestamp?: string
}

interface FormattedMessageProps {
  message: Message
}

function getRoleEmoji(role: string): string {
  switch (role) {
    case 'system':
      return '📋'
    case 'user':
      return '👤'
    case 'assistant':
      return '🤖'
    case 'tool':
      return '🔧'
    default:
      return '❓'
  }
}

function extractTextContent(content: Message['content']): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  
  // Handle array format
  const textBlocks = content.filter(block => block.type === 'text' && block.text)
  return textBlocks.map(block => block.text).join('\n')
}

function parseToolArguments(argsString: string): Record<string, any> {
  try {
    return JSON.parse(argsString)
  } catch {
    return {}
  }
}

function formatToolArguments(args: Record<string, any>): string {
  const keyFields = ['command', 'path', 'file_path', 'query', 'url', 'action', 'text', 'message']
  const relevantEntries = Object.entries(args).filter(([key]) => 
    keyFields.includes(key) || keyFields.includes(key.toLowerCase())
  )
  
  if (relevantEntries.length === 0) {
    // Show first 3 fields if no key fields found
    return Object.entries(args)
      .slice(0, 3)
      .map(([key, value]) => {
        const displayValue = typeof value === 'string' && value.length > 50 
          ? `${value.substring(0, 50)}...` 
          : JSON.stringify(value)
        return `${key}: ${displayValue}`
      })
      .join(', ')
  }
  
  return relevantEntries
    .map(([key, value]) => {
      const displayValue = typeof value === 'string' && value.length > 80 
        ? `${value.substring(0, 80)}...` 
        : JSON.stringify(value)
      return `${key}: ${displayValue}`
    })
    .join('\n')
}

function truncateOutput(output: string, maxChars: number = 200): { text: string; truncated: boolean; lineCount?: number } {
  if (output.length <= maxChars) {
    return { text: output, truncated: false }
  }
  
  const lines = output.split('\n')
  let charCount = 0
  let lineIndex = 0
  
  while (lineIndex < lines.length && charCount + lines[lineIndex].length <= maxChars) {
    charCount += lines[lineIndex].length + 1 // +1 for newline
    lineIndex++
  }
  
  const truncatedText = lines.slice(0, lineIndex).join('\n')
  const remainingLines = lines.length - lineIndex
  
  return {
    text: truncatedText,
    truncated: true,
    lineCount: remainingLines
  }
}

function isToolSuccess(message: Message): boolean {
  if (message.role !== 'tool') return false
  
  const content = extractTextContent(message.content)
  
  // Check for common error patterns
  if (content.toLowerCase().includes('error:') || 
      content.toLowerCase().includes('failed:') ||
      content.toLowerCase().includes('exception:')) {
    return false
  }
  
  // Try to parse as JSON and check for error field
  try {
    const parsed = JSON.parse(content)
    if (parsed.error || parsed.status === 'error') return false
    if (parsed.exit !== undefined && parsed.exit !== 0) return false
  } catch {
    // Not JSON, continue
  }
  
  return true
}

export function FormattedMessage({ message }: FormattedMessageProps) {
  const roleEmoji = getRoleEmoji(message.role)
  const textContent = extractTextContent(message.content)
  
  // Handle thinking blocks
  if (message.thinking) {
    return (
      <div className="mb-3 last:mb-0">
        <div className="flex items-start gap-2">
          <span className="text-base">💭</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-mono text-terminal-dim mb-1">
              Thinking
            </div>
            <div className="p-3 bg-terminal-card rounded border border-terminal-border">
              <pre className="text-xs font-mono text-terminal-text whitespace-pre-wrap break-words">
                {message.thinking}
              </pre>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Handle tool calls (assistant proposing tool use)
  if (message.toolCalls && message.toolCalls.length > 0) {
    return (
      <div className="mb-3 last:mb-0">
        {message.toolCalls.map((toolCall, idx) => {
          const args = parseToolArguments(toolCall.function.arguments)
          const formattedArgs = formatToolArguments(args)
          
          return (
            <div key={toolCall.id || idx} className="flex items-start gap-2 mb-2 last:mb-0">
              <span className="text-base">🔧</span>
              <div className="flex-1 min-w-0 bg-terminal-card p-3 rounded border border-terminal-border">
                <div className="text-sm font-mono font-bold text-terminal-green mb-1">
                  {toolCall.function.name}
                </div>
                {formattedArgs && (
                  <pre className="text-xs font-mono text-terminal-text whitespace-pre-wrap break-words">
                    {formattedArgs}
                  </pre>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  
  // Handle tool results
  if (message.role === 'tool') {
    const success = isToolSuccess(message)
    const statusEmoji = success ? '✅' : '❌'
    const statusColor = success ? 'text-terminal-green' : 'text-red-400'
    const borderColor = success ? 'border-terminal-green/30' : 'border-red-400/30'
    const bgColor = success ? 'bg-terminal-green/5' : 'bg-red-400/5'
    
    const { text, truncated, lineCount } = truncateOutput(textContent, 300)
    
    return (
      <div className="mb-3 last:mb-0">
        <div className="flex items-start gap-2">
          <span className="text-base">{statusEmoji}</span>
          <div className={`flex-1 min-w-0 p-3 rounded border ${borderColor} ${bgColor}`}>
            <div className={`text-sm font-mono font-bold ${statusColor} mb-1`}>
              {message.name || 'tool result'}
            </div>
            <pre className="text-xs font-mono text-terminal-text whitespace-pre-wrap break-words">
              {text}
              {truncated && (
                <span className="text-terminal-dim">
                  {'\n'}... ({lineCount} more lines)
                </span>
              )}
            </pre>
          </div>
        </div>
      </div>
    )
  }
  
  // Handle regular messages (user, assistant, system)
  if (textContent) {
    return (
      <div className="mb-3 last:mb-0">
        <div className="flex items-start gap-2">
          <span className="text-base">{roleEmoji}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-terminal-dim capitalize mb-1">
              {message.role}
            </div>
            <div className="text-sm font-mono text-terminal-text whitespace-pre-wrap break-words">
              {textContent}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Fallback: show raw JSON for unrecognized messages (never return null)
  console.warn('FormattedMessage: Unrecognized message format, showing raw JSON', message)
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-start gap-2">
        <span className="text-base">⚠️</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-terminal-dim mb-1">
            Raw Message (unrecognized format)
          </div>
          <pre className="text-xs font-mono text-terminal-dim whitespace-pre-wrap break-words p-2 bg-terminal-card rounded border border-terminal-border">
            {JSON.stringify(message, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
