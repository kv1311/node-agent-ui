import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X, Info } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { fetchRandomArt } from '../lib/api'
import type { ArtWork } from '../types'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useApp } from '../context/AppContext'

export function ArtHeader() {
  const [art, setArt] = useState<ArtWork | null>(null)
  const [hovered, setHovered] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const reduced = useReducedMotion()
  const { sendMessage } = useApp()

  useEffect(() => {
    fetchRandomArt().then((a) => setArt(a))
  }, [])

  async function handleKnowMore() {
    if (!art) return
    const msg = `Tell me about this artwork: "${art.title}" by ${art.artistDisplayName || 'Unknown'}, dated ${art.objectDate || 'unknown date'}, ${art.culture || ''} ${art.period || ''}.`
    await sendMessage(msg)
  }

  return (
    <>
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '220px' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Background image */}
        {art?.primaryImage ? (
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${art.primaryImage})` }}
            animate={{ opacity: hovered ? 0.75 : 0.18 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
            }
          />
        ) : (
          <div className="absolute inset-0 bg-[#0d1a10]" />
        )}

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080f09] via-[#080f0966] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080f09aa] to-transparent h-16" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 h-14 z-10">
          <span
            className="text-[#c9b99a] italic"
            style={{ fontFamily: 'EB Garamond, serif', fontSize: '26px' }}
          >
            Sia
          </span>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span
              className="text-[#6b8f72] uppercase tracking-widest"
              style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px' }}
            >
              online
            </span>
          </div>
        </div>

        {/* Bottom artwork info */}
        {art && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end justify-between z-10"
            animate={{ opacity: hovered ? 1 : 0.6 }}
            transition={reduced ? { duration: 0 } : { duration: 0.4 }}
          >
            <div className="flex-1 min-w-0 mr-3">
              <p
                className="text-[#c9b99a] italic truncate leading-tight"
                style={{ fontFamily: 'EB Garamond, serif', fontSize: '15px' }}
              >
                {art.title}
              </p>
              {art.artistDisplayName && (
                <p
                  className="text-[#6b8f72] truncate"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px' }}
                >
                  {art.artistDisplayName}
                  {art.objectDate ? ` · ${art.objectDate}` : ''}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                onClick={() => void handleKnowMore()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#c9b99a33] text-[#c9b99a] backdrop-blur-md bg-white/5 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a] focus-visible:ring-offset-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px' }}
                whileHover={reduced ? {} : { scale: 1.02 }}
                whileTap={reduced ? {} : { scale: 0.97 }}
                aria-label="Ask Sia about this artwork"
              >
                <Info size={12} />
                Know More
              </motion.button>

              <motion.button
                onClick={() => setFullscreen(true)}
                className="p-1.5 rounded-sm border border-[#c9b99a33] text-[#6b8f72] backdrop-blur-md bg-white/5 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#c9b99a]"
                whileHover={reduced ? {} : { scale: 1.05 }}
                whileTap={reduced ? {} : { scale: 0.95 }}
                aria-label="View artwork fullscreen"
              >
                <Maximize2 size={12} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fullscreen dialog */}
      <Dialog.Root open={fullscreen} onOpenChange={setFullscreen}>
        <AnimatePresence>
          {fullscreen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/95"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.35 }}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild>
                <motion.div
                  className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 focus:outline-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                  }
                >
                  <Dialog.Title className="sr-only">
                    {art?.title ?? 'Artwork'}
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Fullscreen view of the artwork
                  </Dialog.Description>

                  {art && (
                    <>
                      <motion.img
                        src={art.primaryImage}
                        alt={art.title}
                        className="max-w-full max-h-[75vh] object-contain rounded"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={
                          reduced
                            ? { duration: 0 }
                            : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                        }
                      />

                      <motion.div
                        className="mt-6 text-center"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={
                          reduced
                            ? { duration: 0 }
                            : { delay: 0.2, duration: 0.4 }
                        }
                      >
                        <p
                          className="text-[#c9b99a] italic"
                          style={{ fontFamily: 'EB Garamond, serif', fontSize: '22px' }}
                        >
                          {art.title}
                        </p>
                        <p
                          className="text-[#6b8f72] mt-1"
                          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px' }}
                        >
                          {[art.artistDisplayName, art.objectDate, art.culture]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </motion.div>
                    </>
                  )}

                  <Dialog.Close asChild>
                    <motion.button
                      className="absolute top-5 right-5 p-2 rounded-sm text-[#6b8f72] hover:text-[#c9b99a] border border-[#1a2e1d] backdrop-blur-md bg-white/5 focus-visible:ring-2 focus-visible:ring-[#c9b99a] transition-colors"
                      whileHover={reduced ? {} : { scale: 1.05 }}
                      whileTap={reduced ? {} : { scale: 0.95 }}
                      aria-label="Close fullscreen"
                    >
                      <X size={18} />
                    </motion.button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  )
}