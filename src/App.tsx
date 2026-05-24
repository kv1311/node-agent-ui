import { lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext'
import { Sidebar } from './components/Sidebar'
import { ChatBar } from './components/ChatBar'
import { useReducedMotion } from './hooks/useReducedMotion'
import { ToolsPage } from './pages/ToolsPage'

// Lazy load pages
const HomePage    = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const FinancePage = lazy(() => import('./pages/FinancePage').then(m => ({ default: m.FinancePage })))
const JournalPage = lazy(() => import('./pages/JournalPage').then(m => ({ default: m.JournalPage })))
const LogsPage    = lazy(() => import('./pages/LogsPage').then(m => ({ default: m.LogsPage })))
const AdminPage   = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-1.5 h-1.5 rounded-full bg-[#6b8f72] animate-pulse" />
    </div>
  )
}

function PageContent() {
  const { activePage } = useApp()
  const reduced = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePage}
        initial={reduced ? {} : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? {} : { opacity: 0, y: -6 }}
        transition={reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
        className="flex-1 min-h-0"
      >
        <Suspense fallback={<PageFallback />}>
          {activePage === 'home'    && <HomePage />}
          {activePage === 'finance' && <FinancePage />}
          {activePage === 'journal' && <JournalPage />}
          {activePage === 'logs'    && <LogsPage />}
          {activePage === 'admin'   && <AdminPage />}
          {activePage === 'tools'   && <ToolsPage />}
          {activePage === 'settings' && (
            <div className="px-5 py-8">
              <p
                className="text-[#c9b99a] italic"
                style={{ fontFamily: 'EB Garamond, serif', fontSize: '22px' }}
              >
                Settings
              </p>
              <p
                className="text-[#6b8f72] mt-3"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
              >
                Coming soon.
              </p>
            </div>
          )}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080f09]">
      <Sidebar />

      {/* Main content — offset by sidebar collapsed width */}
      <main
        className="flex flex-col flex-1 overflow-y-auto"
        style={{ marginLeft: '52px' }}
      >
        <PageContent />
      </main>

      <ChatBar />
    </div>
  )
}

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
