import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { anchorToday, MINUTE } from './time'

/**
 * Every replica is a real, stateful application — you can create records, post
 * updates and watch derived state recompute. This factory gives each one:
 *
 *   · a persisted state envelope (localStorage, versioned, reset-able)
 *   · a simulated clock, so a reviewer can jump forward and watch a mandate
 *     breach or a check window expire without waiting for real hours to pass
 *
 * Seed data is authored relative to `t0` (today at a fixed hour) so the demos
 * always look current, whatever day they're opened.
 */

interface Envelope<T> {
  v: number
  t0: number
  offsetMin: number
  data: T
}

export interface DemoStore<T> {
  /** Application state. */
  state: T
  /** Immutable update — return a new state from the previous one. */
  set: (updater: (prev: T) => T) => void
  /** Current simulated time in ms. Advances with real time and with jumps. */
  now: number
  /** Minutes the reviewer has fast-forwarded. */
  offsetMin: number
  /** Fast-forward (or rewind, with a negative value). */
  jump: (minutes: number) => void
  /** Return the clock to real time. */
  resetClock: () => void
  /** Wipe persisted state and re-seed. */
  reset: () => void
}

function read<T>(key: string, version: number): Envelope<T> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Envelope<T>
    if (parsed?.v !== version) return null
    return parsed
  } catch {
    return null
  }
}

function write<T>(key: string, env: Envelope<T>) {
  try {
    localStorage.setItem(key, JSON.stringify(env))
  } catch {
    /* quota or private mode — the demo still works, it just won't persist */
  }
}

export function createDemoStore<T extends object>(config: {
  key: string
  version: number
  seed: (t0: number) => T
}) {
  const Ctx = createContext<DemoStore<T> | null>(null)

  function Provider({ children }: { children: ReactNode }) {
    const [env, setEnv] = useState<Envelope<T>>(() => {
      const existing = read<T>(config.key, config.version)
      if (existing) return existing
      const t0 = anchorToday()
      return { v: config.version, t0, offsetMin: 0, data: config.seed(t0) }
    })

    // Real elapsed time since this provider mounted, so clocks visibly run.
    const mountedAt = useRef(Date.now())
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
      const id = window.setInterval(
        () => setElapsed(Date.now() - mountedAt.current),
        15_000,
      )
      return () => window.clearInterval(id)
    }, [])

    useEffect(() => {
      write(config.key, env)
    }, [env])

    const set = useCallback((updater: (prev: T) => T) => {
      setEnv((prev) => ({ ...prev, data: updater(prev.data) }))
    }, [])

    const jump = useCallback((minutes: number) => {
      setEnv((prev) => ({ ...prev, offsetMin: prev.offsetMin + minutes }))
    }, [])

    const resetClock = useCallback(() => {
      mountedAt.current = Date.now()
      setElapsed(0)
      setEnv((prev) => ({ ...prev, offsetMin: 0 }))
    }, [])

    const reset = useCallback(() => {
      const t0 = anchorToday()
      mountedAt.current = Date.now()
      setElapsed(0)
      setEnv({ v: config.version, t0, offsetMin: 0, data: config.seed(t0) })
    }, [])

    const value = useMemo<DemoStore<T>>(
      () => ({
        state: env.data,
        set,
        now: env.t0 + env.offsetMin * MINUTE + elapsed,
        offsetMin: env.offsetMin,
        jump,
        resetClock,
        reset,
      }),
      [env, elapsed, set, jump, resetClock, reset],
    )

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>
  }

  function useStore(): DemoStore<T> {
    const ctx = useContext(Ctx)
    if (!ctx) {
      throw new Error(`${config.key} store used outside its Provider`)
    }
    return ctx
  }

  return { Provider, useStore }
}

/** Monotonic id generator — good enough for a self-contained replica. */
export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`
}
