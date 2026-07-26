export const MINUTE = 60_000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

/**
 * Today at a fixed hour — the anchor every demo's seed data is authored from.
 * 07:45 is deliberate: it sits inside the morning check windows, so SmartCheck
 * opens with live work rather than an empty list.
 */
export function anchorToday(hour = 7, minute = 45): number {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.getTime()
}

export function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function sameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b)
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 24-hour military time, e.g. "0940". */
export function hhmm(ms: number): string {
  const d = new Date(ms)
  return `${pad(d.getHours())}${pad(d.getMinutes())}`
}

/** "09:40" for form-ish contexts. */
export function clockTime(ms: number): string {
  const d = new Date(ms)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** "21 Jul 26" */
export function shortDate(ms: number): string {
  const d = new Date(ms)
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

/** "Tue 21 Jul" */
export function dowDate(ms: number): string {
  const d = new Date(ms)
  return `${DOW[d.getDay()]} ${pad(d.getDate())} ${MONTHS[d.getMonth()]}`
}

/** "21 Jul 26 · 0940" */
export function stamp(ms: number): string {
  return `${shortDate(ms)} · ${hhmm(ms)}`
}

/** ISO-like date for <input type="date">. */
export function dateInputValue(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromDateInput(value: string, hour = 17): number | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, hour, 0, 0, 0).getTime()
}

/**
 * Compact duration: "3d 4h", "4h 12m", "12m", "now".
 * Always positive — sign is the caller's business.
 */
export function duration(ms: number): string {
  const abs = Math.abs(ms)
  if (abs < MINUTE) return 'now'
  const d = Math.floor(abs / DAY)
  const h = Math.floor((abs % DAY) / HOUR)
  const m = Math.floor((abs % HOUR) / MINUTE)
  if (d > 0) return h > 0 ? `${d}d ${h}h` : `${d}d`
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return `${m}m`
}

/** "in 3d 4h" / "4h 12m ago" */
export function relative(target: number, now: number): string {
  const delta = target - now
  if (Math.abs(delta) < MINUTE) return 'just now'
  return delta > 0 ? `in ${duration(delta)}` : `${duration(delta)} ago`
}

/** Countdown that never shows a negative — returns overdue flag instead. */
export function countdown(
  target: number,
  now: number,
): { text: string; overdue: boolean; ms: number } {
  const delta = target - now
  return {
    text: duration(delta),
    overdue: delta < 0,
    ms: delta,
  }
}
