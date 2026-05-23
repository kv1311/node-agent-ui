import type {
  DashboardData,
  AdminStats,
  LogLine,
  JournalEntry,
  ArtWork,
} from '../types'

export const API_BASE = import.meta.env.VITE_API_BASE ?? ''

const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
}

// ── Session ID ───────────────────────────────────────────────────────────────

export function getSessionId(): string {
  let sid = sessionStorage.getItem('sia_session')
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem('sia_session', sid)
  }
  return sid
}

// ── Generic fetch wrapper ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...BASE_HEADERS, ...(init?.headers ?? {}) },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

// ── Dashboard data (single load) ─────────────────────────────────────────────

export async function fetchDashboardData(): Promise<DashboardData> {
  return apiFetch<DashboardData>('/api/data')
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function sendChat(message: string): Promise<{ reply: string }> {
  return apiFetch<{ reply: string }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, session_id: getSessionId() }),
  })
}

// ── Finance ──────────────────────────────────────────────────────────────────

export async function fetchTransactions(
  limit = 30,
  month?: string,
): Promise<DashboardData['bills']> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (month) params.set('month', month)
  return apiFetch(`/api/finance/transactions?${params}`)
}

// ── Journal ──────────────────────────────────────────────────────────────────

export async function fetchJournal(
  limit = 30,
  keyword?: string,
): Promise<JournalEntry[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (keyword) params.set('keyword', keyword)
  return apiFetch(`/api/journal?${params}`)
}

export async function fetchJournalEntry(id: string): Promise<JournalEntry> {
  return apiFetch(`/api/journal/${id}`)
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await apiFetch(`/api/journal/${id}`, { method: 'DELETE' })
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function fetchAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/api/admin/stats')
}

export async function fetchLogs(lines = 100): Promise<LogLine[]> {
  return apiFetch<LogLine[]>(`/api/logs?lines=${lines}`)
}

export async function fetchHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>('/api/health')
}

// ── Met Museum Art ────────────────────────────────────────────────────────────

const ART_CACHE_KEY = 'sia_art_cache'
const ART_CACHE_TTL = 1000 * 60 * 60 * 6 // 6 hours

interface ArtCache {
  art: ArtWork
  timestamp: number
}

export async function fetchRandomArt(): Promise<ArtWork | null> {
  try {
    // Check sessionStorage cache
    const cached = sessionStorage.getItem(ART_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached) as ArtCache
      if (Date.now() - parsed.timestamp < ART_CACHE_TTL) {
        return parsed.art
      }
    }

    const searchRes = await fetch(
      'https://collectionapi.metmuseum.org/public/collection/v1/search?q=medieval&isPublicDomain=true',
    )
    const searchData = (await searchRes.json()) as { objectIDs: number[] }
    if (!searchData.objectIDs?.length) return null

    // Try up to 5 random objects to find one with an image
    for (let i = 0; i < 5; i++) {
      const randomId =
        searchData.objectIDs[
          Math.floor(Math.random() * Math.min(searchData.objectIDs.length, 200))
        ]
      const objRes = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomId}`,
      )
      const obj = (await objRes.json()) as ArtWork & { objectID: number }
      if (obj.primaryImage) {
        const art: ArtWork = {
          primaryImage: obj.primaryImage,
          title: obj.title,
          artistDisplayName: obj.artistDisplayName,
          objectDate: obj.objectDate,
          culture: obj.culture,
          period: obj.period,
          objectID: obj.objectID,
        }
        sessionStorage.setItem(
          ART_CACHE_KEY,
          JSON.stringify({ art, timestamp: Date.now() }),
        )
        return art
      }
    }
    return null
  } catch {
    return null
  }
}
