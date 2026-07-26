import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { AppBtn, Modal, Pill, useToast } from '../shared/kit'
import { Lock, Alert } from '@/components/icons'
import { shortDate, stamp } from '@/lib/time'
import {
  actorName,
  displayName,
  logFor,
  personById,
  postUpdate,
  rollUp,
  STATUSES,
  subtasksOf,
  useFua,
} from './store'
import type { Status } from './store'
import { DueCell, LedgerRow, PriorityMark, STATUS_TONE } from './bits'

/**
 * Screen 03 — the one thing everybody does.
 *
 * The tasking panel on the left is locked: context you read, never edit. The
 * right side is the only writable surface in the app, and what it does is
 * *append*. Nothing here overwrites anything.
 */
export function UpdateDrawer({
  subtaskId,
  onClose,
}: {
  subtaskId: string | null
  onClose: () => void
}) {
  const { state, set, now } = useFua()
  const toast = useToast()

  const subtask = state.subtasks.find((s) => s.id === subtaskId) ?? null
  const [to, setTo] = useState<Status>('In Progress')
  const [note, setNote] = useState('')

  // Reset the form when a different subtask opens, or when its stored status
  // moves underneath us — but never on an unrelated store update, which would
  // wipe a note mid-sentence.
  const storedStatus = subtask?.status
  useEffect(() => {
    if (!storedStatus) return
    setTo(storedStatus)
    setNote('')
  }, [subtaskId, storedStatus])

  const trail = useMemo(
    () => (subtask ? logFor(state, subtask.id) : []),
    [state, subtask],
  )
  const lastEntry = trail[trail.length - 1]

  if (!subtask) return null

  const fua = state.fuas.find((f) => f.id === subtask.fuaId)!
  const assignee = personById(state, subtask.assignee)
  const isMine = subtask.assignee === state.currentUser
  const changed = to !== subtask.status
  const canCommit = isMine && note.trim().length > 0

  // What the parent will roll up to once this update lands.
  const projectedParent = rollUp(
    subtasksOf(state, subtask.fuaId).map((s) =>
      s.id === subtask.id ? { ...s, status: to } : s,
    ),
  )
  const currentParent = rollUp(subtasksOf(state, subtask.fuaId))

  const commit = () => {
    set((prev) => postUpdate(prev, { subtaskId: subtask.id, to, note: note.trim(), at: now }))
    toast('Update appended to the audit trail', {
      tone: 'ok',
      detail:
        projectedParent === currentParent
          ? `${subtask.ref} → ${to}`
          : `${subtask.ref} → ${to}. ${fua.ref} rolled up to ${projectedParent}.`,
    })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={860}
      title="Post an update"
      sub={`${subtask.ref} · the record keeps itself`}
      footer={
        <>
          <span className="mr-auto flex items-center gap-1.5 text-[11px] text-slate-500">
            <Lock size={12} />
            Appended as a new timestamped record — nothing is overwritten.
          </span>
          <AppBtn variant="ghost" onClick={onClose}>
            Cancel
          </AppBtn>
          <AppBtn variant="primary" disabled={!canCommit} onClick={commit}>
            Append update
          </AppBtn>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* ------------------------------------------------ A · locked context */}
        <section className="rounded-md border border-bone-300 bg-bone-50">
          <header className="flex items-center justify-between border-b border-bone-200 px-3 py-2">
            <span className="label text-slate-500">Tasking</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
              <Lock size={11} /> Locked
            </span>
          </header>
          <dl className="divide-y divide-bone-200 text-[12px]">
            <div className="px-3 py-2">
              <dt className="label text-slate-400">Reference</dt>
              <dd className="mt-1 font-mono text-[12px] font-medium text-[var(--accent-deep)]">
                {subtask.ref}
              </dd>
            </div>
            <div className="px-3 py-2">
              <dt className="label text-slate-400">Subtask</dt>
              <dd className="mt-1 leading-snug text-slate-ink">{subtask.title}</dd>
            </div>
            <div className="px-3 py-2">
              <dt className="label text-slate-400">Parent FUA</dt>
              <dd className="mt-1 leading-snug text-slate-600">
                <span className="font-mono text-[11px] text-slate-500">{fua.ref}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                {fua.title}
              </dd>
            </div>
            <div className="grid grid-cols-2 divide-x divide-bone-200">
              <div className="px-3 py-2">
                <dt className="label text-slate-400">Due</dt>
                <dd className="mt-1">
                  <DueCell
                    dueAt={subtask.dueAt}
                    now={now}
                    done={subtask.status === 'Completed'}
                  />
                  <div className="mt-0.5 text-[10.5px] text-slate-400">
                    {shortDate(subtask.dueAt)}
                  </div>
                </dd>
              </div>
              <div className="px-3 py-2">
                <dt className="label text-slate-400">Priority</dt>
                <dd className="mt-1.5">
                  <PriorityMark priority={subtask.priority} />
                </dd>
              </div>
            </div>
            <div className="px-3 py-2">
              <dt className="label text-slate-400">Assignee</dt>
              <dd className="mt-1 text-slate-600">{displayName(assignee)}</dd>
            </div>
            <div className="bg-white px-3 py-2">
              <dt className="label text-slate-400">Last entry</dt>
              {lastEntry ? (
                <dd className="mt-1.5">
                  <p className="leading-snug text-slate-700">{lastEntry.note}</p>
                  <p className="mt-1 text-[10.5px] text-slate-400">
                    {actorName(state, lastEntry.actor)} · {stamp(lastEntry.at)}
                  </p>
                </dd>
              ) : (
                <dd className="mt-1.5 text-[11.5px] text-slate-400">
                  No entries yet.
                </dd>
              )}
            </div>
          </dl>
        </section>

        {/* -------------------------------------------- B · the writable side */}
        <section className="flex flex-col gap-4">
          {!isMine && (
            <div className="flex items-start gap-2 rounded-md border border-[#8a5a12]/25 bg-[#fdf1de] px-3 py-2.5 text-[11.5px] leading-snug text-[#8a5a12]">
              <Alert size={14} className="mt-px shrink-0" />
              <span>
                This subtask is assigned to {displayName(assignee)}. You only ever
                post your own updates — that is what keeps the roll-up honest. The
                trail below is read-only for you.
              </span>
            </div>
          )}

          <div>
            <span className="label mb-2 block text-slate-500">
              Status in, status out
            </span>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => {
                const active = s === to
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={!isMine}
                    onClick={() => setTo(s)}
                    className={cn(
                      'flex items-center gap-2 rounded-sm border px-2.5 py-2 text-left text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] font-medium text-[var(--accent-deep)]'
                        : 'border-bone-300 bg-white text-slate-600 hover:border-[var(--accent)]/50',
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        s === 'Completed'
                          ? 'bg-[#2f9169]'
                          : s === 'Blocked'
                            ? 'bg-[#c0392b]'
                            : s === 'In Progress'
                              ? 'bg-[#2f7fc4]'
                              : 'bg-slate-400',
                      )}
                    />
                    {s}
                  </button>
                )
              })}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-sm border border-dashed border-bone-300 bg-bone-50 px-3 py-2">
              <span className="label text-slate-400">Transition</span>
              <Pill tone={STATUS_TONE[subtask.status]}>{subtask.status}</Pill>
              <span className="text-slate-400">→</span>
              <Pill tone={STATUS_TONE[to]} dot>
                {to}
              </Pill>
              {!changed && (
                <span className="text-[11px] text-slate-400">
                  (no change — a note-only update is still recorded)
                </span>
              )}
            </div>

            {projectedParent !== currentParent && (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-sm border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-2 text-[11.5px] text-[var(--accent-deep)]">
                <span className="label">Roll-up</span>
                <span className="font-mono text-[11px]">{fua.ref}</span>
                <Pill tone={STATUS_TONE[currentParent]}>{currentParent}</Pill>
                <span>→</span>
                <Pill tone={STATUS_TONE[projectedParent]} dot>
                  {projectedParent}
                </Pill>
                <span className="w-full text-[11px] opacity-80">
                  Recalculated from the subtasks. Nobody sets this by hand.
                </span>
              </div>
            )}
          </div>

          <label className="block">
            <span className="label mb-2 block text-slate-500">
              Your update {isMine && <span className="text-[#c0392b]">*</span>}
            </span>
            <textarea
              rows={4}
              disabled={!isMine}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                to === 'Blocked'
                  ? 'What is blocking it, and what would unblock it?'
                  : 'What changed since the last entry?'
              }
              className="w-full resize-y rounded-sm border border-bone-300 bg-white px-2.5 py-2 text-[12.5px] leading-relaxed text-slate-ink placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 focus:outline-none disabled:bg-bone-100"
            />
          </label>
        </section>
      </div>

      {/* ------------------------------------------- C · append, never overwrite */}
      <section className="mt-5 rounded-md border border-bone-300 bg-white">
        <header className="flex items-center justify-between border-b border-bone-200 px-3 py-2">
          <span className="label text-slate-500">
            Audit trail · {trail.length} {trail.length === 1 ? 'entry' : 'entries'}
          </span>
          <span className="text-[10.5px] text-slate-400">
            Append-only · oldest first
          </span>
        </header>
        <ul className="divide-y divide-bone-200 px-3">
          {trail.map((e) => (
            <LedgerRow key={e.id} state={state} entry={e} now={now} dense />
          ))}
        </ul>
      </section>
    </Modal>
  )
}
