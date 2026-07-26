import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { ArrowRight } from './icons'

/* ---------------------------------------------------------------- accents */

export type Accent = 'azure' | 'brass' | 'jade'

export const ACCENT: Record<
  Accent,
  {
    text: string
    hoverText: string
    border: string
    bg: string
    dot: string
    glow: string
  }
> = {
  azure: {
    text: 'text-azure-300',
    hoverText: 'group-hover:text-azure-300',
    border: 'border-azure-500/45',
    bg: 'bg-azure-900/50',
    dot: 'bg-azure-400',
    glow: 'shadow-[0_0_36px_-12px_var(--color-azure-400)]',
  },
  brass: {
    text: 'text-brass-300',
    hoverText: 'group-hover:text-brass-300',
    border: 'border-brass-500/45',
    bg: 'bg-brass-900/50',
    dot: 'bg-brass-400',
    glow: 'shadow-[0_0_36px_-12px_var(--color-brass-400)]',
  },
  jade: {
    text: 'text-jade-300',
    hoverText: 'group-hover:text-jade-300',
    border: 'border-jade-500/45',
    bg: 'bg-jade-900/50',
    dot: 'bg-jade-400',
    glow: 'shadow-[0_0_36px_-12px_var(--color-jade-400)]',
  },
}

/* ------------------------------------------------------------- microtype */

export function Micro({
  children,
  className,
  as: As = 'span',
}: {
  children: ReactNode
  className?: string
  as?: 'span' | 'div' | 'p'
}) {
  return <As className={cn('label text-ink-400', className)}>{children}</As>
}

export function Eyebrow({
  children,
  accent = 'brass',
  className,
}: {
  children: ReactNode
  accent?: Accent
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn('h-px w-6 shrink-0', ACCENT[accent].dot)}
        aria-hidden="true"
      />
      <span className={cn('label', ACCENT[accent].text)}>{children}</span>
    </div>
  )
}

/* ---------------------------------------------------------------- surface */

export function Panel({
  children,
  className,
  ticks = false,
  ...rest
}: ComponentProps<'div'> & { ticks?: boolean }) {
  return (
    <div
      className={cn(
        'relative border border-ink-700 bg-ink-850/60 backdrop-blur-[2px]',
        ticks && 'tick-corners',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function Rule({ className }: { className?: string }) {
  return <div className={cn('rule-fade w-full', className)} aria-hidden="true" />
}

/* ---------------------------------------------------------------- buttons */

type BtnVariant = 'primary' | 'outline' | 'ghost'

const BTN_BASE =
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs px-4 py-2.5 label-lg transition-all duration-200 disabled:pointer-events-none disabled:opacity-40'

const BTN_VARIANT: Record<BtnVariant, string> = {
  primary:
    'bg-brass-500 text-ink-950 hover:bg-brass-400 hover:shadow-[0_0_28px_-8px_var(--color-brass-400)]',
  outline:
    'border border-ink-600 text-[#d6e0ee] hover:border-brass-500/70 hover:text-brass-200 hover:bg-brass-900/30',
  ghost: 'text-ink-400 hover:text-brass-200',
}

export function Btn({
  variant = 'outline',
  className,
  children,
  arrow = false,
  ...rest
}: ComponentProps<'button'> & { variant?: BtnVariant; arrow?: boolean }) {
  return (
    <button
      type="button"
      className={cn(BTN_BASE, BTN_VARIANT[variant], className)}
      {...rest}
    >
      {children}
      {arrow && (
        <ArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </button>
  )
}

export function BtnLink({
  to,
  variant = 'outline',
  className,
  children,
  arrow = false,
  ...rest
}: ComponentProps<typeof Link> & { variant?: BtnVariant; arrow?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(BTN_BASE, BTN_VARIANT[variant], className)}
      {...rest}
    >
      {children}
      {arrow && (
        <ArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </Link>
  )
}

/* ------------------------------------------------------------------ chips */

export function Chip({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode
  className?: string
  tone?: 'neutral' | 'brass' | 'jade' | 'azure' | 'signal'
}) {
  const tones = {
    neutral: 'border-ink-600 text-ink-400',
    brass: 'border-brass-500/50 text-brass-300 bg-brass-900/40',
    jade: 'border-jade-500/50 text-jade-300 bg-jade-900/40',
    azure: 'border-azure-500/50 text-azure-300 bg-azure-900/40',
    signal: 'border-signal-500/50 text-signal-300 bg-signal-900/40',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xs border px-2 py-1 label',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* --------------------------------------------------------- section header */

export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  accent = 'brass',
  className,
  reveal = false,
}: {
  index?: string
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  accent?: Accent
  className?: string
  /** Opt into the scroll-reveal transition. */
  reveal?: boolean
}) {
  return (
    <header
      className={cn('max-w-3xl', className)}
      {...(reveal ? { 'data-reveal': '' } : {})}
    >
      {eyebrow && <Eyebrow accent={accent}>{eyebrow}</Eyebrow>}
      <div className="mt-5 flex items-start gap-5">
        {index && (
          <span className="label mt-2.5 shrink-0 text-ink-500">{index}</span>
        )}
        <h2 className="text-3xl leading-[1.1] sm:text-[2.6rem]">{title}</h2>
      </div>
      {lede && (
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#93a3b9]">
          {lede}
        </p>
      )}
    </header>
  )
}

/* ------------------------------------------------------------ stat block */

export function Stat({
  value,
  label,
  tone = 'neutral',
  className,
}: {
  value: ReactNode
  label: string
  tone?: 'neutral' | 'brass' | 'signal' | 'jade'
  className?: string
}) {
  const tones = {
    neutral: 'text-[#e7eef7]',
    brass: 'text-brass-300',
    signal: 'text-signal-400',
    jade: 'text-jade-300',
  }
  return (
    <div className={cn('border-l border-ink-700 pl-4', className)}>
      <div className={cn('numerals text-2xl font-medium', tones[tone])}>
        {value}
      </div>
      <Micro className="mt-2 block">{label}</Micro>
    </div>
  )
}

/* ------------------------------------------------- classification marking */

export function ClassificationBar({
  className,
  text = 'OFFICIAL / (OPEN)',
}: {
  className?: string
  text?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 border-y border-brass-700/40 bg-brass-900/25 py-1.5',
        className,
      )}
    >
      <span className="h-1 w-1 bg-brass-500" aria-hidden="true" />
      <span className="label text-brass-400">{text}</span>
      <span className="h-1 w-1 bg-brass-500" aria-hidden="true" />
    </div>
  )
}
