import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Bell, Receipt, Calendar, Tv, BookOpen, X } from 'lucide-react'
import { API_BASE } from '../lib/api'
import { useApp } from '../context/AppContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ── Types ─────────────────────────────────────────────────────────────────────

type QuickAddType = 'task' | 'reminder' | 'bill' | 'event' | 'watchlist' | 'journal'

interface FormField {
  key: string
  label: string
  placeholder: string
  type?: 'text' | 'date' | 'time' | 'number' | 'datetime-local'
  required?: boolean
}

interface QuickAddConfig {
  type: QuickAddType
  label: string
  icon: React.ElementType
  color: string
  endpoint: string
  fields: FormField[]
  buildBody: (values: Record<string, string>) => Record<string, unknown>
}

// ── Quick add configurations ──────────────────────────────────────────────────

const CONFIGS: QuickAddConfig[] = [
  {
    type: 'task',
    label: 'Task',
    icon: CheckSquare,
    color: '#4ade80',
    endpoint: '/api/tasks',
    fields: [
      { key: 'title', label: 'What needs doing', placeholder: 'Call the dentist', required: true },
      { key: 'due_date', label: 'Due date', placeholder: '', type: 'date' },
    ],
    buildBody: (v) => ({ title: v.title, due_date: v.due_date || '' }),
  },
  {
    type: 'reminder',
    label: 'Reminder',
    icon: Bell,
    color: '#c9b99a',
    endpoint: '/api/reminders',
    fields: [
      { key: 'title', label: 'Remind me to', placeholder: 'Take medication', required: true },
      { key: 'remind_at', label: 'When', placeholder: '', type: 'datetime-local' },
    ],
    buildBody: (v) => ({ title: v.title, remind_at: v.remind_at || '' }),
  },
  {
    type: 'bill',
    label: 'Bill',
    icon: Receipt,
    color: '#c97a7a',
    endpoint: '/api/bills',
    fields: [
      { key: 'title', label: 'Bill name', placeholder: 'Electricity bill', required: true },
      { key: 'amount', label: 'Amount (₹)', placeholder: '1200', type: 'number' },
      { key: 'due_date', label: 'Due date', placeholder: '', type: 'date' },
    ],
    buildBody: (v) => ({ title: v.title, amount: parseFloat(v.amount) || 0, due_date: v.due_date || '' }),
  },
  {
    type: 'event',
    label: 'Event',
    icon: Calendar,
    color: '#7ab4c9',
    endpoint: '/api/events',
    fields: [
      { key: 'title', label: 'Event', placeholder: 'Team lunch', required: true },
      { key: 'date', label: 'Date', placeholder: '', type: 'datetime-local' },
      { key: 'notes', label: 'Notes', placeholder: 'Vasanta Bhavan' },
    ],
    buildBody: (v) => ({ title: v.title, date: v.date || '', notes: v.notes || '' }),
  },
  {
    type: 'watchlist',
    label: 'Watchlist',
    icon: Tv,
    color: '#b97ac9',
    endpoint: '/api/watchlist',
    fields: [
      { key: 'title', label: 'Title', placeholder: 'Dune Part 3', required: true },
      { key: 'type', label: 'Type', placeholder: 'movie / series / documentary' },
      { key: 'genre', label: 'Genre', placeholder: 'sci-fi' },
    ],
    buildBody: (v) => ({ title: v.title, type: v.type || 'movie', genre: v.genre || '' }),
  },
  {
    type: 'journal',
    label: 'Journal',
    icon: BookOpen,
    color: '#9ec4a4',
    endpoint: '/api/journal',
    fields: [
      { key: 'title', label: 'Title', placeholder: 'Optional title' },
      { key: 'content', label: 'Entry', placeholder: 'Write anything...', required: true },
      { key: 'mood', label: 'Mood', placeholder: 'calm, anxious, focused...' },
    ],
    buildBody: (v) => ({ title: v.title || '', content: v.content, mood: v.mood || '' }),
  },
]

// ── Individual quick add form ─────────────────────────────────────────────────

function QuickForm({
  config,
  onClose,
  onSuccess,
  reduced,
}: {
  config: QuickAddConfig
  onClose: () => void
  onSuccess: (type: QuickAddType) => void
  reduced: boolean
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const firstRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 50)
  }, [])

  const set = (key: string, val: string) => setValues(prev => ({ ...prev, [key]: val }))

  async function handleSubmit() {
    const requiredMissing = config.fields.filter(f => f.required && !values[f.key]?.trim())
    if (requiredMissing.length) {
      setError(`${requiredMissing[0].label} is required`)
      return
    }

    setBusy(true)
    setError('')
    try {
      const body = config.buildBody(values)
      const res = await fetch(`${API_BASE}${config.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      onSuccess(config.type)
      onClose()
    } catch (e) {
      setError('Could not save. Check connection.')
    } finally {
      setBusy(false)
    }
  }

  const Icon = config.icon

  return (
    <motion.div
      className="border border-[#1a2e1d] rounded-xl bg-[#0d1a10] overflow-hidden"
      initial={reduced ? {} : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? {} : { opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Form header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[#1a2e1d]"
        style={{ borderLeftWidth: '2px', borderLeftColor: config.color }}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} color={config.color} />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', color: config.color, letterSpacing: '0.08em' }}>
            NEW {config.label.toUpperCase()}
          </span>
        </div>
        <button onClick={onClose} className="text-[#6b8f72] hover:text-[#ede8df] transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Fields */}
      <div className="px-4 py-4 space-y-4">
        {config.fields.map((field, i) => {
          const isTextarea = field.key === 'content'
          return (
            <div key={field.key}>
              <label
                className="block text-[#6b8f72] mb-1.5 uppercase tracking-wider"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', letterSpacing: '0.12em' }}
              >
                {field.label}{field.required ? ' *' : ''}
              </label>
              {isTextarea ? (
                <textarea
                  ref={i === 0 ? (el) => { firstRef.current = el } : undefined}
                  value={values[field.key] ?? ''}
                  onChange={e => set(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full bg-transparent border-none outline-none text-[#ede8df] placeholder-[#6b8f7244] resize-none focus:ring-0"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
                />
              ) : (
                <input
                  ref={i === 0 ? (el) => { firstRef.current = el } : undefined}
                  type={field.type ?? 'text'}
                  value={values[field.key] ?? ''}
                  onChange={e => set(field.key, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !isTextarea) void handleSubmit() }}
                  placeholder={field.placeholder}
                  className="w-full bg-transparent border-none outline-none text-[#ede8df] placeholder-[#6b8f7244] focus:ring-0"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
                />
              )}
              <div className="h-px bg-[#1a2e1d] mt-2" />
            </div>
          )
        })}

        {error && (
          <p className="text-[#c97a7a]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px' }}>
            {error}
          </p>
        )}

        <button
          onClick={() => void handleSubmit()}
          disabled={busy}
          className="w-full py-2.5 rounded-lg transition-opacity disabled:opacity-40"
          style={{
            background: config.color + '22',
            border: `1px solid ${config.color}44`,
            color: config.color,
            fontFamily: 'Courier Prime, monospace',
            fontSize: '12px',
          }}
        >
          {busy ? 'saving...' : `save ${config.label.toLowerCase()} →`}
        </button>
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ToolsPage() {
  const [activeType, setActiveType] = useState<QuickAddType | null>(null)
  const [successType, setSuccessType] = useState<QuickAddType | null>(null)
  const { refreshData } = useApp()
  const reduced = useReducedMotion()

  const activeConfig = CONFIGS.find(c => c.type === activeType) ?? null

  function handleSuccess(type: QuickAddType) {
    setSuccessType(type)
    setTimeout(() => setSuccessType(null), 2000)
    void refreshData()
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1a2e1d] shrink-0">
        <h1
          className="text-[#c9b99a] italic"
          style={{ fontFamily: 'EB Garamond, serif', fontSize: '26px' }}
        >
          Quick Add
        </h1>
        <p
          className="text-[#6b8f72] mt-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px' }}
        >
          Direct entry — no tokens used
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5">

        {/* Success toast */}
        <AnimatePresence>
          {successType && (
            <motion.div
              className="mb-4 px-4 py-2.5 rounded-lg border border-[#2d5a34] bg-[#0a1a0d] text-[#4ade80]"
              style={{ fontFamily: 'Courier Prime, monospace', fontSize: '12px' }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              ✓ {CONFIGS.find(c => c.type === successType)?.label} saved
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type selector grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {CONFIGS.map(config => {
            const Icon = config.icon
            const isActive = activeType === config.type
            return (
              <motion.button
                key={config.type}
                onClick={() => setActiveType(isActive ? null : config.type)}
                className="flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a]"
                style={{
                  background: isActive ? config.color + '15' : '#0d1a10',
                  borderColor: isActive ? config.color + '66' : '#1a2e1d',
                }}
                whileTap={reduced ? {} : { scale: 0.96 }}
              >
                <Icon size={18} color={isActive ? config.color : '#6b8f72'} />
                <span
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    color: isActive ? config.color : '#6b8f72',
                  }}
                >
                  {config.label.toUpperCase()}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Form panel */}
        <AnimatePresence mode="wait">
          {activeConfig && (
            <QuickForm
              key={activeConfig.type}
              config={activeConfig}
              onClose={() => setActiveType(null)}
              onSuccess={handleSuccess}
              reduced={reduced}
            />
          )}
        </AnimatePresence>

        {/* Empty state hint */}
        {!activeConfig && (
          <motion.p
            className="text-center text-[#6b8f7244] italic mt-4"
            style={{ fontFamily: 'EB Garamond, serif', fontSize: '15px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Select a type above to add directly without Sia.
          </motion.p>
        )}
      </div>
    </div>
  )
}