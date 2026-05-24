'use client'

import { motion } from 'framer-motion'
import { CheckSquare, Bell, Receipt, Calendar, Film, BookOpen } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { LucideIcon } from 'lucide-react'

interface ToolCard {
  id: string
  label: string
  icon: LucideIcon
  description: string
  prompt: string
  color: string
}

const TOOLS: ToolCard[] = [
  {
    id: 'task',
    label: 'Add Task',
    icon: CheckSquare,
    description: 'Create a new task',
    prompt: 'add a task: ',
    color: '#2d5a34',
  },
  {
    id: 'reminder',
    label: 'Set Reminder',
    icon: Bell,
    description: 'Create a reminder',
    prompt: 'remind me to ',
    color: '#6b8f72',
  },
  {
    id: 'bill',
    label: 'Log Bill',
    icon: Receipt,
    description: 'Add an unpaid bill',
    prompt: 'add bill: ',
    color: '#c9b99a',
  },
  {
    id: 'event',
    label: 'Add Event',
    icon: Calendar,
    description: 'Add an event or date',
    prompt: 'add event: ',
    color: '#7ab4c9',
  },
  {
    id: 'watchlist',
    label: 'Add to Watchlist',
    icon: Film,
    description: 'Add a movie or show',
    prompt: 'add to watchlist: ',
    color: '#b97ac9',
  },
  {
    id: 'journal',
    label: 'Journal This',
    icon: BookOpen,
    description: 'Save to journal',
    prompt: 'journal this: ',
    color: '#c97a7a',
  },
]

function ToolButton({
  tool,
  onClick,
  reduced,
  index,
}: {
  tool: ToolCard
  onClick: (tool: ToolCard) => void
  reduced: boolean
  index: number
}) {
  const Icon = tool.icon

  return (
    <motion.button
      onClick={() => onClick(tool)}
      className="relative group p-6 rounded-lg border border-[#1a2e1d] bg-[#0d1a10] hover:border-[#2d5a34] hover:bg-[#0d1a1055] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#c9b99a] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f09] text-left"
      initial={reduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced ? { duration: 0 } : { delay: index * 0.05, duration: 0.3, ease: 'easeOut' }
      }
      whileHover={reduced ? {} : { scale: 1.02 }}
      whileTap={reduced ? {} : { scale: 0.98 }}
    >
      <Icon
        size={20}
        strokeWidth={1.5}
        className="mb-3"
        style={{ color: tool.color }}
      />
      <h3
        className="font-semibold text-[#ede8df] mb-1"
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
      >
        {tool.label}
      </h3>
      <p
        className="text-[#6b8f72] group-hover:text-[#ede8df] transition-colors"
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px' }}
      >
        {tool.description}
      </p>
    </motion.button>
  )
}

export function ToolsPage() {
  const { setChatOpen, prefillInput } = useApp()
  const reduced = useReducedMotion()

  function handleToolClick(tool: ToolCard) {
    prefillInput(tool.prompt)
    setChatOpen(true)
  }

  return (
    <div className="min-h-screen pb-24 px-0">
      {/* Header */}
      <div className="px-5 py-5 border-b border-[#1a2e1d]">
        <h1
          className="text-[#c9b99a] italic"
          style={{ fontFamily: 'EB Garamond, serif', fontSize: '26px' }}
        >
          Tools
        </h1>
        <p
          className="text-[#6b8f72] mt-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}
        >
          Click a tool to start, or just tell Sia what you need.
        </p>
      </div>

      {/* Grid */}
      <div className="px-5 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map((tool, i) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            onClick={handleToolClick}
            reduced={reduced}
            index={i}
          />
        ))}
      </div>

      {/* Info */}
      <div className="px-5 py-6 text-center border-t border-[#1a2e1d]">
        <p
          className="text-[#6b8f72]"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
        >
          Everything routes through Sia. Just tell her what you need and she'll handle it.
        </p>
      </div>
    </div>
  )
}