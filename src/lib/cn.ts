export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>

/** Tiny classnames helper — no dependency, no tailwind-merge magic. */
export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  const walk = (v: ClassValue) => {
    if (!v && v !== 0) return
    if (typeof v === 'string' || typeof v === 'number') {
      out.push(String(v))
    } else if (Array.isArray(v)) {
      v.forEach(walk)
    } else if (typeof v === 'object') {
      for (const [key, on] of Object.entries(v)) if (on) out.push(key)
    }
  }
  values.forEach(walk)
  return out.join(' ')
}
