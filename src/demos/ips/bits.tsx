import { cn } from '@/lib/cn'
import { Pill } from '../shared/kit'
import type { Tone } from '../shared/kit'
import { Alert, Check, Clock } from '@/components/icons'
import { HOUR, countdown, stamp } from '@/lib/time'
import { MANDATE_MS, STAGE_LABEL, mandateAt, mandateBreached } from './store'
import type { IpsCase, Stage } from './store'

export const STAGE_TONE: Record<Stage, Tone> = {
  reported: 'warn',
  awarded: 'accent',
  closed: 'ok',
}

export function StageChip({ stage }: { stage: Stage }) {
  return (
    <Pill tone={STAGE_TONE[stage]} dot>
      {STAGE_LABEL[stage]}
    </Pill>
  )
}

/**
 * The 24-hour recording mandate, made visible. It runs from the incident — not
 * from the moment somebody opens the file — which is the whole point.
 */
export function MandateClock({
  c,
  now,
  variant = 'inline',
}: {
  c: IpsCase
  now: number
  variant?: 'inline' | 'block'
}) {
  const deadline = mandateAt(c)
  const breached = mandateBreached(c, now)
  const recorded = Boolean(c.deliberation)
  const at = recorded ? c.deliberation!.decidedAt : now
  const used = Math.max(0, Math.min(MANDATE_MS, at - c.incidentAt))
  const pct = Math.round((used / MANDATE_MS) * 100)
  const left = countdown(deadline, now)

  const tone = breached
    ? 'text-[#a3302a]'
    : recorded
      ? 'text-[#1d6b47]'
      : left.ms < 4 * HOUR
        ? 'text-[#a3302a]'
        : left.ms < 8 * HOUR
          ? 'text-[#8a5a12]'
          : 'text-slate-500'

  const barColor = breached
    ? 'bg-[#c0392b]'
    : recorded
      ? 'bg-[#2f9169]'
      : left.ms < 4 * HOUR
        ? 'bg-[#c0392b]'
        : left.ms < 8 * HOUR
          ? 'bg-[#d99320]'
          : 'bg-[var(--accent)]'

  const text = breached
    ? recorded
      ? `Recorded ${countdown(c.deliberation!.decidedAt, deadline).text} late`
      : `${left.text} past the mandate`
    : recorded
      ? `Recorded with ${countdown(deadline, c.deliberation!.decidedAt).text} to spare`
      : `${left.text} to record`

  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-[11.5px] font-medium', tone)}>
        {breached ? <Alert size={12} /> : recorded ? <Check size={12} /> : <Clock size={12} />}
        {text}
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label text-slate-400">24-hour recording mandate</span>
        <span className={cn('text-[11px] font-semibold', tone)}>{text}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-bone-200">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', barColor)}
          style={{ width: `${breached && !recorded ? 100 : pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
        <span>Incident {stamp(c.incidentAt)}</span>
        <span>Deadline {stamp(deadline)}</span>
      </div>
    </div>
  )
}

export function Subject({ c, className }: { c: IpsCase; className?: string }) {
  return (
    <span className={cn('inline-flex flex-col', className)}>
      <span className="text-[12.5px] font-medium text-slate-ink">
        {c.subjectRank} {c.subjectName}
      </span>
      <span className="text-[10.5px] text-slate-400">{c.coy}</span>
    </span>
  )
}
