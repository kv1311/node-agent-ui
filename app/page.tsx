'use client'

import { useState, useCallback, useEffect } from 'react'
import { Sidebar } from '@/components/sia/sidebar'
import { ArtHeader } from '@/components/sia/art-header'
import { InteractiveCard } from '@/components/sia/interactive-card'
import { ChatPanel } from '@/components/sia/chat-panel'
import { ToolsPage } from '@/components/sia/tools-page'
import { ToastManager } from '@/components/sia/toast'
import { useGreeting } from '@/components/sia/greeting-card'

type NavItem = 'home' | 'tools' | 'settings' | 'admin'
type CardType = 'tasks' | 'reminders' | 'bills' | 'events' | 'watchlist' | 'memory'

interface ArtworkInfo {
  title: string
  artist: string
  date: string
  culture: string
  period: string
}

const SCROLL_STORAGE_KEY = 'sia_home_scroll'

// Top 4 most relevant cards for home
const homeCards: { id: CardType; label: string }[] = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'bills', label: 'Bills' },
  { id: 'events', label: 'Events' },
]

export default function HomePage() {
  const [activeNav, setActiveNav] = useState<NavItem>('home')
  const [chatExpanded, setChatExpanded] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; content: string }[]>([])
  const [artworkInfo, setArtworkInfo] = useState<ArtworkInfo | null>(null)
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([])
  const greeting = useGreeting()

  // Save and restore scroll position
  useEffect(() => {
    if (activeNav === 'home') {
      const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY)
      if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll, 10))
      }
    }

    const handleScroll = () => {
      if (activeNav === 'home') {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, window.scrollY.toString())
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeNav])

  const showError = useCallback((message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleSendMessage = useCallback(async (message: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: message }])
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
       headers: {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
},
        body: JSON.stringify({ message }),
      })
      if (!response.ok) throw new Error('Failed to send message')
      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'agent', content: data.reply }])
    } catch {
      showError('Could not reach server. Retrying...')
      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: 'Connection lost. Try again.' },
      ])
    }
  }, [showError])

  const handleArtworkKnowMore = useCallback(() => {
    if (artworkInfo) {
      const message = `Tell me about "${artworkInfo.title}" by ${artworkInfo.artist}, created ${artworkInfo.date}. Culture: ${artworkInfo.culture}. Period: ${artworkInfo.period}.`
      setChatExpanded(true)
      handleSendMessage(message)
    }
  }, [artworkInfo, handleSendMessage])


  const handleNavigate = useCallback((item: NavItem) => {
    setActiveNav(item)
  }, [])

  const renderContent = () => {
    switch (activeNav) {
      case 'tools':
        return <ToolsPage onError={showError} />
      
      case 'settings':
        return (
          <div className="min-h-screen pt-4 pb-20 px-4">
            <h1
              className="text-xl font-semibold mb-6"
              style={{ 
                fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
                color: '#c9b99a'
              }}
            >
              Settings
            </h1>
            <p 
              className="text-sm italic"
              style={{ 
                fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
                color: '#6b8f7299'
              }}
            >
              Configuration options coming soon.
            </p>
          </div>
        )
      
      case 'admin':
        return (
          <div className="min-h-screen pt-4 pb-20 px-4">
            <h1
              className="text-xl font-semibold mb-6"
              style={{ 
                fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
                color: '#c9b99a'
              }}
            >
              Admin
            </h1>
            <p 
              className="text-sm italic"
              style={{ 
                fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
                color: '#6b8f7299'
              }}
            >
              Administrative controls coming soon.
            </p>
          </div>
        )
      
      default:
        return (
          <div className="min-h-screen pb-20">
            <ArtHeader 
              onKnowMore={handleArtworkKnowMore}
              onArtworkLoad={setArtworkInfo}
              greeting={greeting}
            />
            
            <div className="px-4 pt-4 flex flex-col gap-3">
              {homeCards.map((card) => (
                <InteractiveCard
                  key={card.id}
                  type={card.id}
                  label={card.label}
                  onError={showError}
                />
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <main
      className="min-h-screen relative"
      style={{ backgroundColor: '#080f09' }}
    >
      <ToastManager toasts={toasts} onDismiss={dismissToast} />
      
      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} />
      
      <div style={{ marginLeft: '44px' }}>
        {renderContent()}
      </div>

      <ChatPanel
        expanded={chatExpanded}
        onExpandChange={setChatExpanded}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </main>
  )
}
