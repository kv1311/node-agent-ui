import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { fetchAdminStats } from '../lib/api'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { AdminStats } from '../types'

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

function GaugeBar({
  label,
  percent,
  sublabel,
  index,
  reduced,
}: {
  label: string
  percent: number
  sublabel?: string
  index: number
  reduced: boolean
}) {
  const color =
    percent > 85 ? '#c97a7a' : percent > 65 ? '#c9b97a' : '#2d5a34'

  return (
    <motion.div
      className="mb-5"
      initial={reduced ? {} : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { delay: index * 0.06, duration: 0.3, ease: 'easeOut' }
      }
    >
      <div className="flex justify-between items-baseline mb-2">
        <span
          className="text-[#ede8df]"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'Courier Prime, monospace',
            fontSize: '13px',
            color,
          }}
        >
          {percent}%{sublabel ? ` · ${sublabel}` : ''}
        </span>
      </div>
      <div className="h-px w-full bg-[#1a2e1d] overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={
            reduced
              ? { duration: 0 }
              : { delay: 0.2 + index * 0.06, duration: 0.8, ease: [0.4, 0, 0.2, 1] }
          }
        />
      </div>
    </motion.div>
  )
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#1a2e1d22] last:border-0">
      <span
        className="text-[#6b8f72]"
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
      >
        {label}
      </span>
      <span
        className="text-[#c9b99a]"
        style={{ fontFamily: 'Courier Prime, monospace', fontSize: '13px' }}
      >
        {value}
      </span>
    </div>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-5 border-b border-[#1a2e1d]">{children}</div>
  )
}

function formatUptime(s: number) {
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const reduced = useReducedMotion()

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminStats()
      setStats(data)
      setError(false)
      setLastUpdated(new Date().toLocaleTimeString('en-IN'))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const interval = setInterval(() => void load(), 10_000)
    return () => clearInterval(interval)
  }, [load])

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 py-5 border-b border-[#1a2e1d] flex items-baseline justify-between">
        <h1
          className="text-[#c9b99a] italic"
          style={{ fontFamily: 'EB Garamond, serif', fontSize: '26px' }}
        >
          Admin
        </h1>
        {lastUpdated && (
          <span
            className="text-[#6b8f7255]"
            style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}
          >
            {lastUpdated}
          </span>
        )}
      </div>

      {loading && (
        <Section>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-px w-full" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {error && !loading && (
        <Section>
          <p
            className="text-[#c97a7a]"
            style={{
              fontFamily: 'Courier Prime, monospace',
              fontSize: '13px',
            }}
          >
            Could not reach server. Retrying every 10s.
          </p>
        </Section>
      )}

      {stats && (
        <>
          {/* System */}
          <Section>
            <SectionLabel>System</SectionLabel>
            <GaugeBar
              label="CPU"
              percent={stats.system.cpu_percent}
              index={0}
              reduced={reduced}
            />
            <GaugeBar
              label="RAM"
              percent={stats.system.ram_percent}
              sublabel={`${stats.system.ram_used_mb} / ${stats.system.ram_total_mb} MB`}
              index={1}
              reduced={reduced}
            />
            <StatRow
              label="Disk"
              value={`${stats.system.disk.used} / ${stats.system.disk.total} (${stats.system.disk.percent})`}
            />
            <StatRow
              label="Uptime"
              value={formatUptime(stats.system.node_uptime_s)}
            />
          </Section>

          {/* Process */}
          {stats.pm2 && (
            <Section>
              <SectionLabel>Process</SectionLabel>
              <StatRow label="Name" value={stats.pm2.name} />
              <StatRow
                label="Status"
                value={stats.pm2.status}
              />
              <StatRow label="Restarts" value={stats.pm2.restarts} />
              <StatRow label="Memory" value={`${stats.pm2.memory_mb} MB`} />
            </Section>
          )}

          {/* Database */}
          <Section>
            <SectionLabel>Database</SectionLabel>
            <StatRow
              label="Transactions"
              value={stats.database.transactions}
            />
            <StatRow
              label="Memory nodes"
              value={stats.database.memory_nodes}
            />
            <StatRow
              label="Conversations"
              value={stats.database.conversations}
            />
            <StatRow label="Size" value={stats.database.size} />
          </Section>
        </>
      )}
    </div>
  )
}
