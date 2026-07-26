import { useEffect, useState } from 'react'

/** Reactive `matchMedia`. Safe to call before the DOM exists. */
export function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * Below this width a device frame stops making sense — the replica takes the
 * whole screen instead, and the project pages link out to it rather than
 * embedding a shrunken copy.
 */
export function useIsHandheld(): boolean {
  return useMedia('(max-width: 860px)')
}
