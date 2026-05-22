'use client'

import { useState } from 'react'
import { Home, Wrench, Settings, Shield } from 'lucide-react'

type NavItem = 'home' | 'tools' | 'settings' | 'admin'

interface SidebarProps {
  activeItem: NavItem
  onNavigate: (item: NavItem) => void
}

const navItems: { id: NavItem; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'tools', label: 'TOOLS', icon: Wrench },
  { id: 'settings', label: 'SETTINGS', icon: Settings },
  { id: 'admin', label: 'ADMIN', icon: Shield },
]

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <nav
      className="fixed left-0 top-0 h-full z-50 flex flex-col py-6"
      style={{
        width: expanded ? '140px' : '44px',
        backgroundColor: '#080f09',
        borderRight: '0.5px solid #1a2e1d',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex flex-col gap-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          
          return (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation()
                onNavigate(item.id)
              }}
              className="flex items-center gap-3 py-3 px-2 relative transition-colors"
              style={{
                borderLeft: isActive ? '2px solid #c9b99a' : '2px solid transparent',
                marginLeft: '-2px',
              }}
            >
              <Icon
                size={18}
                style={{ 
                  color: isActive ? '#c9b99a' : '#6b8f72',
                  minWidth: '18px',
                }}
              />
              <span
                className="whitespace-nowrap overflow-hidden"
                style={{
                  fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: isActive ? '#c9b99a' : '#6b8f72',
                  opacity: expanded ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
