import { cn } from '@/lib/cn'
import { Pill } from '../shared/kit'
import type { Tone } from '../shared/kit'
import { Camera, Clock, Alert, Check, Pause, X } from '@/components/icons'
import { countdown, hhmm } from '@/lib/time'
import { OCC_LABEL } from './store'
import type { OccState, Occurrence, Photo } from './store'

/**
 * The deck's own legend:
 *   NAVY  — scheduled / active phase
 *   GOLD  — critical path, action required
 *   RED   — system flag, missed deadline
 */
export const OCC_TONE: Record<OccState, Tone> = {
  scheduled: 'info',
  active: 'warn',
  'in-progress': 'warn',
  completed: 'ok',
  missed: 'danger',
  skipped: 'neutral',
  paused: 'muted',
}

export function StateChip({ state }: { state: OccState }) {
  const icon =
    state === 'completed' ? (
      <Check size={10} strokeWidth={3} />
    ) : state === 'missed' ? (
      <Alert size={10} />
    ) : state === 'skipped' ? (
      <X size={10} />
    ) : state === 'paused' ? (
      <Pause size={10} />
    ) : null

  return (
    <Pill tone={OCC_TONE[state]} dot={!icon}>
      {icon}
      {OCC_LABEL[state]}
    </Pill>
  )
}

export function WindowClock({
  occ,
  state,
  now,
  className,
}: {
  occ: Occurrence
  state: OccState
  now: number
  className?: string
}) {
  const window = `${hhmm(occ.startAt)}–${hhmm(occ.endAt)}`

  if (state === 'scheduled') {
    const c = countdown(occ.startAt, now)
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-[11px] text-slate-500', className)}>
        <Clock size={11} /> {window} · opens in {c.text}
      </span>
    )
  }
  if (state === 'active' || state === 'in-progress') {
    const c = countdown(occ.endAt, now)
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-semibold',
          c.ms < 30 * 60_000 ? 'text-[#a3302a]' : 'text-[#8a5a12]',
          className,
        )}
      >
        <Clock size={11} /> {window} · closes in {c.text}
      </span>
    )
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] text-slate-400', className)}>
      <Clock size={11} /> {window}
    </span>
  )
}

/**
 * Photographs are simulated rather than uploaded — the replica runs entirely in
 * the browser — but they behave like the real thing: attached to the item that
 * raised them, counted, and carried into the issue record.
 */
export function PhotoTile({
  photo,
  size = 56,
  onRemove,
}: {
  photo: Photo
  size?: number
  onRemove?: () => void
}) {
  const h = photo.seed % 360
  return (
    <figure
      className="relative shrink-0 overflow-hidden rounded-sm border border-bone-300"
      style={{ width: size, height: size }}
      title={photo.name}
    >
      <div
        className="h-full w-full"
        style={{
          background: `linear-gradient(155deg, hsl(${h} 24% 62%), hsl(${(h + 40) % 360} 28% 34%))`,
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 9px)',
        }}
      />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/45 px-1 py-0.5 text-[7px] font-medium tracking-wide text-white">
        <Camera size={7} />
        <span className="truncate">{photo.name}</span>
      </figcaption>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${photo.name}`}
          className="absolute top-0.5 right-0.5 rounded-full bg-black/55 p-0.5 text-white hover:bg-black/80"
        >
          <X size={9} strokeWidth={3} />
        </button>
      )}
    </figure>
  )
}

export function ScoreBadge({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  const tone: Tone = pct >= 90 ? 'ok' : pct >= 70 ? 'warn' : 'danger'
  return (
    <Pill tone={tone}>
      Score {score}/{max}
    </Pill>
  )
}
