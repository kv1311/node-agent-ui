import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, CornerDownLeft, X, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

function ChatMessage({
  role,
  content,
  reduced,
}: {
  role: 'user' | 'assistant'
  content: string
  reduced: boolean
}) {
  return (
    <motion.div
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
      initial={reduced ? {} : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
    >
      {role === 'user' ? (
        <div
          className="max-w-[78%] px-4 py-2.5 rounded-lg bg-[#1a2e1d] text-[#c9b99a] leading-relaxed"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
        >
          {content}
        </div>
      ) : (
        <div
          className="max-w-[85%] text-[#ede8df] leading-relaxed"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
        >
          {content}
        </div>
      )}
    </motion.div>
  )
}

export function ChatBar() {
  const { messages, chatLoading, sendMessage, chatOpen, setChatOpen } = useApp()
  const [input, setInput] = useState('')
  const reduced = useReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chatOpen])

  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, chatOpen])

  async function handleSubmit() {
    const text = input.trim()
    if (!text || chatLoading) return
    setInput('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
    if (e.key === 'Escape') setChatOpen(false)
  }

  return (
    <>
      {/* Backdrop when open */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.25 }}
            onClick={() => setChatOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <motion.div
        className="fixed bottom-0 right-0 z-40 flex flex-col"
        style={{ left: 52 }}
        animate={{ height: chatOpen ? 'min(520px, 70vh)' : '60px' }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: 'spring', stiffness: 280, damping: 28 }
        }
      >
        {/* Glass panel background */}
        <div className="absolute inset-0 bg-[#080f09]/90 backdrop-blur-xl border-t border-[#1a2e1d]" />

        {/* Message history */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              className="relative flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : { delay: 0.1, duration: 0.2 }}
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {messages.length === 0 ? (
              <p className="text-[#6b8f72] text-center mt-8"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}>
                Ask Sia anything.
              </p>
              ) : (
                messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    reduced={reduced}
                  />
                ))
              )}

              {chatLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-2 text-[#6b8f72]">
                    <Loader2 size={14} className="animate-spin" />
                    <span
                      style={{
                        fontFamily: 'Courier Prime, monospace',
                        fontSize: '12px',
                      }}
                    >
                      thinking...
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar — always visible */}
        <div className="relative h-[60px] flex items-center px-4 gap-3 shrink-0 border-t border-[#1a2e1d]">
          <Terminal
            size={15}
            className="text-[#6b8f72] shrink-0"
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setChatOpen(true)}
            placeholder="Query the archive..."
            className="flex-1 bg-transparent border-none outline-none text-[#ede8df] placeholder-[#6b8f7266] caret-[#c9b99a] focus:ring-0"
            style={{ fontFamily: 'Courier Prime, monospace', fontSize: '14px' }}
            aria-label="Message Sia"
            autoComplete="off"
            spellCheck={false}
          />

          <div className="flex items-center gap-2 shrink-0">
            <AnimatePresence>
              {chatOpen && (
                <motion.button
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 text-[#6b8f72] hover:text-[#ede8df] transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a] rounded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.15 }}
                  aria-label="Close chat"
                  whileTap={reduced ? {} : { scale: 0.9 }}
                >
                  <X size={15} />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => void handleSubmit()}
              disabled={!input.trim() || chatLoading}
              className="p-1.5 text-[#6b8f72] hover:text-[#c9b99a] disabled:opacity-30 transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a] rounded"
              aria-label="Send message"
              whileTap={reduced ? {} : { scale: 0.9 }}
            >
              <CornerDownLeft size={15} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
