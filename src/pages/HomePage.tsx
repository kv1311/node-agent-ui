import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { ArtHeader } from '../components/ArtHeader'
import {
  CheckSquare,
  Bell,
  Receipt,
  Calendar,
  Film,
  Brain,
  type LucideIcon,
} from 'lucide-react'

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded bg-[#1a2e1d] animate-pulse ${className}`}
      aria-hidden="true"
    />
  )
}

interface CardProps {
  label: string
  icon: LucideIcon
  count?: number
  children: React.ReactNode
  reduced: boolean
  index: number
}

function Card({ label, icon: Icon, count, children, reduced, index }: CardProps) {
  return (
    <motion.div
      className="bg-[#0d1a10] border border-[#1a2e1d] rounded-lg p-5 flex flex-col gap-3 hover:border-[#2d5a34] transition-colors duration-300"
      initial={reduced ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { delay: index * 0.06, duration: 0.3, ease: 'easeOut' }
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} strokeWidth={1.5} className="text-[#6b8f72]" />
          <span
            className="text-[#6b8f72] uppercase tracking-widest"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.14em',
            }}
          >
            {label}
          </span>
        </div>
        {count !== undefined && (
          <span
            className="text-[#6b8f72]"
            style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}
          >
            {count}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <p
      className="text-[#6b8f7255] italic"
      style={{ fontFamily: 'EB Garamond, serif', fontSize: '15px' }}
    >
      {text}
    </p>
  )
}

function Row({
  title,
  meta,
  done,
  onToggle,
}: {
  title: string
  meta?: string
  done?: boolean
  onToggle?: () => void
}) {
  const { sendMessage } = useApp()

  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-[#1a2e1d22] last:border-0">
      {onToggle && (
        <button
          onClick={() => void sendMessage(`mark "${title}" as done`)}
          className={[
            'mt-0.5 w-4 h-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a]',
            done
              ? 'bg-[#2d5a34] border-[#2d5a34]'
              : 'border-[#1a2e1d] hover:border-[#6b8f72]',
          ].join(' ')}
          aria-label={done ? `${title} — done` : `Mark ${title} as done`}
        >
          {done && (
            <svg
              viewBox="0 0 10 10"
              className="w-2.5 h-2.5 text-[#c9b99a]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M1.5 5L4 7.5L8.5 2.5" />
            </svg>
          )}
        </button>
      )}
      <div className="flex-1 min-w-0">
        <p
          className={[
            'leading-snug',
            done ? 'text-[#6b8f72] line-through' : 'text-[#ede8df]',
          ].join(' ')}
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
        >
          {title}
        </p>
        {meta && (
          <p
            className="text-[#6b8f72] mt-0.5"
            style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}
          >
            {meta}
          </p>
        )}
      </div>
    </div>
  )
}

export function HomePage() {
  const { data, dataLoading } = useApp()
  const reduced = useReducedMotion()

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const pendingTasks = (data?.tasks ?? []).filter((t) => !t.done)
  const pendingBills = (data?.bills ?? []).filter((b) => !b.paid)
  const pendingReminders = (data?.reminders ?? []).filter((r) => !r.done)
  const upcomingEvents = data?.events ?? []
  const unwatched = (data?.watchlist ?? []).filter((w) => !w.watched)
  const memories = data?.memory ?? []

  return (
    <div className="flex flex-col min-h-screen">
      <ArtHeader />

      {/* Greeting */}
      <div className="px-5 py-4 border-b border-[#1a2e1d]">
        <motion.p
          className="text-[#c9b99a] italic leading-relaxed"
          style={{ fontFamily: 'EB Garamond, serif', fontSize: '20px' }}
          initial={reduced ? {} : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
        >
          {dataLoading ? 'Loading your day...' : `${today}.`}
        </motion.p>
        {!dataLoading && pendingTasks.length > 0 && (
          <motion.p
            className="text-[#6b8f72] mt-1"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { delay: 0.2, duration: 0.3 }}
          >
            {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} pending
            {pendingBills.length > 0
              ? `. ${pendingBills.length} bill${pendingBills.length !== 1 ? 's' : ''} unpaid.`
              : '.'}
          </motion.p>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 px-4 py-4 pb-20 grid grid-cols-1 gap-3">
        <Card label="Tasks" icon={CheckSquare} count={pendingTasks.length} reduced={reduced} index={0}>
          {dataLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : pendingTasks.length === 0 ? (
            <Empty text="Nothing pending. Rare." />
          ) : (
            <div>
              {pendingTasks.slice(0, 4).map((t) => (
                <Row key={t.id} title={t.title} meta={t.due_date || undefined} done={!!t.done} onToggle={() => {}} />
              ))}
            </div>
          )}
        </Card>

        <Card label="Reminders" icon={Bell} count={pendingReminders.length} reduced={reduced} index={1}>
          {dataLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : pendingReminders.length === 0 ? (
            <Empty text="Clear for now." />
          ) : (
            <div>
              {pendingReminders.slice(0, 3).map((r) => (
                <Row key={r.id} title={r.title} meta={r.remind_at || undefined} done={!!r.done} onToggle={() => {}} />
              ))}
            </div>
          )}
        </Card>

        <Card label="Bills" icon={Receipt} count={pendingBills.length} reduced={reduced} index={2}>
          {dataLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : pendingBills.length === 0 ? (
            <Empty text="All settled." />
          ) : (
            <div>
              {pendingBills.slice(0, 3).map((b) => (
                <Row
                  key={b.id}
                  title={b.title}
                  meta={`₹${Number(b.amount).toLocaleString('en-IN')} · ${b.due_date || 'no date'}`}
                  onToggle={() => {}}
                />
              ))}
            </div>
          )}
        </Card>

        <Card label="Events" icon={Calendar} count={upcomingEvents.length} reduced={reduced} index={3}>
          {dataLoading ? (
            <Skeleton className="h-4 w-2/3" />
          ) : upcomingEvents.length === 0 ? (
            <Empty text="Nothing on the horizon." />
          ) : (
            <div>
              {upcomingEvents.slice(0, 3).map((e) => (
                <Row key={e.id} title={e.title} meta={e.date || undefined} />
              ))}
            </div>
          )}
        </Card>

        <Card label="Watchlist" icon={Film} count={unwatched.length} reduced={reduced} index={4}>
          {dataLoading ? (
            <Skeleton className="h-4 w-1/2" />
          ) : unwatched.length === 0 ? (
            <Empty text="Queue is empty." />
          ) : (
            <div>
              {unwatched.slice(0, 3).map((w) => (
                <Row
                  key={w.id}
                  title={w.title}
                  meta={`${w.type}${w.genre ? ` · ${w.genre}` : ''}`}
                  onToggle={() => {}}
                />
              ))}
            </div>
          )}
        </Card>

        <Card label="Memory" icon={Brain} count={memories.length} reduced={reduced} index={5}>
          {dataLoading ? (
            <Skeleton className="h-4 w-3/4" />
          ) : memories.length === 0 ? (
            <Empty text="Nothing stored yet." />
          ) : (
            <div>
              {memories.slice(0, 4).map((m) => (
                <Row key={m.canonical_key} title={m.label} meta={m.type} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}