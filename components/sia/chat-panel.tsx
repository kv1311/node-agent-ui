'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Message {
  role: 'user' | 'agent'
  content: string
}

interface ChatPanelProps {
  expanded: boolean
  onExpandChange: (expanded: boolean) => void
  messages: Message[]
  onSendMessage: (message: string) => void
}

export function ChatPanel({ expanded, onExpandChange, messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, expanded])

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [expanded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    setIsSending(true)
    await onSendMessage(input.trim())
    setInput('')
    setIsSending(false)
  }

  const handleFocus = useCallback(() => {
    onExpandChange(true)
  }, [onExpandChange])

  const handleClose = useCallback(() => {
    onExpandChange(false)
  }, [onExpandChange])

  return (
    <>
      {/* Expanded Chat Panel */}
      {expanded && (
        <div
          className="fixed bottom-[52px] left-[44px] right-0 z-40 flex flex-col"
          style={{
            height: 'calc(100vh - 252px)',
            backgroundColor: '#080f09',
            borderTop: '0.5px solid #1a2e1d',
          }}
        >
          {/* Close button */}
          <div className="flex justify-end p-2">
            <button
              onClick={handleClose}
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: '#6b8f72' }}
              aria-label="Close chat"
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>×</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
            {messages.length === 0 && (
              <p 
                className="text-center text-sm py-8 italic"
                style={{ 
                  color: '#6b8f72',
                  fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
                }}
              >
                Ask Sia anything...
              </p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'user' ? (
                  <div 
                    className="max-w-[80%] px-4 py-2 text-sm"
                    style={{ 
                      backgroundColor: '#1a2e1d',
                      color: '#c9b99a',
                      borderRadius: '12px 12px 2px 12px',
                      fontFamily: 'var(--font-space), Space Grotesk, sans-serif'
                    }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div 
                    className="max-w-[80%] text-sm italic"
                    style={{ 
                      color: '#ede8df',
                      fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif'
                    }}
                  >
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Bottom Chat Input Bar */}
      <div 
        className="fixed bottom-0 left-[44px] right-0 z-40"
        style={{ 
          height: '52px',
          backgroundColor: '#080f09',
          borderTop: '0.5px solid #1a2e1d',
        }}
      >
        <form onSubmit={handleSubmit} className="h-full px-4 flex items-center">
          <div 
            className="flex items-center gap-3 flex-1 px-4 py-2"
            style={{ 
              backgroundColor: expanded ? 'transparent' : '#0d1a10',
              border: expanded ? 'none' : '0.5px solid #1a2e1d',
              borderRadius: '8px',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={handleFocus}
              placeholder="Message Sia..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ 
                color: '#ede8df',
                fontFamily: 'var(--font-space), Space Grotesk, sans-serif'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-1 transition-opacity disabled:opacity-30"
              style={{ color: '#c9b99a' }}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
