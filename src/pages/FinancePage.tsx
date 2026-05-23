import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { fetchTransactions } from '../lib/api'
import { useApp } from '../context/AppContext'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { Transaction } from '../types'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded bg-[#1a2e1d] animate-pulse ${className}`} />
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="text-[#6b8f72] uppercase tracking-widest mb-4"
      style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '10px',
        letterSpacing: '0.14em',
      }}
    >
      {children}
    </p>
  )
}

function StatBlock({
  label,
  amount,
  color,
  sub,
}: {
  label: string
  amount: number
  color?: string
  sub?: string
}) {
  return (
    <div className="flex-1 p-5 border-r border-[#1a2e1d] last:border-r-0">
      <SectionLabel>{label}</SectionLabel>
      <p
        className="leading-none"
        style={{
          fontFamily: 'Courier Prime, monospace',
          fontSize: '26px',
          color: color ?? '#c9b99a',
        }}
      >
        ₹{Number(amount).toLocaleString('en-IN')}
      </p>
      {sub && (
        <p
          className="mt-2 text-[#6b8f72]"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px' }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}

function CategoryBar({
  category,
  total,
  max,
  index,
  reduced,
}: {
  category: string
  total: number
  max: number
  index: number
  reduced: boolean
}) {
  const pct = max > 0 ? (total / max) * 100 : 0

  return (
    <motion.div
      className="mb-5"
      initial={reduced ? {} : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        reduced ? { duration: 0 } : { delay: index * 0.05, duration: 0.3, ease: 'easeOut' }
      }
    >
      <div className="flex justify-between items-baseline mb-2">
        <span
          className="text-[#ede8df]"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
        >
          {category}
        </span>
        <span
          className="text-[#6b8f72]"
          style={{ fontFamily: 'Courier Prime, monospace', fontSize: '12px' }}
        >
          ₹{Number(total).toLocaleString('en-IN')}
        </span>
      </div>
      <div className="h-px w-full bg-[#1a2e1d] overflow-hidden">
        <motion.div
          className="h-full bg-[#2d5a34]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            reduced
              ? { duration: 0 }
              : { delay: 0.2 + index * 0.05, duration: 0.7, ease: [0.4, 0, 0.2, 1] }
          }
        />
      </div>
    </motion.div>
  )
}

function TxRow({ tx }: { tx: Transaction }) {
  const [expanded, setExpanded] = useState(false)
  const isInflow = tx.type === 'inflow'
  const date = tx.date ? tx.date.split('T')[0] : '—'

  return (
    <motion.div
      layout
      className="border-b border-[#1a2e1d] last:border-0 cursor-pointer"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start justify-between py-3 gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-[#ede8df] leading-snug truncate"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
          >
            {tx.description}
          </p>
          <p
            className="text-[#6b8f72] mt-0.5"
            style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}
          >
            {date} · {tx.category}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            style={{
              fontFamily: 'Courier Prime, monospace',
              fontSize: '14px',
              color: isInflow ? '#4ade80' : '#c9b99a',
            }}
          >
            {isInflow ? '+' : '−'}₹{Number(tx.amount).toLocaleString('en-IN')}
          </span>
          {expanded ? (
            <ChevronUp size={13} className="text-[#6b8f72]" />
          ) : (
            <ChevronDown size={13} className="text-[#6b8f72]" />
          )}
        </div>
      </div>

      {expanded && (
        <motion.div
          className="pb-3 px-3 rounded bg-[#080f09] mb-2 border border-[#1a2e1d]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <table className="w-full">
            <tbody>
              {[
                ['Account', tx.account_source || '—'],
                ['Type', tx.type],
                ['Full date', tx.date || '—'],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td
                    className="py-1 pr-4 text-[#6b8f72]"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '12px',
                    }}
                  >
                    {k}
                  </td>
                  <td
                    className="py-1 text-[#ede8df]"
                    style={{
                      fontFamily: 'Courier Prime, monospace',
                      fontSize: '12px',
                    }}
                  >
                    {v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  )
}

export function FinancePage() {
  const { data, dataLoading, sendMessage } = useApp()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [logInput, setLogInput] = useState('')
  const [logOpen, setLogOpen] = useState(false)
  const [logBusy, setLogBusy] = useState(false)
  const reduced = useReducedMotion()

  const loadTx = useCallback(async () => {
    try {
      const data = await fetchTransactions(30)
      setTransactions(data as unknown as Transaction[])
    } catch {
      // silently fail
    } finally {
      setTxLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTx()
  }, [loadTx])

  async function handleLog() {
    if (!logInput.trim()) return
    setLogBusy(true)
    await sendMessage(logInput)
    setLogInput('')
    setLogOpen(false)
    setLogBusy(false)
    void loadTx()
  }

  const summary = data?.finance_summary
  const inflow =
    summary?.totals?.find((t) => t.type === 'inflow')?.total ?? 0
  const outflow =
    summary?.totals?.find((t) => t.type === 'outflow')?.total ?? 0
  const net = inflow - outflow
  const maxCat = summary?.top_categories?.[0]?.total ?? 1

  const monthLabel = summary?.month
    ? new Date(summary.month + '-01').toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <div className="min-h-screen pb-24 px-0">
      {/* Page header */}
      <div className="px-5 py-5 border-b border-[#1a2e1d]">
        <h1
          className="text-[#c9b99a] italic"
          style={{ fontFamily: 'EB Garamond, serif', fontSize: '26px' }}
        >
          Financial Ledger
        </h1>
        <p
          className="text-[#6b8f72] mt-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}
        >
          {monthLabel}
        </p>
      </div>

      {/* Summary grid */}
      <div className="border-b border-[#1a2e1d]">
        {dataLoading ? (
          <div className="flex">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 p-5">
                <Skeleton className="h-3 w-16 mb-4" />
                <Skeleton className="h-7 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex">
            <StatBlock label="Inflow" amount={inflow} color="#4ade80" />
            <StatBlock label="Outflow" amount={outflow} />
            <StatBlock
              label="Net"
              amount={Math.abs(net)}
              color={net >= 0 ? '#4ade80' : '#c97a7a'}
              sub={net >= 0 ? 'surplus' : 'deficit'}
            />
          </div>
        )}
      </div>

      {/* Allocation */}
      <div className="px-5 py-5 border-b border-[#1a2e1d]">
        <SectionLabel>Allocation</SectionLabel>
        {dataLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : !summary?.top_categories?.length ? (
          <p
            className="text-[#6b8f7255] italic"
            style={{ fontFamily: 'EB Garamond, serif', fontSize: '16px' }}
          >
            Nothing logged this month.
          </p>
        ) : (
          summary.top_categories.map((c, i) => (
            <CategoryBar
              key={c.category}
              category={c.category}
              total={c.total}
              max={maxCat}
              index={i}
              reduced={reduced}
            />
          ))
        )}
      </div>

      {/* Transactions */}
      <div className="px-5 py-5">
        <SectionLabel>Recent</SectionLabel>
        {txLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-2/3 mb-1.5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p
            className="text-[#6b8f7255] italic"
            style={{ fontFamily: 'EB Garamond, serif', fontSize: '16px' }}
          >
            No transactions yet.
          </p>
        ) : (
          transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)
        )}
      </div>

      {/* Quick log */}
      <div className="fixed bottom-16 right-4 z-30 flex flex-col items-end gap-2">
        {logOpen && (
          <motion.div
            className="w-72 bg-[#0d1a10]/90 backdrop-blur-xl border border-[#1a2e1d] rounded-lg p-4 shadow-2xl"
            initial={reduced ? {} : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
          >
            <input
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleLog()
                if (e.key === 'Escape') setLogOpen(false)
              }}
              placeholder="tell Sia what you spent..."
              className="w-full bg-transparent border-none outline-none text-[#ede8df] placeholder-[#6b8f7266] focus:ring-0"
              style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
              autoFocus
              aria-label="Log a transaction"
            />
            <button
              onClick={() => void handleLog()}
              disabled={logBusy || !logInput.trim()}
              className="mt-3 w-full py-2 rounded bg-[#2d5a34] text-[#c9b99a] disabled:opacity-40 transition-opacity focus-visible:ring-2 focus-visible:ring-[#c9b99a]"
              style={{ fontFamily: 'Courier Prime, monospace', fontSize: '12px' }}
            >
              {logBusy ? 'thinking...' : 'log →'}
            </button>
          </motion.div>
        )}

        <motion.button
          onClick={() => setLogOpen((o) => !o)}
          className="px-4 py-2.5 rounded-lg bg-[#0d1a10]/90 backdrop-blur-xl border border-[#1a2e1d] text-[#c9b99a] hover:border-[#2d5a34] transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a]"
          style={{ fontFamily: 'Courier Prime, monospace', fontSize: '13px' }}
          whileTap={reduced ? {} : { scale: 0.95 }}
          aria-label={logOpen ? 'Close log' : 'Log transaction'}
        >
          {logOpen ? '✕ close' : '+ log'}
        </motion.button>
      </div>
    </div>
  )
}
