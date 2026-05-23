import { motion, AnimatePresence } from 'framer-motion'
import {
  Archive,
  TrendingUp,
  BookOpen,
  Wrench,
  Terminal,
  Shield,
  Settings,
  Wifi,
  WifiOff,
} from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useApp } from '../context/AppContext'
import type { NavPage } from '../types'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface NavItem {
  id: NavPage
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Archive', icon: Archive },
  { id: 'finance', label: 'Ledger', icon: TrendingUp },
  { id: 'journal', label: 'Chronicle', icon: BookOpen },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'logs', label: 'Terminal', icon: Terminal },
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const {
    activePage,
    setActivePage,
    sidebarExpanded,
    setSidebarExpanded,
    serverOnline,
  } = useApp()
  const reduced = useReducedMotion()

  return (
    <Tooltip.Provider delayDuration={200}>
      <motion.nav
        className="fixed left-0 top-0 h-full z-40 flex flex-col border-r border-[#1a2e1d] bg-[#080f09]"
        animate={{ width: sidebarExpanded ? 160 : 52 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: 'spring', stiffness: 300, damping: 30 }
        }
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* SIA wordmark + status */}
        <div className="flex items-center h-14 px-3.5 border-b border-[#1a2e1d] shrink-0 overflow-hidden">
          <span
            className="text-[#c9b99a] italic shrink-0"
            style={{ fontFamily: 'EB Garamond, serif', fontSize: '22px' }}
            aria-label="Sia"
          >
            S
          </span>

          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                className="text-[#c9b99a] italic ml-0.5"
                style={{ fontFamily: 'EB Garamond, serif', fontSize: '22px' }}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={reduced ? { duration: 0 } : { duration: 0.2 }}
              >
                ia
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                className="ml-auto flex items-center gap-1.5 shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: 0 } : { delay: 0.1, duration: 0.2 }}
              >
                {serverOnline ? (
                  <Wifi size={11} className="text-emerald-400" />
                ) : (
                  <WifiOff size={11} className="text-red-400" />
                )}
                <span
                  className={serverOnline ? 'text-emerald-400' : 'text-red-400'}
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {serverOnline ? 'live' : 'offline'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 flex-1 pt-3 px-1.5 overflow-hidden">
          {NAV_ITEMS.map((item, i) => {
            const isActive = activePage === item.id
            const Icon = item.icon

            const button = (
              <motion.button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={[
                  'relative flex items-center gap-3 w-full rounded px-2.5 py-2.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f09]',
                  isActive
                    ? 'text-[#c9b99a] bg-[#1a2e1d]'
                    : 'text-[#6b8f72] hover:text-[#ede8df] hover:bg-[#0d1a10]',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                whileTap={reduced ? {} : { scale: 0.96 }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#c9b99a]"
                    layoutId="activeBar"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 400, damping: 35 }
                    }
                  />
                )}

                <Icon size={16} strokeWidth={1.5} className="shrink-0 ml-0.5" />

                <AnimatePresence>
                  {sidebarExpanded && (
                    <motion.span
                      className="whitespace-nowrap overflow-hidden"
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '12px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontWeight: isActive ? 600 : 400,
                      }}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { delay: i * 0.02, duration: 0.18 }
                      }
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )

            // Show tooltip only when collapsed
            return sidebarExpanded ? (
              button
            ) : (
              <Tooltip.Root key={item.id}>
                <Tooltip.Trigger asChild>{button}</Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={8}
                    className="px-2.5 py-1.5 rounded bg-[#0d1a10] border border-[#1a2e1d] text-[#ede8df] z-50"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.label}
                    <Tooltip.Arrow className="fill-[#1a2e1d]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )
          })}
        </div>

        {/* Bottom — version */}
        <AnimatePresence>
          {sidebarExpanded && (
            <motion.div
              className="px-4 pb-4 shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            >
              <span
                className="text-[#1a2e1d]"
                style={{
                  fontFamily: 'Courier Prime, monospace',
                  fontSize: '10px',
                }}
              >
                v0.2.0
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </Tooltip.Provider>
  )
}
