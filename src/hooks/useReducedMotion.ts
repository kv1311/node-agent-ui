import { useEffect, useState } from 'react'

/**
 * Returns true if the user has requested reduced motion.
 * Use this to disable or simplify animations for accessibility.
 *
 * @example
 * const reduced = useReducedMotion()
 * const variants = reduced ? {} : myAnimationVariants
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
