'use client'

import { useState } from 'react'

type CardType = 'tasks' | 'reminders' | 'bills' | 'events' | 'watchlist' | 'memory'

interface CardConfig {
  id: CardType
  label: string
}

interface AddCardButtonProps {
  availableCards: CardConfig[]
  onAddCard: (cardId: CardType) => void
}

export function AddCardButton({ availableCards, onAddCard }: AddCardButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-4 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
        style={{ 
          backgroundColor: '#0d1a10',
          border: '1px solid #1a2e1d',
          borderRadius: '10px'
        }}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ color: '#c9b99a' }}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span
          className="text-xs uppercase tracking-wider"
          style={{ 
            fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
            color: '#c9b99a',
            letterSpacing: '0.1em'
          }}
        >
          Add Card
        </span>
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-full left-0 right-0 mb-2 p-2"
          style={{ 
            backgroundColor: '#0d1a10',
            border: '1px solid #1a2e1d',
            borderRadius: '10px'
          }}
        >
          {availableCards.map((card) => (
            <button
              key={card.id}
              onClick={() => {
                onAddCard(card.id)
                setIsOpen(false)
              }}
              className="w-full py-2 px-3 text-left transition-colors hover:opacity-80"
              style={{ 
                borderRadius: '6px'
              }}
            >
              <span
                className="text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
                  color: '#ede8df',
                  letterSpacing: '0.1em'
                }}
              >
                {card.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
