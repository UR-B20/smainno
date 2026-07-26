import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Check, ChevronDown, X } from '@/components/icons'

/* ============================================================================
   Shared vocabulary for the three replicas.

   All three render on bone-white surfaces the way the real products would, but
   each carries its own accent and its own chrome. Accent comes in through CSS
   custom properties so a single component set can serve all three.
   ========================================================================= */

export interface AppTheme {
  accent: string
  accentSoft: string
  accentInk: string
  accentDeep: string
}

export const THEMES = {
  ips: {
    accent: '#2f6fb5',
    accentSoft: '#e8f0f9',
    accentInk: '#ffffff',
    accentDeep: '#1c4c81',
  },
  fua: {
    accent: '#5b5fc7',
    accentSoft: '#ecebfa',
    accentInk: '#ffffff',
    accentDeep: '#3f43a0',
  },
  smartcheck: {
    accent: '#12355b',
    accentSoft: '#e7edf4',
    accentInk: '#ffffff',
    accentDeep: '#0a2340',
  },
} satisfies Record<string, AppTheme>

export function AppShell({
  theme,
  className,
  children,
  ...rest
}: ComponentProps<'div'> & { theme: AppTheme }) {
  const style = {
    '--accent': theme.accent,
    '--accent-soft': theme.accentSoft,
    '--accent-ink': theme.accentInk,
    '--accent-deep': theme.accentDeep,
  } as CSSProperties

  return (
    <div
      style={style}
      className={cn(
        'flex h-full w-full flex-col overflow-hidden bg-bone-100 font-sans text-[13px] text-slate-ink antialiased',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------- microtype */

export function Lbl({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('label text-slate-500', className)}>{children}</span>
  )
}

/* ------------------------------------------------------------------ tones */

export type Tone =
  | 'neutral'
  | 'accent'
  | 'ok'
  | 'warn'
  | 'danger'
  | 'info'
  | 'muted'

const PILL_TONE: Record<Tone, string> = {
  neutral: 'bg-bone-200 text-slate-700 border-bone-300',
  accent:
    'bg-[var(--accent-soft)] text-[var(--accent-deep)] border-[var(--accent)]/25',
  ok: 'bg-[#e6f4ec] text-[#1d6b47] border-[#1d6b47]/20',
  warn: 'bg-[#fdf1de] text-[#8a5a12] border-[#8a5a12]/20',
  danger: 'bg-[#fbeae8] text-[#a3302a] border-[#a3302a]/20',
  info: 'bg-[#e8f0fa] text-[#215289] border-[#215289]/20',
  muted: 'bg-transparent text-slate-500 border-bone-300',
}

const DOT_TONE: Record<Tone, string> = {
  neutral: 'bg-slate-400',
  accent: 'bg-[var(--accent)]',
  ok: 'bg-[#2f9169]',
  warn: 'bg-[#d99320]',
  danger: 'bg-[#c0392b]',
  info: 'bg-[#2f7fc4]',
  muted: 'bg-slate-400',
}

export function Pill({
  children,
  tone = 'neutral',
  dot = false,
  className,
}: {
  children: ReactNode
  tone?: Tone
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase',
        PILL_TONE[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT_TONE[tone])}
        />
      )}
      {children}
    </span>
  )
}

/* ---------------------------------------------------------------- buttons */

type AppBtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'

const APP_BTN: Record<AppBtnVariant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-deep)] shadow-[0_1px_0_rgba(0,0,0,0.06)]',
  secondary:
    'border border-bone-300 bg-white text-slate-700 hover:border-[var(--accent)]/50 hover:text-[var(--accent-deep)]',
  ghost: 'text-slate-600 hover:bg-bone-200 hover:text-slate-ink',
  danger: 'bg-[#c0392b] text-white hover:bg-[#a3302a]',
  subtle:
    'bg-[var(--accent-soft)] text-[var(--accent-deep)] hover:bg-[var(--accent)]/15',
}

export function AppBtn({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...rest
}: ComponentProps<'button'> & {
  variant?: AppBtnVariant
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'h-7 px-2.5 text-[11px] gap-1.5',
    md: 'h-8 px-3 text-[12px] gap-2',
    lg: 'h-10 px-4 text-[13px] gap-2',
  }
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-sm font-medium whitespace-nowrap transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
        sizes[size],
        APP_BTN[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ cards */

export function Card({
  className,
  children,
  ...rest
}: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'rounded-md border border-bone-300 bg-white shadow-[0_1px_2px_rgba(18,25,39,0.04)]',
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  )
}

export function CardHead({
  title,
  sub,
  right,
  className,
}: {
  title: ReactNode
  sub?: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 border-b border-bone-200 px-4 py-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="truncate text-[13px] font-semibold text-slate-ink">
          {title}
        </h3>
        {sub && <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{sub}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  )
}

/* ------------------------------------------------------------------- KPIs */

export function KPI({
  value,
  label,
  tone = 'neutral',
  hint,
  active = false,
  onClick,
}: {
  value: ReactNode
  label: string
  tone?: Tone
  hint?: string
  active?: boolean
  onClick?: () => void
}) {
  const valueTone: Record<Tone, string> = {
    neutral: 'text-slate-ink',
    accent: 'text-[var(--accent-deep)]',
    ok: 'text-[#1d6b47]',
    warn: 'text-[#8a5a12]',
    danger: 'text-[#a3302a]',
    info: 'text-[#215289]',
    muted: 'text-slate-500',
  }
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'relative flex-1 rounded-md border bg-white px-4 py-3 text-left transition-colors',
        active
          ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/25'
          : 'border-bone-300',
        onClick && 'hover:border-[var(--accent)]/60',
      )}
    >
      <span
        className={cn(
          'absolute top-3 bottom-3 left-0 w-[3px] rounded-full',
          DOT_TONE[tone],
        )}
        aria-hidden="true"
      />
      <div className={cn('numerals text-2xl leading-none font-semibold', valueTone[tone])}>
        {value}
      </div>
      <div className="mt-2 text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
        {label}
      </div>
      {hint && <div className="mt-1 text-[11px] text-slate-400">{hint}</div>}
    </Tag>
  )
}

/* ----------------------------------------------------------------- fields */

export function Field({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode
  required?: boolean
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
        {label}
        {required && <span className="text-[#c0392b]">*</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-[11px] font-medium text-[#a3302a]">
          {error}
        </span>
      )}
    </label>
  )
}

const CONTROL =
  'w-full rounded-sm border border-bone-300 bg-white px-2.5 py-2 text-[12.5px] text-slate-ink transition-colors placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 focus:outline-none disabled:bg-bone-100 disabled:text-slate-400'

export function Input({ className, ...rest }: ComponentProps<'input'>) {
  return <input className={cn(CONTROL, className)} {...rest} />
}

export function Textarea({ className, ...rest }: ComponentProps<'textarea'>) {
  return (
    <textarea className={cn(CONTROL, 'resize-y leading-relaxed', className)} {...rest} />
  )
}

export function Select({
  className,
  children,
  ...rest
}: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(CONTROL, 'appearance-none pr-8', className)}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
      />
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  tone = 'accent',
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: ReactNode
  description?: ReactNode
  tone?: 'accent' | 'danger'
  disabled?: boolean
}) {
  const id = useId()
  const on = tone === 'danger' ? 'bg-[#c0392b]' : 'bg-[var(--accent)]'
  return (
    <div className="flex items-start justify-between gap-3">
      <label htmlFor={id} className="min-w-0 cursor-pointer select-none">
        <span className="block text-[12px] font-medium text-slate-ink">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
            {description}
          </span>
        )}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40',
          checked ? on : 'bg-bone-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
            checked && 'translate-x-4',
          )}
        />
      </button>
    </div>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('flex items-center gap-2 text-left text-[12px]', className)}
    >
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors',
          checked
            ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
            : 'border-bone-400 bg-white',
        )}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
      <span className="text-slate-700">{label}</span>
    </button>
  )
}

/* ------------------------------------------------------------------- tabs */

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T
  onChange: (next: T) => void
  items: { value: T; label: string; count?: number; tone?: Tone }[]
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn('flex items-center gap-1 border-b border-bone-300', className)}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative -mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-medium transition-colors',
              active
                ? 'border-[var(--accent)] text-[var(--accent-deep)]'
                : 'border-transparent text-slate-500 hover:text-slate-ink',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'numerals rounded-full px-1.5 py-px text-[10px] font-semibold',
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-deep)]'
                    : 'bg-bone-200 text-slate-500',
                  item.tone === 'danger' && item.count > 0 && 'bg-[#fbeae8] text-[#a3302a]',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ empty */

export function Empty({
  icon,
  title,
  body,
  className,
}: {
  icon?: ReactNode
  title: string
  body?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="mb-3 text-bone-400">{icon}</div>}
      <p className="text-[13px] font-medium text-slate-600">{title}</p>
      {body && <p className="mt-1 max-w-xs text-[11.5px] text-slate-400">{body}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ modal */

export function Modal({
  open,
  onClose,
  title,
  sub,
  children,
  footer,
  width = 560,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  sub?: ReactNode
  children: ReactNode
  footer?: ReactNode
  width?: number
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-slate-ink/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{ width, maxWidth: '100%' }}
        className="relative flex max-h-full flex-col overflow-hidden rounded-lg border border-bone-300 bg-white shadow-[0_30px_70px_-20px_rgba(11,18,32,0.45)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-bone-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-ink">{title}</h2>
            {sub && <p className="mt-0.5 text-[11.5px] text-slate-500">{sub}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 rounded-sm p-1 text-slate-400 hover:bg-bone-200 hover:text-slate-ink"
          >
            <X size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-bone-200 bg-bone-50 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ toast */

interface ToastMsg {
  id: number
  text: string
  tone: Tone
  detail?: string
}

const ToastCtx = createContext<(text: string, opts?: { tone?: Tone; detail?: string }) => void>(
  () => {},
)

export function useToast() {
  return useContext(ToastCtx)
}

export function ToastHost({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMsg[]>([])
  const seq = useRef(0)

  const push = useMemo(
    () =>
      (text: string, opts?: { tone?: Tone; detail?: string }) => {
        const id = ++seq.current
        setItems((prev) => [
          ...prev.slice(-2),
          { id, text, tone: opts?.tone ?? 'accent', detail: opts?.detail },
        ])
        window.setTimeout(
          () => setItems((prev) => prev.filter((t) => t.id !== id)),
          4200,
        )
      },
    [],
  )

  return (
    <ToastCtx.Provider value={push}>
      {children}
      {/* Bottom-left: modal footers are right-aligned, so a toast there would
          land on top of the very button that raised it. */}
      <div className="pointer-events-none absolute bottom-16 left-4 z-[60] flex w-72 max-w-[calc(100%-2rem)] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'fade-in pointer-events-auto rounded-md border bg-white px-3.5 py-2.5 shadow-[0_12px_30px_-12px_rgba(11,18,32,0.45)]',
              t.tone === 'danger'
                ? 'border-[#c0392b]/30'
                : t.tone === 'ok'
                  ? 'border-[#2f9169]/30'
                  : 'border-bone-300',
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                  DOT_TONE[t.tone],
                )}
              />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-slate-ink">{t.text}</p>
                {t.detail && (
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                    {t.detail}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* --------------------------------------------------------------- progress */

export function Bar({
  value,
  tone = 'accent',
  className,
}: {
  value: number
  tone?: Tone
  className?: string
}) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-bone-200', className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', DOT_TONE[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

/* --------------------------------------------------------------- avatars */

export function Avatar({
  name,
  size = 26,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const initials = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  // Deterministic hue from the name so a person keeps the same colour.
  const hue = Array.from(name).reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7)

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(150deg, hsl(${hue} 42% 46%), hsl(${(hue + 28) % 360} 44% 34%))`,
      }}
      title={name}
    >
      {initials}
    </span>
  )
}

/* ------------------------------------------------------- requirement list */

export function RequirementList({
  items,
  className,
}: {
  items: { label: string; met: boolean }[]
  className?: string
}) {
  return (
    <ul className={cn('space-y-1.5', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-2 text-[11.5px]">
          <span
            className={cn(
              'mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
              item.met
                ? 'border-[#2f9169] bg-[#2f9169] text-white'
                : 'border-bone-400 bg-white text-transparent',
            )}
          >
            <Check size={10} strokeWidth={3} />
          </span>
          <span className={item.met ? 'text-slate-500 line-through' : 'text-slate-700'}>
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  )
}
