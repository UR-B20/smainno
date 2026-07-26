import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  AppBtn,
  Avatar,
  Card,
  Empty,
  Modal,
  Pill,
  Select,
  Tabs,
  Textarea,
  useToast,
} from '../shared/kit'
import { makeId } from '@/lib/store'
import { DAY, dowDate, hhmm, shortDate, stamp } from '@/lib/time'
import {
  Alert,
  Check,
  Clipboard,
  Clock,
  Flag,
  Lock,
  Refresh,
  Shield,
  X,
} from '@/components/icons'
import {
  activeSkip,
  checkerById,
  checkerName,
  occState,
  occurrencesOn,
  scoreOf,
  submissionsFor,
  teamById,
  templateById,
  useSc,
} from './store'
import type { Issue, Occurrence } from './store'
import { PhotoTile, ScoreBadge, StateChip, WindowClock } from './bits'
import { RunCheck } from './RunCheck'

type Nav = 'checks' | 'issues' | 'history'

export function CheckerApp({ initialTab }: { initialTab?: Nav }) {
  const { state, now } = useSc()
  const [nav, setNav] = useState<Nav>(initialTab ?? 'checks')
  const [running, setRunning] = useState<Occurrence | null>(null)

  useEffect(() => {
    if (initialTab) setNav(initialTab)
  }, [initialTab])

  const me = checkerById(state, state.currentUser)!
  const team = teamById(state, me.teamId)!

  const openIssues = state.issues.filter(
    (i) => i.teamId === me.teamId && i.status === 'open',
  ).length

  if (running) {
    return <RunCheck occ={running} onExit={() => setRunning(null)} />
  }

  return (
    <div className="flex h-full flex-col bg-bone-100">
      <header className="shrink-0 bg-[var(--accent)] px-4 pt-3 pb-3 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-white/60 uppercase">
              SmartCheck
            </p>
            <p className="mt-0.5 text-[15px] font-semibold">{team.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[11px] font-medium">{me.rank} {me.name}</p>
              <p className="text-[10px] text-white/60">{dowDate(now)}</p>
            </div>
            <Avatar name={me.name} size={30} />
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {nav === 'checks' && <ChecksTab onRun={setRunning} />}
        {nav === 'issues' && <IssuesTab />}
        {nav === 'history' && <HistoryTab />}
      </div>

      <nav className="flex shrink-0 border-t border-bone-300 bg-white">
        {(
          [
            { id: 'checks', label: 'Checks', icon: <Clipboard size={18} /> },
            { id: 'issues', label: 'Issues', icon: <Flag size={18} />, badge: openIssues },
            { id: 'history', label: 'History', icon: <Clock size={18} /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setNav(tab.id)}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
              nav === tab.id ? 'text-[var(--accent)]' : 'text-slate-400',
            )}
          >
            <span className="relative">
              {tab.icon}
              {'badge' in tab && tab.badge > 0 && (
                <span className="numerals absolute -top-1.5 -right-2 rounded-full bg-[#c0392b] px-1 text-[9px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ------------------------------------------------------------ checks tab */

function ChecksTab({ onRun }: { onRun: (occ: Occurrence) => void }) {
  const { state, set, now } = useSc()
  const toast = useToast()
  const me = checkerById(state, state.currentUser)!
  const [skipping, setSkipping] = useState<Occurrence | null>(null)
  const [reason, setReason] = useState('')

  const occs = occurrencesOn(state, now).filter((o) => o.teamId === me.teamId)
  const open = occs.filter((o) => {
    const s = occState(state, o, now)
    return s === 'active' || s === 'in-progress'
  })
  const later = occs.filter((o) => occState(state, o, now) === 'scheduled')
  const closed = occs.filter((o) => {
    const s = occState(state, o, now)
    return s === 'completed' || s === 'missed' || s === 'skipped' || s === 'paused'
  })

  const commitSkip = () => {
    if (!skipping) return
    set((prev) => ({
      ...prev,
      skips: [
        ...prev.skips,
        {
          id: makeId('sk'),
          occurrenceId: skipping.id,
          reason: reason.trim(),
          by: prev.currentUser,
          at: now,
        },
      ],
    }))
    toast('Check skipped', {
      detail: 'Excluded from completion rate. Can be undone inside the window.',
    })
    setSkipping(null)
    setReason('')
  }

  return (
    <div className="space-y-4 p-3">
      <Group title="Open now" hint="Complete before the window closes">
        {open.length === 0 ? (
          <Empty
            icon={<Check size={22} />}
            title="Nothing open"
            body="No check window is active for your team right now."
            className="py-8"
          />
        ) : (
          open.map((o) => (
            <OccCard key={o.id} occ={o} onRun={onRun} onSkip={setSkipping} />
          ))
        )}
      </Group>

      {later.length > 0 && (
        <Group
          title="Later today"
          hint="Issued to your phone — opens only inside its window"
        >
          {later.map((o) => (
            <OccCard key={o.id} occ={o} onRun={onRun} onSkip={setSkipping} />
          ))}
        </Group>
      )}

      {closed.length > 0 && (
        <Group title="Closed out" hint="Every window ends with an outcome">
          {closed.map((o) => (
            <OccCard key={o.id} occ={o} onRun={onRun} onSkip={setSkipping} />
          ))}
        </Group>
      )}

      <Modal
        open={Boolean(skipping)}
        onClose={() => setSkipping(null)}
        width={330}
        title="Skip this check"
        sub="A reason is mandatory."
        footer={
          <>
            <AppBtn variant="ghost" onClick={() => setSkipping(null)}>
              Cancel
            </AppBtn>
            <AppBtn
              variant="primary"
              disabled={reason.trim().length < 8}
              onClick={commitSkip}
            >
              Record skip
            </AppBtn>
          </>
        }
      >
        <Textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why can this check not be done in its window?"
        />
        <p className="mt-2 text-[11px] leading-snug text-slate-500">
          Skips are excluded from completion rates and can be undone while the
          window is still open.
        </p>
      </Modal>
    </div>
  )
}

function Group({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="label text-slate-500">{title}</span>
          <span className="h-px flex-1 bg-bone-300" />
        </div>
        <p className="mt-1 text-[10.5px] text-slate-400">{hint}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function OccCard({
  occ,
  onRun,
  onSkip,
}: {
  occ: Occurrence
  onRun: (occ: Occurrence) => void
  onSkip: (occ: Occurrence) => void
}) {
  const { state, set, now } = useSc()
  const toast = useToast()
  const template = templateById(state, occ.templateId)!
  const st = occState(state, occ, now)
  const subs = submissionsFor(state, occ.id)
  const skip = activeSkip(state, occ.id)
  const issues = state.issues.filter((i) => i.occurrenceId === occ.id)
  const draft = state.drafts[occ.id]

  const canAct = st === 'active' || st === 'in-progress'
  const canRedo = st === 'completed' && now <= occ.endAt

  const undoSkip = () => {
    if (!skip) return
    set((prev) => ({
      ...prev,
      skips: prev.skips.map((s) =>
        s.id === skip.id ? { ...s, undoneAt: now } : s,
      ),
    }))
    toast('Skip undone — the window is still open')
  }

  return (
    <Card
      className={cn(
        'overflow-hidden',
        st === 'missed' && 'border-[#c0392b]/35',
        st === 'active' && 'border-[#d99320]/45',
      )}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12.5px] leading-snug font-semibold text-slate-ink">
              {template.name}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-slate-400">
              {template.code} v{template.version}
            </p>
          </div>
          <StateChip state={st} />
        </div>

        <div className="mt-2">
          <WindowClock occ={occ} state={st} now={now} />
        </div>

        {draft && canAct && (
          <p className="mt-1.5 text-[10.5px] text-[#8a5a12]">
            Draft in progress · {draft.answers.length} answered
          </p>
        )}

        {skip && (
          <div className="mt-2 rounded-sm border border-bone-300 bg-bone-50 p-2">
            <p className="label text-slate-400">Skip reason</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-600">
              {skip.reason}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              {checkerName(state, skip.by)} · {stamp(skip.at)}
            </p>
          </div>
        )}

        {st === 'missed' && (
          <p className="mt-2 flex items-start gap-1.5 rounded-sm bg-[#fbeae8] px-2 py-1.5 text-[10.5px] leading-snug text-[#a3302a]">
            <Alert size={11} className="mt-px shrink-0" />
            Finalised automatically when the window closed. No submission was
            made.
          </p>
        )}

        {subs.length > 0 && (
          <div className="mt-2 space-y-1">
            {subs.map((s) => {
              const { score, max } = scoreOf(template, s.answers)
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-sm bg-bone-50 px-2 py-1.5"
                >
                  <span className="text-[10.5px] text-slate-500">
                    Record #{s.seq} · {hhmm(s.at)} · {checkerName(state, s.by)}
                  </span>
                  <ScoreBadge score={score} max={max} />
                </div>
              )
            })}
          </div>
        )}

        {issues.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-[10.5px] font-semibold text-[#a3302a]">
            <Flag size={11} /> {issues.length} issue
            {issues.length === 1 ? '' : 's'} raised on this check
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-bone-200 bg-bone-50 px-3 py-2">
        {st === 'scheduled' && (
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock size={12} /> Opens at {hhmm(occ.startAt)}
          </span>
        )}
        {st === 'paused' && (
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock size={12} /> Schedule paused by the administrator
          </span>
        )}
        {canAct && (
          <>
            <AppBtn variant="primary" size="sm" onClick={() => onRun(occ)}>
              {draft ? 'Continue check' : 'Start check'}
            </AppBtn>
            <AppBtn variant="ghost" size="sm" onClick={() => onSkip(occ)}>
              Skip…
            </AppBtn>
          </>
        )}
        {canRedo && (
          <AppBtn variant="secondary" size="sm" onClick={() => onRun(occ)}>
            <Refresh size={12} /> Redo before deadline
          </AppBtn>
        )}
        {st === 'skipped' && now <= occ.endAt && (
          <AppBtn variant="secondary" size="sm" onClick={undoSkip}>
            Undo skip
          </AppBtn>
        )}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------ issues tab */

function IssuesTab() {
  const { state, set, now } = useSc()
  const toast = useToast()
  const me = checkerById(state, state.currentUser)!
  const [tab, setTab] = useState<'open' | 'resolved'>('open')
  const [detail, setDetail] = useState<Issue | null>(null)
  const [note, setNote] = useState('')
  const [label, setLabel] = useState('Rectified on site')

  const mine = state.issues.filter((i) => i.teamId === me.teamId)
  const rows = mine
    .filter((i) => i.status === tab)
    .sort((a, b) => b.raisedAt - a.raisedAt)

  const current = detail ? state.issues.find((i) => i.id === detail.id) ?? null : null

  const resolve = () => {
    if (!current) return
    set((prev) => ({
      ...prev,
      issues: prev.issues.map((i) =>
        i.id === current.id
          ? {
              ...i,
              status: 'resolved' as const,
              resolutionLabel: label,
              history: [
                ...i.history,
                {
                  at: now,
                  by: prev.currentUser,
                  note: note.trim() || label,
                  kind: 'resolved' as const,
                },
              ],
            }
          : i,
      ),
    }))
    toast('Issue resolved', { tone: 'ok', detail: 'History is kept in full.' })
    setDetail(null)
    setNote('')
  }

  const addUpdate = () => {
    if (!current || note.trim().length < 3) return
    set((prev) => ({
      ...prev,
      issues: prev.issues.map((i) =>
        i.id === current.id
          ? {
              ...i,
              history: [
                ...i.history,
                { at: now, by: prev.currentUser, note: note.trim(), kind: 'update' as const },
              ],
            }
          : i,
      ),
    }))
    toast('Finding added')
    setNote('')
  }

  return (
    <div className="p-3">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          {
            value: 'open',
            label: 'Open',
            count: mine.filter((i) => i.status === 'open').length,
            tone: 'danger',
          },
          {
            value: 'resolved',
            label: 'Resolved',
            count: mine.filter((i) => i.status === 'resolved').length,
          },
        ]}
        className="mb-3"
      />

      {rows.length === 0 ? (
        <Empty
          icon={<Shield size={22} />}
          title={tab === 'open' ? 'No open issues' : 'Nothing resolved yet'}
          body={
            tab === 'open'
              ? 'The badge clears when the last open issue is closed.'
              : 'Resolved issues keep their full history here.'
          }
          className="py-10"
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((i) => {
            const template = templateById(state, i.templateId)
            return (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => {
                    setDetail(i)
                    setNote('')
                  }}
                  className="w-full rounded-md border border-bone-300 bg-white p-3 text-left active:bg-bone-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Pill tone="muted">{i.category}</Pill>
                        {i.status === 'resolved' && (
                          <Pill tone="ok" dot>
                            {i.resolutionLabel}
                          </Pill>
                        )}
                      </div>
                      <p className="mt-1.5 text-[12px] leading-snug font-semibold text-slate-ink">
                        {i.itemLabel}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-slate-400">
                        {template?.code} · answered “{i.answer}”
                      </p>
                    </div>
                    {i.photos.length > 0 && (
                      <span className="flex shrink-0 items-center gap-1 rounded-sm bg-bone-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {i.photos.length} photo{i.photos.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-slate-600">
                    {i.remarks}
                  </p>
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    {checkerName(state, i.raisedBy)} · {stamp(i.raisedAt)}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        open={Boolean(current)}
        onClose={() => setDetail(null)}
        width={340}
        title={current?.itemLabel ?? ''}
        sub={current ? `${current.category} · answered “${current.answer}”` : ''}
        footer={
          current?.status === 'open' ? (
            <>
              <AppBtn variant="ghost" onClick={addUpdate} disabled={note.trim().length < 3}>
                Add finding
              </AppBtn>
              <AppBtn variant="primary" onClick={resolve}>
                Resolve
              </AppBtn>
            </>
          ) : (
            <AppBtn variant="ghost" onClick={() => setDetail(null)}>
              Close
            </AppBtn>
          )
        }
      >
        {current && (
          <div className="space-y-3">
            <p className="text-[12px] leading-relaxed text-slate-700">
              {current.remarks}
            </p>

            {current.photos.length > 0 && (
              <div>
                <span className="label text-slate-400">Evidence</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {current.photos.map((p) => (
                    <PhotoTile key={p.id} photo={p} size={62} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="label text-slate-400">History</span>
              <ul className="mt-1.5 space-y-2 border-l border-bone-300 pl-3">
                {current.history.map((h, idx) => (
                  <li key={idx} className="relative">
                    <span
                      className={cn(
                        'absolute top-1 -left-[15px] h-2 w-2 rounded-full',
                        h.kind === 'resolved' ? 'bg-[#2f9169]' : h.kind === 'raised' ? 'bg-[#c0392b]' : 'bg-slate-400',
                      )}
                    />
                    <p className="text-[11.5px] leading-snug text-slate-700">{h.note}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {checkerName(state, h.by)} · {stamp(h.at)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {current.status === 'open' && (
              <div className="space-y-2 border-t border-bone-200 pt-3">
                <Textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="New finding, or what you did to resolve it"
                />
                <label className="block">
                  <span className="label mb-1 block text-slate-400">
                    Resolution label
                  </span>
                  <Select value={label} onChange={(e) => setLabel(e.target.value)}>
                    <option>Rectified on site</option>
                    <option>Replaced part</option>
                    <option>Escalated to higher</option>
                    <option>No fault found</option>
                    <option>Deferred with approval</option>
                  </Select>
                </label>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ----------------------------------------------------------- history tab */

function HistoryTab() {
  const { state, now } = useSc()
  const me = checkerById(state, state.currentUser)!

  const days = useMemo(
    () => Array.from({ length: 8 }, (_, i) => now - i * DAY),
    [now],
  )

  return (
    <div className="space-y-4 p-3">
      <p className="px-1 text-[11px] leading-snug text-slate-500">
        Evidence log — every window your team has run, with each submission kept
        as its own timestamped record.
      </p>
      {days.map((d) => {
        const occs = occurrencesOn(state, d).filter((o) => o.teamId === me.teamId)
        if (!occs.length) return null
        return (
          <section key={d}>
            <div className="mb-1.5 flex items-center gap-2 px-1">
              <span className="label text-slate-500">{dowDate(d)}</span>
              <span className="h-px flex-1 bg-bone-300" />
              <span className="text-[10px] text-slate-400">{shortDate(d)}</span>
            </div>
            <ul className="space-y-1.5">
              {occs.map((o) => {
                const st = occState(state, o, now)
                const template = templateById(state, o.templateId)!
                const subs = submissionsFor(state, o.id)
                return (
                  <li
                    key={o.id}
                    className="rounded-md border border-bone-300 bg-white px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11.5px] font-medium text-slate-ink">
                        {template.name}
                      </span>
                      <StateChip state={st} />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {hhmm(o.startAt)}–{hhmm(o.endAt)}
                      </span>
                      {subs.length > 0 && (
                        <span className="text-[10px] text-slate-400">
                          {subs.length} record{subs.length === 1 ? '' : 's'} ·
                          last {hhmm(subs[subs.length - 1].at)}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      <p className="flex items-center justify-center gap-1.5 py-2 text-[10px] text-slate-400">
        <X size={10} /> Append-only — records cannot be edited or removed.
      </p>
    </div>
  )
}
