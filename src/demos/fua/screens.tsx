import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  AppBtn,
  Bar,
  Card,
  CardHead,
  Empty,
  Input,
  KPI,
  Pill,
  Select,
  Tabs,
} from '../shared/kit'
import {
  Alert,
  Check,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Search,
} from '@/components/icons'
import { shortDate, stamp } from '@/lib/time'
import {
  displayName,
  fuaStatus,
  isOverdue,
  kpis,
  needsAttention,
  personById,
  progressOf,
  recentLog,
  STATUSES,
  subtasksOf,
  useFua,
} from './store'
import type { Status, Subtask } from './store'
import {
  DueCell,
  LedgerRow,
  Person,
  PriorityMark,
  StatusPill,
  urgencyEdge,
} from './bits'

/* ============================================================ SCREEN 01 */

export function Overview({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, now } = useFua()
  const k = kpis(state, now)
  const attention = needsAttention(state, now)
  const ledger = recentLog(state, 24)

  // Narrow: the screen itself scrolls. Wide: the panes scroll independently.
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto @3xl:overflow-hidden">
      <div>
        <h1 className="text-[19px] font-semibold text-slate-ink">Overview</h1>
        <p className="mt-0.5 text-[12px] text-slate-500">
          A dashboard, not a launcher. The numbers that matter, what is slipping,
          and who did what — without opening anything.
        </p>
      </div>

      {/* A — at-a-glance KPIs */}
      <div className="grid grid-cols-2 gap-2.5 @2xl:grid-cols-4 @3xl:flex @3xl:gap-3">
        <KPI value={k.open} label="Open FUAs" tone="accent" hint="Not yet rolled up to Completed" />
        <KPI value={k.dueSoon} label="Due in 7 days" tone="warn" hint="Subtasks approaching their date" />
        <KPI value={k.overdue} label="Overdue" tone="danger" hint="Past due and not complete" />
        <KPI value={k.completed} label="Completed" tone="ok" hint="Every subtask closed" />
      </div>

      <div className="grid gap-4 @3xl:min-h-0 @3xl:flex-1 @3xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* B — needs attention */}
        <Card className="flex flex-col @3xl:min-h-0">
          <CardHead
            title="Needs attention"
            sub="Overdue and blocked subtasks, triaged into one list"
            right={
              <Pill tone={attention.length ? 'danger' : 'ok'} dot>
                {attention.length} item{attention.length === 1 ? '' : 's'}
              </Pill>
            }
          />
          <div className="max-h-[420px] overflow-y-auto @3xl:max-h-none @3xl:min-h-0 @3xl:flex-1">
            {attention.length === 0 ? (
              <Empty
                icon={<Check size={26} />}
                title="Nothing overdue or blocked"
                body="Every subtask is either on time or already closed."
              />
            ) : (
              <ul className="divide-y divide-bone-200">
                {attention.map((s) => {
                  const fua = state.fuas.find((f) => f.id === s.fuaId)!
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => onOpen(s.id)}
                        className={cn(
                          'relative w-full px-4 py-3 pl-5 text-left transition-colors hover:bg-bone-50',
                          'before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full',
                          urgencyEdge(s, now),
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10.5px] font-medium text-[var(--accent-deep)]">
                                {s.ref}
                              </span>
                              <StatusPill status={s.status} />
                            </div>
                            <p className="mt-1 text-[12.5px] leading-snug font-medium text-slate-ink">
                              {s.title}
                            </p>
                            <p className="mt-1 truncate text-[11px] text-slate-400">
                              {fua.ref} · {fua.title}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <DueCell dueAt={s.dueAt} now={now} done={false} />
                            <Person state={state} id={s.assignee} size={18} />
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Card>

        {/* C — live activity ledger */}
        <Card className="flex flex-col @3xl:min-h-0">
          <CardHead
            title="Activity"
            sub="Straight from the immutable update log"
            right={<span className="label text-slate-400">Newest first</span>}
          />
          <div className="max-h-[420px] overflow-y-auto px-4 @3xl:max-h-none @3xl:min-h-0 @3xl:flex-1">
            <ul className="divide-y divide-bone-200">
              {ledger.map((e) => (
                <LedgerRow key={e.id} state={state} entry={e} now={now} dense />
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ============================================================ SCREEN 02 */

const TAB_ORDER: (Status | 'All')[] = ['All', ...STATUSES]

export function MySubtasks({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, now } = useFua()
  const [tab, setTab] = useState<Status | 'All'>('All')

  const mine = useMemo(
    () =>
      state.subtasks
        .filter((s) => s.assignee === state.currentUser)
        .sort((a, b) => {
          const rank = (s: Subtask) =>
            s.status === 'Completed' ? 2 : isOverdue(s, now) ? 0 : 1
          return rank(a) - rank(b) || a.dueAt - b.dueAt
        }),
    [state.subtasks, state.currentUser, now],
  )

  const counts = (s: Status | 'All') =>
    s === 'All' ? mine.length : mine.filter((t) => t.status === s).length

  const rows = tab === 'All' ? mine : mine.filter((s) => s.status === tab)
  const me = personById(state, state.currentUser)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto @3xl:overflow-hidden">
      <div className="flex flex-col gap-2 @2xl:flex-row @2xl:items-end @2xl:justify-between @2xl:gap-4">
        <div>
          <h1 className="text-[19px] font-semibold text-slate-ink">My subtasks</h1>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Your personal work queue — {displayName(me)}. A red edge means overdue,
            amber means due within seven days.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-[3px] rounded-full bg-[#c0392b]" /> Overdue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-[3px] rounded-full bg-[#d99320]" /> Due in 7d
          </span>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={TAB_ORDER.map((t) => ({
          value: t,
          label: t,
          count: counts(t),
          tone: t === 'Blocked' ? ('danger' as const) : undefined,
        }))}
      />

      <div className="@3xl:min-h-0 @3xl:flex-1 @3xl:overflow-y-auto">
        {rows.length === 0 ? (
          <Empty
            icon={<Clipboard size={26} />}
            title="Nothing here"
            body={
              tab === 'All'
                ? 'No subtasks are assigned to you. Switch role in the toolbar above to see another queue.'
                : `You have no subtasks in "${tab}".`
            }
          />
        ) : (
          <ul className="space-y-2">
            {rows.map((s) => {
              const fua = state.fuas.find((f) => f.id === s.fuaId)!
              const done = s.status === 'Completed'
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(s.id)}
                    className={cn(
                      'relative w-full rounded-md border border-bone-300 bg-white px-4 py-3 pl-5 text-left transition-all hover:border-[var(--accent)]/50 hover:shadow-[0_2px_10px_-4px_rgba(18,25,39,0.18)]',
                      'before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full',
                      urgencyEdge(s, now),
                      done && 'opacity-70',
                    )}
                  >
                    <div className="flex flex-col gap-2.5 @xl:flex-row @xl:items-start @xl:justify-between @xl:gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10.5px] font-medium text-[var(--accent-deep)]">
                            {s.ref}
                          </span>
                          <StatusPill status={s.status} />
                          <PriorityMark priority={s.priority} />
                        </div>
                        <p
                          className={cn(
                            'mt-1.5 text-[13px] leading-snug font-medium text-slate-ink',
                            done && 'line-through decoration-slate-300',
                          )}
                        >
                          {s.title}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-slate-400">
                          {fua.ref} · {fua.title}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 @xl:flex-col @xl:items-end @xl:gap-2">
                        <DueCell dueAt={s.dueAt} now={now} done={done} />
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-deep)]">
                          Post update <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ============================================================== REGISTER */

export function Register({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, now } = useFua()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Status | 'All'>('All')
  const [expanded, setExpanded] = useState<string[]>(['f2'])

  const toggle = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const rows = state.fuas
    .filter((f) => {
      if (filter !== 'All' && fuaStatus(state, f.id) !== filter) return false
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        f.title.toLowerCase().includes(q) ||
        f.ref.toLowerCase().includes(q) ||
        f.meeting.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => a.dueAt - b.dueAt)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto @3xl:overflow-hidden">
      <div>
        <h1 className="text-[19px] font-semibold text-slate-ink">FUA register</h1>
        <p className="mt-0.5 text-[12px] text-slate-500">
          One register for every action. Parent status is calculated from its
          subtasks — it is never typed in.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full @2xl:w-72">
          <Search
            size={14}
            className="absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, title or meeting"
            className="pl-8"
          />
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Status | 'All')}
          className="w-44 shrink-0"
        >
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <span className="ml-auto hidden text-[11px] text-slate-400 @xl:inline">
          {rows.length} of {state.fuas.length} FUAs
        </span>
      </div>

      <div className="space-y-2 @3xl:min-h-0 @3xl:flex-1 @3xl:overflow-y-auto">
        {rows.map((f) => {
          const subs = subtasksOf(state, f.id)
          const status = fuaStatus(state, f.id)
          const pct = progressOf(state, f.id)
          const open = expanded.includes(f.id)
          const overdueCount = subs.filter((s) => isOverdue(s, now)).length

          return (
            <Card key={f.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(f.id)}
                aria-expanded={open}
                className="flex w-full flex-col gap-3 px-4 py-3 text-left transition-colors hover:bg-bone-50 @2xl:flex-row @2xl:items-start"
              >
                <span className="hidden text-slate-400 @2xl:mt-0.5 @2xl:block">
                  {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-medium text-[var(--accent-deep)]">
                      {f.ref}
                    </span>
                    <StatusPill status={status} />
                    <Pill tone="muted">roll-up</Pill>
                    <PriorityMark priority={f.priority} />
                    {overdueCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#a3302a]">
                        <Alert size={11} /> {overdueCount} overdue
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug font-medium text-slate-ink">
                    {f.title}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    From {f.meeting} · {shortDate(f.meetingAt)} · raised by{' '}
                    {displayName(personById(state, f.raisedBy))}
                  </p>
                </div>
                <div className="shrink-0 @2xl:w-44">
                  <div className="mb-1.5 flex items-center justify-between text-[10.5px] text-slate-500">
                    <span>
                      {subs.filter((s) => s.status === 'Completed').length}/
                      {subs.length} subtasks
                    </span>
                    <span className="numerals font-semibold">{pct}%</span>
                  </div>
                  <Bar
                    value={pct}
                    tone={status === 'Blocked' ? 'danger' : status === 'Completed' ? 'ok' : 'accent'}
                  />
                  <div className="mt-2 text-right">
                    <DueCell
                      dueAt={f.dueAt}
                      now={now}
                      done={status === 'Completed'}
                    />
                  </div>
                </div>
              </button>

              {open && (
                <div className="border-t border-bone-200 bg-bone-50">
                  {f.detail && (
                    <p className="border-b border-bone-200 px-4 py-2.5 text-[11.5px] leading-relaxed text-slate-600">
                      {f.detail}
                    </p>
                  )}
                  {/* Wide: a table. Narrow: the same rows as cards, because a
                      six-column table on a phone is a horizontal-scroll trap. */}
                  <table className="hidden w-full text-[12px] @3xl:table">
                    <thead>
                      <tr className="text-left text-slate-400">
                        <th className="px-4 py-2 label font-medium">Ref</th>
                        <th className="px-2 py-2 label font-medium">Subtask</th>
                        <th className="px-2 py-2 label font-medium">Assignee</th>
                        <th className="px-2 py-2 label font-medium">Due</th>
                        <th className="px-2 py-2 label font-medium">Status</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bone-200">
                      {subs.map((s) => (
                        <tr key={s.id} className="hover:bg-white">
                          <td className="px-4 py-2 font-mono text-[10.5px] text-slate-500">
                            {s.ref}
                          </td>
                          <td className="px-2 py-2 text-slate-ink">{s.title}</td>
                          <td className="px-2 py-2">
                            <Person state={state} id={s.assignee} size={18} />
                          </td>
                          <td className="px-2 py-2">
                            <DueCell
                              dueAt={s.dueAt}
                              now={now}
                              done={s.status === 'Completed'}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <StatusPill status={s.status} />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <AppBtn
                              size="sm"
                              variant="ghost"
                              onClick={() => onOpen(s.id)}
                            >
                              Open
                            </AppBtn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <ul className="divide-y divide-bone-200 @3xl:hidden">
                    {subs.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => onOpen(s.id)}
                          className="w-full px-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] text-slate-500">
                              {s.ref}
                            </span>
                            <StatusPill status={s.status} />
                          </div>
                          <p className="mt-1.5 text-[12.5px] leading-snug text-slate-ink">
                            {s.title}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <Person state={state} id={s.assignee} size={16} />
                            <DueCell
                              dueAt={s.dueAt}
                              now={now}
                              done={s.status === 'Completed'}
                            />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )
        })}
        {rows.length === 0 && (
          <Empty
            icon={<Search size={26} />}
            title="No FUAs match"
            body="Try a different search or clear the status filter."
          />
        )}
      </div>
    </div>
  )
}

/* ============================================================== ACTIVITY */

export function Activity() {
  const { state, now } = useFua()
  const [kind, setKind] = useState<'all' | 'status' | 'raise' | 'notify'>('all')

  const entries = recentLog(state, 500).filter((e) =>
    kind === 'all' ? true : kind === 'raise' ? e.kind === 'raise' || e.kind === 'assign' : e.kind === kind,
  )

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto @3xl:overflow-hidden">
      <div className="flex flex-col gap-2 @2xl:flex-row @2xl:items-end @2xl:justify-between @2xl:gap-4">
        <div>
          <h1 className="text-[19px] font-semibold text-slate-ink">Audit trail</h1>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Every entry ever appended, across every FUA. Nothing in this list can
            be edited or removed.
          </p>
        </div>
        <Select
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
          className="w-52"
        >
          <option value="all">All entry types</option>
          <option value="status">Status updates</option>
          <option value="raise">Raised & assigned</option>
          <option value="notify">Teams notifications</option>
        </Select>
      </div>

      <Card className="flex flex-col @3xl:min-h-0 @3xl:flex-1">
        <CardHead
          title={`${entries.length} entries`}
          sub="Append-only · newest first"
          right={
            <span className="font-mono text-[10.5px] text-slate-400">
              as at {stamp(now)}
            </span>
          }
        />
        <div className="max-h-[520px] overflow-y-auto px-4 @3xl:max-h-none @3xl:min-h-0 @3xl:flex-1">
          <ul className="divide-y divide-bone-200">
            {entries.map((e) => (
              <LedgerRow key={e.id} state={state} entry={e} now={now} />
            ))}
          </ul>
        </div>
      </Card>
    </div>
  )
}
