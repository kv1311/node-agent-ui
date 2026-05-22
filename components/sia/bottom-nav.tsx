'use client'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'home', label: 'HOME' },
  { id: 'finance', label: 'FINANCE' },
  { id: 'journal', label: 'JOURNAL' },
  { id: 'watchlist', label: 'WATCHLIST' },
  { id: 'admin', label: 'ADMIN' },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ 
        backgroundColor: '#080f09',
        borderTop: '1px solid #1a2e1d'
      }}
    >
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-1 px-2 transition-colors"
          >
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ 
                fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
                color: activeTab === tab.id ? '#c9b99a' : '#6b8f72',
                letterSpacing: '0.1em'
              }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
