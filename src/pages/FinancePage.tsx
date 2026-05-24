import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, CreditCard, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { fetchTransactions } from '../lib/api'
import { useApp } from '../context/AppContext'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { Transaction } from '../types'

// ── Types ─────────────────────────────────────────────────────────────────────

type FinanceTab = 'overview' | 'accounts' | 'transactions'

interface AccountNode {
  canonical_key: string
  label: string
  type: string
  metadata: string
}

// ── Small components ──────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded bg-[#1a2e1d] animate-pulse ${className}`} />
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="text-[#6b8f72] uppercase tracking-widest mb-4"
      style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', letterSpacing: '0.14em' }}
    >
      {children}
    </p>
  )
}

// ── Internal tab bar ──────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: FinanceTab; onChange: (t: FinanceTab) => void }) {
  const tabs: { id: FinanceTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'transactions', label: 'Transactions' },
  ]
  return (
    <div className="flex border-b border-[#1a2e1d] shrink-0">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="relative flex-1 py-3 transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a]"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: active === t.id ? '#c9b99a' : '#6b8f72',
          }}
        >
          {t.label.toUpperCase()}
          {active === t.id && (
            <motion.div
              layoutId="finance-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-px bg-[#c9b99a]"
            />
          )}
        </button>
      ))}
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function StatBlock({ label, amount, color, sub }: { label: string; amount: number; color?: string; sub?: string }) {
  return (
    <div className="flex-1 p-4 border-r border-[#1a2e1d] last:border-r-0">
      <SectionLabel>{label}</SectionLabel>
      <p className="leading-none" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '22px', color: color ?? '#c9b99a' }}>
        ₹{Number(amount).toLocaleString('en-IN')}
      </p>
      {sub && <p className="mt-1.5 text-[#6b8f72]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px' }}>{sub}</p>}
    </div>
  )
}

function CategoryBar({ category, total, max, index, reduced }: { category: string; total: number; max: number; index: number; reduced: boolean }) {
  const pct = max > 0 ? (total / max) * 100 : 0
  return (
    <motion.div
      className="mb-4"
      initial={reduced ? {} : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={reduced ? { duration: 0 } : { delay: index * 0.05, duration: 0.3 }}
    >
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[#ede8df]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}>{category}</span>
        <span className="text-[#6b8f72]" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}>
          ₹{Number(total).toLocaleString('en-IN')}
        </span>
      </div>
      <div className="h-px w-full bg-[#1a2e1d] overflow-hidden">
        <motion.div
          className="h-full bg-[#2d5a34]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={reduced ? { duration: 0 } : { delay: 0.2 + index * 0.05, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </motion.div>
  )
}

function MonthlyRollup({ rollups }: { rollups: { month: string; total_inflow: number; total_outflow: number }[] }) {
  if (!rollups?.length) return null
  return (
    <div className="px-5 py-4 border-b border-[#1a2e1d]">
      <SectionLabel>Monthly History</SectionLabel>
      <div className="space-y-2">
        {rollups.map((r) => {
          const net = r.total_inflow - r.total_outflow
          const label = new Date(r.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
          return (
            <div key={r.month} className="flex items-center gap-3">
              <span className="w-12 text-[#6b8f72] shrink-0" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}>{label}</span>
              <div className="flex-1 flex gap-2">
                <span className="text-[#4ade80]" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}>
                  +₹{Number(r.total_inflow).toLocaleString('en-IN')}
                </span>
                <span className="text-[#6b8f72]">·</span>
                <span className="text-[#c9b99a]" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}>
                  −₹{Number(r.total_outflow).toLocaleString('en-IN')}
                </span>
              </div>
              <span
                style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px', color: net >= 0 ? '#4ade80' : '#c97a7a' }}
              >
                {net >= 0 ? '+' : ''}₹{Number(Math.abs(net)).toLocaleString('en-IN')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OverviewTab({ data, dataLoading, reduced }: { data: any; dataLoading: boolean; reduced: boolean }) {
  const [rollups, setRollups] = useState<any[]>([])

  useEffect(() => {
    import('../lib/api').then(({ API_BASE }) => {
      fetch(`${API_BASE}/api/finance/rollups`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(r => r.json())
        .then(setRollups)
        .catch(() => {})
    })
  }, [])

  const summary = data?.finance_summary
  const inflow = summary?.totals?.find((t: any) => t.type === 'inflow')?.total ?? 0
  const outflow = summary?.totals?.find((t: any) => t.type === 'outflow')?.total ?? 0
  const net = inflow - outflow
  const maxCat = summary?.top_categories?.[0]?.total ?? 1

  const monthLabel = summary?.month
    ? new Date(summary.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      {/* Month header */}
      <div className="px-5 py-3 border-b border-[#1a2e1d]">
        <p className="text-[#6b8f72]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px' }}>{monthLabel}</p>
      </div>

      {/* Summary grid */}
      <div className="border-b border-[#1a2e1d]">
        {dataLoading ? (
          <div className="flex">{[1, 2, 3].map(i => <div key={i} className="flex-1 p-4"><Skeleton className="h-3 w-16 mb-3" /><Skeleton className="h-6 w-20" /></div>)}</div>
        ) : (
          <div className="flex">
            <StatBlock label="Inflow" amount={inflow} color="#4ade80" />
            <StatBlock label="Outflow" amount={outflow} />
            <StatBlock label="Net" amount={Math.abs(net)} color={net >= 0 ? '#4ade80' : '#c97a7a'} sub={net >= 0 ? 'surplus' : 'deficit'} />
          </div>
        )}
      </div>

      {/* Category allocation */}
      <div className="px-5 py-4 border-b border-[#1a2e1d]">
        <SectionLabel>Allocation</SectionLabel>
        {dataLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-full" />)}</div>
        ) : !summary?.top_categories?.length ? (
          <p className="text-[#6b8f7255] italic" style={{ fontFamily: 'EB Garamond, serif', fontSize: '15px' }}>Nothing logged this month.</p>
        ) : (
          summary.top_categories.map((c: any, i: number) => (
            <CategoryBar key={c.category} category={c.category} total={c.total} max={maxCat} index={i} reduced={reduced} />
          ))
        )}
      </div>

      {/* Monthly rollups */}
      <MonthlyRollup rollups={rollups} />
    </div>
  )
}

// ── Accounts tab ──────────────────────────────────────────────────────────────

function AccountCard({ node }: { node: AccountNode }) {
  const meta = (() => { try { return JSON.parse(node.metadata || '{}') } catch { return {} } })()
  const isCredit = node.type === 'finance' && node.canonical_key.includes('credit')
  const isLoan   = node.type === 'finance' && node.canonical_key.includes('loan')
  const isLiquid = node.type === 'finance' && (node.canonical_key.includes('liquid') || node.canonical_key.includes('fund') || node.canonical_key.includes('invest'))

  const icon = isCredit ? CreditCard : isLoan ? ArrowUpRight : isLiquid ? TrendingUp : Wallet
  const Icon = icon

  const fields = Object.entries(meta).filter(([k]) => !['updated_at'].includes(k))

  return (
    <div className="border border-[#1a2e1d] rounded-lg p-4 bg-[#0d1a10] mb-3">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded border border-[#1a2e1d] flex items-center justify-center shrink-0">
          <Icon size={14} color="#6b8f72" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#ede8df] leading-snug" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}>
            {node.label}
          </p>
          <p className="text-[#6b8f72] mt-0.5 uppercase tracking-wider" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px' }}>
            {node.type} · {node.canonical_key.split(':').slice(0, 2).join(':')}
          </p>
        </div>
      </div>
      {fields.length > 0 && (
        <table className="w-full">
          <tbody>
            {fields.map(([k, v]) => (
              <tr key={k}>
                <td className="py-0.5 pr-3 text-[#6b8f72]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px' }}>
                  {k.replace(/_/g, ' ')}
                </td>
                <td className="py-0.5 text-[#c9b99a]" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}>
                  {typeof v === 'number' ? `₹${Number(v).toLocaleString('en-IN')}` : String(v)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function AccountsTab({ data, dataLoading }: { data: any; dataLoading: boolean }) {
  const financeNodes: AccountNode[] = (data?.memory ?? []).filter(
    (n: AccountNode) => ['finance', 'account', 'credit_card', 'loan', 'investment'].includes(n.type)
  )

  return (
    <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
      <SectionLabel>Accounts & Assets</SectionLabel>
      {dataLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : financeNodes.length === 0 ? (
        <div className="text-center mt-8">
          <p className="text-[#6b8f7255] italic" style={{ fontFamily: 'EB Garamond, serif', fontSize: '16px' }}>
            No accounts saved yet.
          </p>
          <p className="text-[#6b8f7255] mt-2" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px' }}>
            Tell Sia about your accounts and they'll appear here.
          </p>
        </div>
      ) : (
        financeNodes.map(n => <AccountCard key={n.canonical_key} node={n} />)
      )}
    </div>
  )
}

// ── Transactions tab ───────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: Transaction }) {
  const [expanded, setExpanded] = useState(false)
  const isInflow = tx.type === 'inflow'
  const date = tx.date ? tx.date.split('T')[0] : '—'

  return (
    <motion.div layout className="border-b border-[#1a2e1d] last:border-0 cursor-pointer" onClick={() => setExpanded(e => !e)}>
      <div className="flex items-start justify-between py-3 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: isInflow ? '#0a2e12' : '#1a0a0a' }}>
            {isInflow
              ? <ArrowDownRight size={10} color="#4ade80" />
              : <ArrowUpRight size={10} color="#c97a7a" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-[#ede8df] truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}>{tx.description}</p>
            <p className="text-[#6b8f72] mt-0.5" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px' }}>
              {date} · {tx.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span style={{ fontFamily: 'Courier Prime, monospace', fontSize: '13px', color: isInflow ? '#4ade80' : '#c9b99a' }}>
            {isInflow ? '+' : '−'}₹{Number(tx.amount).toLocaleString('en-IN')}
          </span>
          {expanded ? <ChevronUp size={12} className="text-[#6b8f72]" /> : <ChevronDown size={12} className="text-[#6b8f72]" />}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="pb-3 px-3 rounded bg-[#080f09] mb-2 border border-[#1a2e1d]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
          >
            <table className="w-full">
              <tbody>
                {[['Account', tx.account_source || '—'], ['Type', tx.type], ['Date', tx.date || '—']].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-1 pr-4 text-[#6b8f72]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px' }}>{k}</td>
                    <td className="py-1 text-[#ede8df]" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchTransactions(50, month || undefined)
      setTransactions(data as unknown as Transaction[])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => { void load() }, [load])

  // Get unique months from transactions for filter
  const months = [...new Set(transactions.map(tx => tx.date?.slice(0, 7)).filter(Boolean))]

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      {/* Month filter */}
      <div className="px-5 py-3 border-b border-[#1a2e1d] flex gap-2 overflow-x-auto shrink-0">
        <button
          onClick={() => setMonth('')}
          className={`px-2.5 py-1 rounded text-[11px] border shrink-0 transition-colors ${!month ? 'border-[#c9b99a] text-[#c9b99a]' : 'border-[#1a2e1d] text-[#6b8f72]'}`}
          style={{ fontFamily: 'Courier Prime, monospace' }}
        >
          all
        </button>
        {months.map(m => (
          <button
            key={m}
            onClick={() => setMonth(m!)}
            className={`px-2.5 py-1 rounded text-[11px] border shrink-0 transition-colors ${month === m ? 'border-[#c9b99a] text-[#c9b99a]' : 'border-[#1a2e1d] text-[#6b8f72]'}`}
            style={{ fontFamily: 'Courier Prime, monospace' }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="px-5 py-2">
        {loading ? (
          <div className="space-y-4 mt-2">{[1, 2, 3, 4, 5].map(i => <div key={i}><Skeleton className="h-4 w-2/3 mb-1.5" /><Skeleton className="h-3 w-1/3" /></div>)}</div>
        ) : transactions.length === 0 ? (
          <p className="text-[#6b8f7255] italic text-center mt-8" style={{ fontFamily: 'EB Garamond, serif', fontSize: '15px' }}>No transactions found.</p>
        ) : (
          transactions.map(tx => <TxRow key={tx.id} tx={tx} />)
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function FinancePage() {
  const { data, dataLoading, sendMessage, setChatOpen } = useApp()
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview')
  const [logInput, setLogInput] = useState('')
  const [logOpen, setLogOpen] = useState(false)
  const [logBusy, setLogBusy] = useState(false)
  const reduced = useReducedMotion()

  async function handleLog() {
    if (!logInput.trim()) return
    setLogBusy(true)
    setChatOpen(true)
    await sendMessage(logInput)
    setLogInput('')
    setLogOpen(false)
    setLogBusy(false)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="px-5 py-4 border-b border-[#1a2e1d] shrink-0">
        <h1 className="text-[#c9b99a] italic" style={{ fontFamily: 'EB Garamond, serif', fontSize: '26px' }}>
          Ledger
        </h1>
      </div>

      {/* Internal tab bar */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Tab content — only this scrolls */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="flex-1 flex flex-col min-h-0"
          initial={reduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? {} : { opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'overview'      && <OverviewTab data={data} dataLoading={dataLoading} reduced={reduced} />}
          {activeTab === 'accounts'     && <AccountsTab data={data} dataLoading={dataLoading} />}
          {activeTab === 'transactions' && <TransactionsTab />}
        </motion.div>
      </AnimatePresence>

      {/* Quick log FAB */}
      <div className="absolute bottom-16 right-4 z-30 flex flex-col items-end gap-2">
        <AnimatePresence>
          {logOpen && (
            <motion.div
              className="w-72 bg-[#0d1a10]/95 backdrop-blur-xl border border-[#1a2e1d] rounded-lg p-4 shadow-2xl"
              initial={reduced ? {} : { opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? {} : { opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-[#6b8f72] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', letterSpacing: '0.1em' }}>
                TELL SIA WHAT YOU SPENT
              </p>
              <input
                value={logInput}
                onChange={e => setLogInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void handleLog(); if (e.key === 'Escape') setLogOpen(false) }}
                placeholder="₹450 lunch at Vasanta Bhavan..."
                className="w-full bg-transparent border-none outline-none text-[#ede8df] placeholder-[#6b8f7244] focus:ring-0"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
                autoFocus
              />
              <button
                onClick={() => void handleLog()}
                disabled={logBusy || !logInput.trim()}
                className="mt-3 w-full py-2 rounded bg-[#2d5a34] text-[#c9b99a] disabled:opacity-40 transition-opacity"
                style={{ fontFamily: 'Courier Prime, monospace', fontSize: '12px' }}
              >
                {logBusy ? 'sending to Sia...' : 'log →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setLogOpen(o => !o)}
          className="px-4 py-2.5 rounded-lg bg-[#0d1a10]/95 backdrop-blur-xl border border-[#1a2e1d] text-[#c9b99a] hover:border-[#2d5a34] transition-colors"
          style={{ fontFamily: 'Courier Prime, monospace', fontSize: '13px' }}
          whileTap={reduced ? {} : { scale: 0.95 }}
        >
          {logOpen ? '✕ close' : '+ log'}
        </motion.button>
      </div>
    </div>
  )
}