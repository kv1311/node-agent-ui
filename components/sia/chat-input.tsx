'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'agent'
  content: string
}

interface ChatInputProps {
  expanded: boolean
  onExpandChange: (expanded: boolean) => void
  messages: Message[]
  onSendMessage: (message: string) => void
}

export function ChatInput({ expanded, onExpandChange, messages, onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, expanded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    setIsSending(true)
    await onSendMessage(input.trim())
    setInput('')
    setIsSending(false)
  }

  const handleFocus = () => {
    onExpandChange(true)
  }

  const handleClose = () => {
    onExpandChange(false)
  }

  if (expanded) {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col"
        style={{ backgroundColor: '#080f09' }}
      >
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid #1a2e1d' }}
        >
          <h2
            className="text-lg font-medium"
            style={{ 
              fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
              color: '#c9b99a'
            }}
          >
            Sia
          </h2>
          <button
            onClick={handleClose}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: '#6b8f72' }}
            aria-label="Close chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p 
              className="text-center text-sm py-8"
              style={{ color: '#6b8f72' }}
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
                  className="max-w-[80%] px-4 py-2"
                  style={{ 
                    backgroundColor: '#c9b99a',
                    color: '#080f09',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-space), Space Grotesk, sans-serif'
                  }}
                >
                  {msg.content}
                </div>
              ) : (
                <div 
                  className="max-w-[80%] text-sm"
                  style={{ 
                    color: '#ede8df',
                    fontFamily: 'var(--font-space), Space Grotesk, sans-serif'
                  }}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form 
          onSubmit={handleSubmit}
          className="p-4"
          style={{ borderTop: '1px solid #1a2e1d' }}
        >
          <div 
            className="flex items-center gap-3 px-4 py-3"
            style={{ 
              backgroundColor: '#0d1a10',
              border: '1px solid #1a2e1d',
              borderRadius: '10px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Sia..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ 
                color: '#ede8df',
                fontFamily: 'var(--font-space), Space Grotesk, sans-serif'
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-1 transition-opacity disabled:opacity-30"
              style={{ color: '#c9b99a' }}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div 
      className="fixed bottom-16 left-0 right-0 p-4 z-40"
      style={{ backgroundColor: '#080f09' }}
    >
      <div 
        className="flex items-center gap-3 px-4 py-3"
        style={{ 
          backgroundColor: '#0d1a10',
          border: '1px solid #1a2e1d',
          borderRadius: '10px'
        }}
      >
        <input
          type="text"
          placeholder="Message Sia..."
          onFocus={handleFocus}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ 
            color: '#ede8df',
            fontFamily: 'var(--font-space), Space Grotesk, sans-serif'
          }}
          readOnly
        />
        <div style={{ color: '#6b8f72' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </div>
    </div>
  )
}
