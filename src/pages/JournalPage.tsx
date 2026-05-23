import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { fetchJournal, fetchJournalEntry, deleteJournalEntry } from '../lib/api'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { JournalEntry } from '../types'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded bg-[#1a2e1d] animate-pulse ${className}`} />
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(str: string) {
  return new Date(str).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function Tag({ text }: { text: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded bg-[#1a2e1d] text-[#6b8f72]"
      style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px' }}
    >
      {text}
    </span>
  )
}

interface EntryCardProps {
  entry: JournalEntry
  onSelect: (e: JournalEntry) => void
  index: number
  reduced: boolean
}

function EntryCard({ entry, onSelect, index, reduced }: EntryCardProps) {
  const tags = entry.tags ? entry.tags.split(',').filter(Boolean) : []

  return (
    <motion.button
      className="w-full text-left py-6 border-b border-[#1a2e1d] last:border-0 hover:bg-[#0d1a1044] transition-colors px-1 focus-visible:ring-2 focus-visible:ring-[#c9b99a] rounded"
      onClick={() => onSelect(entry)}
      initial={reduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced ? { duration: 0 } : { delay: index * 0.04, duration: 0.28, ease: 'easeOut' }
      }
      whileHover={reduced ? {} : { x: 2 }}
    >
      <div className="flex items-baseline justify-between mb-2 gap-3">
        <span
          className="text-[#6b8f72]"
          style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}
        >
          {formatDate(entry.created_at)} · {formatTime(entry.created_at)}
          {entry.mood ? ` · ${entry.mood}` : ''}
        </span>
      </div>

      {entry.title && (
        <h2
          className="text-[#ede8df] italic leading-snug mb-2"
          style={{ fontFamily: 'EB Garamond, serif', fontSize: '20px' }}
        >
          {entry.title}
        </h2>
      )}

      <p
        className="text-[#ede8df88] leading-relaxed line-clamp-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
      >
        {entry.content}
      </p>

      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {tags.map((t) => (
            <Tag key={t} text={t.trim()} />
          ))}
        </div>
      )}
    </motion.button>
  )
}

function FullEntryView({
  entry,
  onBack,
  onDelete,
  reduced,
}: {
  entry: JournalEntry
  onBack: () => void
  onDelete: (id: string) => void
  reduced: boolean
}) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const tags = entry.tags ? entry.tags.split(',').filter(Boolean) : []

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteJournalEntry(entry.id)
      onDelete(entry.id)
      onBack()
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <motion.div
      className="px-5 py-5 pb-24"
      initial={reduced ? {} : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? {} : { opacity: 0, x: 16 }}
      transition={reduced ? { duration: 0 } : { duration: 0.28, ease: 'easeOut' }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[#6b8f72] hover:text-[#ede8df] transition-colors mb-6 focus-visible:ring-2 focus-visible:ring-[#c9b99a] rounded"
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}
      >
        <ArrowLeft size={14} />
        back
      </button>

      <p
        className="text-[#6b8f72] mb-2"
        style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}
      >
        {formatDate(entry.created_at)} · {formatTime(entry.created_at)}
        {entry.mood ? ` · ${entry.mood}` : ''}
      </p>

      {entry.title && (
        <h1
          className="text-[#c9b99a] italic leading-snug mb-5"
          style={{ fontFamily: 'EB Garamond, serif', fontSize: '28px' }}
        >
          {entry.title}
        </h1>
      )}

      <div
        className="text-[#ede8df] leading-relaxed whitespace-pre-wrap"
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px' }}
      >
        {entry.content}
      </div>

      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-6">
          {tags.map((t) => (
            <Tag key={t} text={t.trim()} />
          ))}
        </div>
      )}

      {/* Delete */}
      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Trigger asChild>
          <button
            className="mt-8 flex items-center gap-2 px-3 py-2 border border-[#5a1a1a] rounded text-[#c97a7a] hover:bg-[#1a0a0a] transition-colors focus-visible:ring-2 focus-visible:ring-[#c97a7a]"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}
          >
            <Trash2 size={13} />
            Delete entry
          </button>
        </Dialog.Trigger>

        <AnimatePresence>
          {deleteOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-[#0d1a10] border border-[#1a2e1d] rounded-lg p-6 max-w-sm mx-auto"
                  initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? {} : { opacity: 0, scale: 0.95 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.2 }}
                >
                  <Dialog.Title
                    className="text-[#ede8df] mb-2"
                    style={{ fontFamily: 'EB Garamond, serif', fontSize: '20px' }}
                  >
                    Delete this entry?
                  </Dialog.Title>
                  <Dialog.Description
                    className="text-[#6b8f72] mb-6"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
                  >
                    This cannot be undone.
                  </Dialog.Description>
                  <div className="flex gap-3">
                    <Dialog.Close asChild>
                      <button
                        className="flex-1 py-2 border border-[#1a2e1d] rounded text-[#6b8f72] hover:text-[#ede8df] transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a]"
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: '13px',
                        }}
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={() => void confirmDelete()}
                      disabled={deleting}
                      className="flex-1 py-2 bg-[#5a1a1a] border border-[#5a1a1a] rounded text-[#c97a7a] disabled:opacity-50 transition-opacity focus-visible:ring-2 focus-visible:ring-[#c97a7a]"
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '13px',
                      }}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </motion.div>
  )
}

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<JournalEntry | null>(null)
  const [search, setSearch] = useState('')
  const reduced = useReducedMotion()
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (keyword?: string) => {
    setLoading(true)
    try {
      const data = await fetchJournal(30, keyword)
      setEntries(data)
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => void load(val || undefined), 350)
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {selected ? (
          <FullEntryView
            key="full"
            entry={selected}
            onBack={() => setSelected(null)}
            onDelete={handleDelete}
            reduced={reduced}
          />
        ) : (
          <motion.div
            key="list"
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? {} : { opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
          >
            {/* Header */}
            <div className="px-5 py-5 border-b border-[#1a2e1d] flex items-baseline justify-between">
              <h1
                className="text-[#c9b99a] italic"
                style={{ fontFamily: 'EB Garamond, serif', fontSize: '26px' }}
              >
                Chronicle
              </h1>
              <span
                className="text-[#6b8f72]"
                style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px' }}
              >
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-[#1a2e1d]">
              <input
                type="search"
                value={search}
                onChange={handleSearch}
                placeholder="Search entries..."
                className="w-full bg-transparent border-none outline-none text-[#ede8df] placeholder-[#6b8f7255] focus:ring-0 caret-[#c9b99a]"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
                aria-label="Search journal entries"
              />
            </div>

            {/* Hint */}
            <p
              className="px-5 py-3 text-[#6b8f7244] italic border-b border-[#1a2e1d]"
              style={{ fontFamily: 'EB Garamond, serif', fontSize: '14px' }}
            >
              Say "journal this" in chat to save a conversation as an entry.
            </p>

            {/* List */}
            <div className="px-5">
              {loading ? (
                <div className="space-y-6 py-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-3 w-32 mb-3" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6 mt-1" />
                    </div>
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <p
                  className="py-12 text-center text-[#6b8f7255] italic"
                  style={{ fontFamily: 'EB Garamond, serif', fontSize: '17px' }}
                >
                  {search ? 'Nothing found.' : 'No entries yet.'}
                </p>
              ) : (
                entries.map((entry, i) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onSelect={setSelected}
                    index={i}
                    reduced={reduced}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
