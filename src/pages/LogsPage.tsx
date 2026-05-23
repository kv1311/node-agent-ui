import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Trash2 } from 'lucide-react'
import { fetchLogs } from '../lib/api'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { LogLine } from '../types'

const LEVEL_COLORS: Record<LogLine['level'], string> = {
  error: '#c97a7a',
  warn:  '#c9b97a',
  cron:  '#9ec4a4',
  agent: '#7ab4c9',
  tool:  '#b97ac9',
  info:  '#6b8f72',
}

const LEVEL_BG: Record<LogLine['level'], string> = {
  error: '#1a0a0a',
  warn:  '#1a1a0a',
  cron:  '#0a1a0d',
  agent: '#0a121a',
  tool:  '#120a1a',
  info:  '#080f09',
}

const ALL_LEVELS: LogLine['level'][] = ['info', 'agent', 'tool', 'cron', 'warn', 'error']

export function LogsPage() {
  const [logs, setLogs]       = useState<LogLine[]>([])
  const [loading, setLoading] = useState(true)
  const [paused, setPaused]   = useState(false)
  const [filter, setFilter]   = useState<LogLine['level'] | 'all'>('all')
  const reduced               = useReducedMotion()
  const endRef                = useRef<HTMLDivElement>(null)
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadLogs = useCallback(async () => {
    if (paused) return
    try {
      const data = await fetchLogs(150)
      setLogs(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [paused])

  useEffect(() => {
    void loadLogs()
    intervalRef.current = setInterval(() => void loadLogs(), 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loadLogs])

  // Auto-scroll to bottom only when not paused
  useEffect(() => {
    if (!paused) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, paused])

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.level === filter)

  return (
    // KEY FIX: h-full not min-h-screen — constrains to parent viewport height
    // Parent in App.tsx is overflow-y-auto flex-1, so this fills exactly the screen
    <div className="h-full flex flex-col overflow-hidden">

      {/* Header — never scrolls away */}
      <div className="px-5 py-4 border-b border-[#1a2e1d] flex items-center justify-between gap-3 shrink-0">
        <h1
          className="text-[#c9b99a] italic"
          style={{ fontFamily: 'EB Garamond, serif', fontSize: '26px' }}
        >
          Terminal
        </h1>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setPaused((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1a2e1d] rounded text-[#6b8f72] hover:text-[#ede8df] hover:border-[#6b8f72] transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a]"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px' }}
            whileTap={reduced ? {} : { scale: 0.95 }}
            aria-label={paused ? 'Resume log feed' : 'Pause log feed'}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
            {paused ? 'Resume' : 'Pause'}
          </motion.button>

          <motion.button
            onClick={() => setLogs([])}
            className="p-1.5 border border-[#1a2e1d] rounded text-[#6b8f72] hover:text-[#c97a7a] hover:border-[#5a1a1a] transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a]"
            whileTap={reduced ? {} : { scale: 0.95 }}
            aria-label="Clear logs"
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>

      {/* Level filters — never scrolls away */}
      <div
        className="flex gap-2 px-5 py-3 border-b border-[#1a2e1d] overflow-x-auto shrink-0"
        role="group"
        aria-label="Filter by log level"
      >
        <button
          onClick={() => setFilter('all')}
          className={[
            'px-2.5 py-1 rounded text-[11px] border transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#c9b99a]',
            filter === 'all'
              ? 'border-[#c9b99a] text-[#c9b99a] bg-[#1a2e1d]'
              : 'border-[#1a2e1d] text-[#6b8f72] hover:border-[#6b8f72]',
          ].join(' ')}
          style={{ fontFamily: 'Courier Prime, monospace' }}
          aria-pressed={filter === 'all'}
        >
          all
        </button>
        {ALL_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={[
              'px-2.5 py-1 rounded text-[11px] border transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#c9b99a]',
              filter === level
                ? 'border-current bg-[#1a2e1d]'
                : 'border-[#1a2e1d] hover:border-current',
            ].join(' ')}
            style={{ fontFamily: 'Courier Prime, monospace', color: LEVEL_COLORS[level] }}
            aria-pressed={filter === level}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Log lines — ONLY this section scrolls */}
      <div
        className="flex-1 overflow-y-auto px-5 py-3 space-y-0.5 min-h-0"
        aria-live="polite"
        aria-label="Application logs"
      >
        {loading ? (
          <div className="space-y-1.5 mt-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-4 rounded bg-[#1a2e1d] animate-pulse"
                style={{ width: `${60 + (i * 7) % 35}%` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p
            className="text-[#6b8f7244] italic mt-6 text-center"
            style={{ fontFamily: 'EB Garamond, serif', fontSize: '16px' }}
          >
            {filter === 'all' ? 'No logs yet.' : `No ${filter} logs.`}
          </p>
        ) : (
          filtered.map((log, i) => (
            <motion.div
              key={i}
              className="rounded px-2 py-1.5"
              style={{ background: LEVEL_BG[log.level] }}
              initial={reduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.15 }}
            >
              <p
                className="leading-relaxed break-all"
                style={{
                  fontFamily: 'Courier Prime, monospace',
                  fontSize: '12px',
                  color: LEVEL_COLORS[log.level],
                }}
              >
                {log.line}
              </p>
            </motion.div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Status bar — pinned to bottom of this component, not fixed */}
      <div className="shrink-0 px-5 py-2 border-t border-[#1a2e1d] bg-[#080f09] flex items-center justify-between">
        <span
          className="text-[#6b8f72]"
          style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px' }}
        >
          {filtered.length} lines · refreshing every 5s{paused ? ' · paused' : ''}
        </span>
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: paused ? '#c97a7a' : '#4ade80' }}
          animate={paused ? {} : { opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          aria-label={paused ? 'Paused' : 'Live'}
        />
      </div>
    </div>
  )
}