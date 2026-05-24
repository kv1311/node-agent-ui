import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import type { NavPage, DashboardData, ChatMessage } from '../types'
import { fetchDashboardData, sendChat } from '../lib/api'

// ── Types ────────────────────────────────────────────────────────────────────

export interface AppContextValue {
  // Nav
  activePage: NavPage
  setActivePage: (page: NavPage) => void
  sidebarExpanded: boolean
  setSidebarExpanded: (v: boolean) => void

  // Dashboard data
  data: DashboardData | null
  dataLoading: boolean
  dataError: string | null
  refreshData: () => Promise<void>

  // Chat
  messages: ChatMessage[]
  chatLoading: boolean
  sendMessage: (text: string) => Promise<void>
  chatOpen: boolean
  setChatOpen: (v: boolean) => void

  // Chat input prefill (NEW)
  inputValue: string
  setInputValue: (v: string) => void
  prefillInput: (value: string) => void

  // Server health
  serverOnline: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<NavPage>('home')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [serverOnline, setServerOnline] = useState(true)
  const healthInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // NEW: shared input state for chat
  const [inputValue, setInputValue] = useState('')

  const refreshData = useCallback(async () => {
    try {
      setDataError(null)
      const result = await fetchDashboardData()
      setData(result)
      setServerOnline(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load data'
      setDataError(msg)
      setServerOnline(false)
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshData()

    // Health ping every 30s
    healthInterval.current = setInterval(async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE ?? ''}/api/health`, {
          headers: { 'ngrok-skip-browser-warning': 'true' },
        })
        setServerOnline(true)
      } catch {
        setServerOnline(false)
      }
    }, 30_000)

    return () => {
      if (healthInterval.current) clearInterval(healthInterval.current)
    }
  }, [refreshData])

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setChatLoading(true)

      try {
        const { reply } = await sendChat(text)
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMsg])
        // Refresh dashboard after every chat action
        await refreshData()
      } catch {
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Something went wrong. Try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setChatLoading(false)
      }
    },
    [refreshData],
  )

  // NEW: convenience function that prefills and optionally opens chat
  const prefillInput = useCallback(
    (value: string) => {
      setInputValue(value)
      // The ToolsPage will also call setChatOpen(true) to open the panel,
      // but you could also do it here if you prefer.
      // setChatOpen(true)
    },
    [],
  )

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        sidebarExpanded,
        setSidebarExpanded,
        data,
        dataLoading,
        dataError,
        refreshData,
        messages,
        chatLoading,
        sendMessage,
        chatOpen,
        setChatOpen,
        inputValue,      // NEW
        setInputValue,   // NEW
        prefillInput,    // NEW
        serverOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}