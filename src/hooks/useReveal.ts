import { useEffect } from 'react'

/**
 * Reveals anything carrying `data-reveal` once it enters the viewport.
 * One observer for the whole document, re-scanned on route change.
 */
export function useReveal(dep?: unknown) {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal=""], [data-reveal]'),
    ).filter((n) => n.dataset.reveal !== 'in')

    if (!nodes.length) return

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      nodes.forEach((n) => (n.dataset.reveal = 'in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).dataset.reveal = 'in'
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )

    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [dep])
}
