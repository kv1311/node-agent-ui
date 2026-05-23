// ── Domain types ────────────────────────────────────────────────────────────

export interface Task {
  id: string
  title: string
  due_date: string
  done: 0 | 1 | boolean
  created_at: string
}

export interface Reminder {
  id: string
  title: string
  remind_at: string
  done: 0 | 1 | boolean
}

export interface Bill {
  id: string
  title: string
  amount: number
  due_date: string
  paid: 0 | 1 | boolean
}

export interface Event {
  id: string
  title: string
  date: string
  notes: string
}

export interface WatchlistItem {
  id: string
  title: string
  type: 'movie' | 'series' | 'documentary'
  genre: string
  watched: 0 | 1 | boolean
}

export interface MemoryNode {
  canonical_key: string
  label: string
  type: string
  updated_at: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: 'inflow' | 'outflow'
  account_source: string
}

export interface FinanceSummary {
  month: string
  totals: Array<{ type: string; total: number }>
  top_categories: Array<{ category: string; total: number }>
}

export interface DashboardData {
  tasks: Task[]
  reminders: Reminder[]
  bills: Bill[]
  events: Event[]
  watchlist: WatchlistItem[]
  memory: MemoryNode[]
  finance_summary: FinanceSummary
}

export interface AdminStats {
  system: {
    cpu_percent: number
    ram_used_mb: number
    ram_total_mb: number
    ram_percent: number
    disk: { used: string; total: string; percent: string }
    node_uptime_s: number
  }
  database: {
    transactions: number
    memory_nodes: number
    conversations: number
    size: string
  }
  pm2: {
    name: string
    status: string
    restarts: number
    memory_mb: number
  } | null
  logs: string[]
}

export interface LogLine {
  line: string
  level: 'info' | 'warn' | 'error' | 'cron' | 'agent' | 'tool'
}

export interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string
  tags: string
  created_at: string
}

export interface ArtWork {
  primaryImage: string
  title: string
  artistDisplayName: string
  objectDate: string
  culture: string
  period: string
  objectID: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ── Nav types ────────────────────────────────────────────────────────────────

export type NavPage =
  | 'home'
  | 'finance'
  | 'journal'
  | 'tools'
  | 'logs'
  | 'admin'
  | 'settings'
