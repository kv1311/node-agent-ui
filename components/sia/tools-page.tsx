'use client'

import { useState } from 'react'
import { InteractiveCard } from './interactive-card'
import { ChevronDown, ChevronUp } from 'lucide-react'

type CardType = 'tasks' | 'reminders' | 'bills' | 'events' | 'watchlist' | 'memory'

interface ToolsPageProps {
  onError: (message: string) => void
}

const allTools: { id: CardType; label: string }[] = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'bills', label: 'Bills' },
  { id: 'events', label: 'Events' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'memory', label: 'Memory' },
]

interface AccordionCardProps {
  id: CardType
  label: string
  onError: (message: string) => void
}

function AccordionCard({ id, label, onError }: AccordionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div 
      style={{ 
        backgroundColor: '#0d1a10',
        border: '0.5px solid #1a2e1d',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
        style={{ 
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span
          className="text-xs uppercase tracking-widest"
          style={{ 
            fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
            color: '#6b8f72',
            letterSpacing: '0.1em',
            fontVariant: 'small-caps'
          }}
        >
          {label}
        </span>
        {expanded ? (
          <ChevronUp size={16} style={{ color: '#6b8f72' }} />
        ) : (
          <ChevronDown size={16} style={{ color: '#6b8f72' }} />
        )}
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <InteractiveCard 
            type={id} 
            label="" 
            onError={onError}
            isExpanded={true}
          />
        </div>
      )}
    </div>
  )
}

export function ToolsPage({ onError }: ToolsPageProps) {
  return (
    <div className="min-h-screen pt-4 pb-20">
      <h1
        className="text-xl font-semibold mb-6 px-4"
        style={{ 
          fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
          color: '#c9b99a'
        }}
      >
        Tools
      </h1>
      
      <div className="grid grid-cols-2 gap-3 px-4">
        {allTools.map((tool) => (
          <AccordionCard 
            key={tool.id}
            id={tool.id}
            label={tool.label}
            onError={onError}
          />
        ))}
      </div>
    </div>
  )
}
