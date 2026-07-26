import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Pill, Avatar } from '../shared/kit'
import type { Tone } from '../shared/kit'
import { countdown, shortDate, stamp } from '@/lib/time'
import { displayName, isDueSoon, isOverdue, personById } from './store'
import type { Entry, FuaState, Priority, Status, Subtask } from './store'
import { Alert, Check, Clock, Dot, Send, Plus } from '@/components/icons'

export const STATUS_TONE: Record<Status, Tone> = {
  'Not Started': 'muted',
  'In Progress': 'info',
  Blocked: 'danger',
  Completed: 'ok',
}

export function StatusPill({ status }: { status: Status }) {
  return (
    <Pill tone={STATUS_TONE[status]} dot>
      {status}
    </Pill>
  )
}

/** "a brass tick flags high priority" — the deck's own shorthand. */
export function PriorityMark({ priority }: { priority: Priority }) {
  if (priority !== 'High') {
    return (
      <span
        className="text-[10px] font-semibold tracking-[0.06em] text-slate-400 uppercase"
        title={`${priority} priority`}
      >
        {priority}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.06em] text-[#8a6d14] uppercase"
      title="High priority"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M1.5 6.4L4.4 9.3 10.5 2.9"
          fill="none"
          stroke="#c9a227"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      High
    </span>
  )
}

/** Red edge = overdue, amber edge = due within seven days. */
export function urgencyEdge(s: Subtask, now: number): string {
  if (isOverdue(s, now)) return 'before:bg-[#c0392b]'
  if (isDueSoon(s, now)) return 'before:bg-[#d99320]'
  return 'before:bg-transparent'
}

export function DueCell({
  dueAt,
  now,
  done,
}: {
  dueAt: number
  now: number
  done: boolean
}) {
  const c = countdown(dueAt, now)
  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-400">
        <Check size={12} /> {shortDate(dueAt)}
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11.5px]',
        c.overdue
          ? 'font-semibold text-[#a3302a]'
          : c.ms < 7 * 86_400_000
            ? 'font-medium text-[#8a5a12]'
            : 'text-slate-500',
      )}
      title={stamp(dueAt)}
    >
      {c.overdue ? <Alert size={12} /> : <Clock size={12} />}
      {c.overdue ? `${c.text} overdue` : `${c.text} left`}
    </span>
  )
}

export function Person({
  state,
  id,
  size = 22,
  showName = true,
}: {
  state: FuaState
  id: string
  size?: number
  showName?: boolean
}) {
  if (id === 'system') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
        <span
          className="inline-flex items-center justify-center rounded-full bg-slate-ink text-white"
          style={{ width: size, height: size }}
        >
          <Send size={size * 0.42} />
        </span>
        {showName && 'Automation'}
      </span>
    )
  }
  const p = personById(state, id)
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-600">
      <Avatar name={p.name} size={size} />
      {showName && <span className="truncate">{displayName(p)}</span>}
    </span>
  )
}

const ENTRY_ICON: Record<Entry['kind'], ReactNode> = {
  raise: <Plus size={11} />,
  assign: <Dot size={11} />,
  notify: <Send size={11} />,
  status: <Clock size={11} />,
}

const ENTRY_RING: Record<Entry['kind'], string> = {
  raise: 'bg-[var(--accent-soft)] text-[var(--accent-deep)]',
  assign: 'bg-bone-200 text-slate-500',
  notify: 'bg-[#e8f0fa] text-[#215289]',
  status: 'bg-bone-200 text-slate-600',
}

/** One immutable line of the audit trail. */
export function LedgerRow({
  state,
  entry,
  now,
  dense = false,
}: {
  state: FuaState
  entry: Entry
  now: number
  dense?: boolean
}) {
  const subtask = state.subtasks.find((s) => s.id === entry.subtaskId)
  const ref = subtask?.ref ?? state.fuas.find((f) => f.id === entry.fuaId)?.ref

  return (
    <li className={cn('flex gap-2.5', dense ? 'py-2' : 'py-2.5')}>
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
          ENTRY_RING[entry.kind],
        )}
        aria-hidden="true"
      >
        {ENTRY_ICON[entry.kind]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-[10.5px] font-medium text-[var(--accent-deep)]">
            {ref}
          </span>
          {entry.from && entry.to && (
            <span className="inline-flex items-center gap-1.5">
              <Pill tone={STATUS_TONE[entry.from]}>{entry.from}</Pill>
              <span className="text-slate-400">→</span>
              <Pill tone={STATUS_TONE[entry.to]} dot>
                {entry.to}
              </Pill>
            </span>
          )}
        </div>
        <p className="mt-1 text-[11.5px] leading-snug text-slate-600">
          {entry.note}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10.5px] text-slate-400">
          <Person state={state} id={entry.actor} size={14} />
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(entry.at).toISOString()}>
            {entry.at > now ? stamp(entry.at) : stamp(entry.at)}
          </time>
        </div>
      </div>
    </li>
  )
}
