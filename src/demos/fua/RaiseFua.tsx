import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  AppBtn,
  Field,
  Input,
  Pill,
  RequirementList,
  Select,
  Textarea,
  useToast,
} from '../shared/kit'
import { Check, Lock, Plus, Trash, Send } from '@/components/icons'
import { dateInputValue, fromDateInput, MINUTE, shortDate } from '@/lib/time'
import { makeId } from '@/lib/store'
import { displayName, PRIORITIES, useFua } from './store'
import type { Entry, Fua, Priority, Subtask } from './store'
import { PriorityMark } from './bits'

/**
 * Screen 04 — raise an FUA.
 *
 * Laid out like a work order: numbered sections, a live "before you commit"
 * checklist on the right, and a commit button that stays locked until the
 * checklist is satisfied. The reference number is assigned on commit — there is
 * no field for it, because there is no manual numbering to get wrong.
 */

interface DraftSub {
  key: string
  title: string
  assignee: string
  due: string
  priority: Priority
}

function SectionBlock({
  index,
  title,
  sub,
  children,
}: {
  index: string
  title: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-bone-200 px-5 py-4 last:border-b-0">
      <header className="mb-3 flex items-baseline gap-3">
        <span className="label text-[var(--accent)]">{index}</span>
        <div>
          <h3 className="text-[13px] font-semibold text-slate-ink">{title}</h3>
          {sub && <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

export function RaiseFua({ onDone }: { onDone: () => void }) {
  const { state, set, now } = useFua()
  const toast = useToast()

  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [meeting, setMeeting] = useState('')
  const [meetingDate, setMeetingDate] = useState(dateInputValue(now))
  const [priority, setPriority] = useState<Priority>('Medium')
  const [due, setDue] = useState('')
  const [subs, setSubs] = useState<DraftSub[]>([
    { key: makeId('d'), title: '', assignee: '', due: '', priority: 'Medium' },
  ])

  const nextRef = `FUA-2026-${String(state.nextRef).padStart(3, '0')}`

  const step1Checks = useMemo(
    () => [
      { label: 'Action title stated', met: title.trim().length > 3 },
      { label: 'Meeting or conference named', met: meeting.trim().length > 2 },
      { label: 'Meeting date set', met: Boolean(meetingDate) },
      { label: 'Priority selected', met: Boolean(priority) },
      { label: 'Due date set', met: Boolean(due) },
    ],
    [title, meeting, meetingDate, priority, due],
  )

  const validSubs = subs.filter(
    (s) => s.title.trim().length > 3 && s.assignee && s.due,
  )

  const step2Checks = [
    { label: 'At least one subtask assigned', met: validSubs.length > 0 },
    {
      label: 'Every subtask has an owner and a due date',
      met: subs.every((s) => !s.title.trim() || (s.assignee && s.due)),
    },
  ]

  const step1Ready = step1Checks.every((c) => c.met)
  const step2Ready = step1Ready && step2Checks.every((c) => c.met)

  const addSub = () =>
    setSubs((prev) => [
      ...prev,
      { key: makeId('d'), title: '', assignee: '', due: '', priority: 'Medium' },
    ])

  const patchSub = (key: string, patch: Partial<DraftSub>) =>
    setSubs((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)))

  const removeSub = (key: string) =>
    setSubs((prev) => (prev.length === 1 ? prev : prev.filter((s) => s.key !== key)))

  const commit = () => {
    const fuaId = makeId('f')
    const ref = nextRef
    const dueAt = fromDateInput(due) ?? now
    const meetingAt = fromDateInput(meetingDate, 9) ?? now

    const fua: Fua = {
      id: fuaId,
      ref,
      title: title.trim(),
      detail: detail.trim(),
      meeting: meeting.trim(),
      meetingAt,
      raisedBy: state.currentUser,
      priority,
      dueAt,
      createdAt: now,
    }

    const created: Subtask[] = validSubs.map((s, i) => ({
      id: makeId('s'),
      ref: `${ref}.${i + 1}`,
      fuaId,
      title: s.title.trim(),
      assignee: s.assignee,
      dueAt: fromDateInput(s.due) ?? dueAt,
      priority: s.priority,
      status: 'Not Started',
    }))

    const entries: Entry[] = [
      {
        id: makeId('e'),
        at: now,
        kind: 'raise',
        actor: state.currentUser,
        fuaId,
        note: `Raised ${ref} from ${fua.meeting}`,
      },
      ...created.flatMap((s, i): Entry[] => [
        {
          id: makeId('e'),
          at: now + (i + 1) * MINUTE,
          kind: 'assign',
          actor: state.currentUser,
          fuaId,
          subtaskId: s.id,
          note: `Assigned ${s.ref} to ${displayName(
            state.people.find((p) => p.id === s.assignee)!,
          )}`,
        },
        {
          id: makeId('e'),
          at: now + (i + 1) * MINUTE + 6_000,
          kind: 'notify',
          actor: 'system',
          fuaId,
          subtaskId: s.id,
          note: 'Teams notification sent to assignee',
        },
      ]),
    ]

    set((prev) => ({
      ...prev,
      fuas: [...prev.fuas, fua],
      subtasks: [...prev.subtasks, ...created],
      log: [...prev.log, ...entries],
      nextRef: prev.nextRef + 1,
    }))

    toast(`${ref} raised`, {
      tone: 'ok',
      detail: `${created.length} subtask${created.length === 1 ? '' : 's'} assigned · Teams notifications sent`,
    })
    onDone()
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto @3xl:grid @3xl:grid-cols-[minmax(0,1fr)_300px] @3xl:overflow-hidden">
      {/* ------------------------------------------------------- the work order */}
      <div className="@3xl:min-h-0 @3xl:overflow-y-auto @3xl:pr-1">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              type="button"
              disabled={n === 2 && !step1Ready}
              onClick={() => setStep(n)}
              className={cn(
                'flex items-center gap-2 rounded-sm border px-3 py-1.5 text-[11.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45',
                step === n
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-deep)]'
                  : 'border-bone-300 bg-white text-slate-500',
              )}
            >
              <span
                className={cn(
                  'flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold',
                  step === n
                    ? 'bg-[var(--accent)] text-white'
                    : n === 1 && step1Ready
                      ? 'bg-[#2f9169] text-white'
                      : 'bg-bone-300 text-slate-600',
                )}
              >
                {n === 1 && step === 2 && step1Ready ? <Check size={10} strokeWidth={3} /> : n}
              </span>
              {n === 1 ? 'FUA particulars' : 'Assign subtasks'}
            </button>
          ))}
          <span className="ml-auto hidden text-[11px] text-slate-400 @2xl:inline">
            Step two reuses the same screen.
          </span>
        </div>

        <div className="rounded-md border border-bone-300 bg-white">
          {step === 1 ? (
            <>
              <SectionBlock
                index="01"
                title="Particulars"
                sub="What has to happen, in one line a stranger could act on."
              >
                <div className="space-y-3">
                  <Field label="Action title" required>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Publish revised vehicle NMT checklist"
                    />
                  </Field>
                  <Field
                    label="Detail"
                    hint="Optional. Background the assignee would otherwise have to ask for."
                  >
                    <Textarea
                      rows={3}
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      placeholder="Scope, constraints, who to coordinate with…"
                    />
                  </Field>
                </div>
              </SectionBlock>

              <SectionBlock
                index="02"
                title="Meeting context"
                sub="Where the action came from — so it can be traced back."
              >
                <div className="grid gap-3 @xl:grid-cols-2">
                  <Field label="Meeting / conference" required>
                    <Input
                      value={meeting}
                      onChange={(e) => setMeeting(e.target.value)}
                      placeholder="e.g. 15C4I Weekly Coord Conf"
                      list="fua-meetings"
                    />
                    <datalist id="fua-meetings">
                      <option value="15C4I Weekly Coord Conf" />
                      <option value="Innovation Review" />
                      <option value="Bde Ops Sync" />
                      <option value="Quarterly Safety Conference" />
                    </datalist>
                  </Field>
                  <Field label="Meeting date" required>
                    <Input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                    />
                  </Field>
                </div>
              </SectionBlock>

              <SectionBlock
                index="03"
                title="Priority & timeline"
                sub="The due date drives the amber and red flags everyone else sees."
              >
                <div className="grid gap-3 @xl:grid-cols-2">
                  <Field label="Priority" required>
                    <Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Due date" required>
                    <Input
                      type="date"
                      value={due}
                      onChange={(e) => setDue(e.target.value)}
                    />
                  </Field>
                </div>
              </SectionBlock>
            </>
          ) : (
            <SectionBlock
              index="04"
              title="Assign subtasks"
              sub="Split the action into work somebody can actually own. Each one notifies its assignee on commit."
            >
              <div className="space-y-2.5">
                {subs.map((s, i) => (
                  <div
                    key={s.key}
                    className="grid grid-cols-1 items-end gap-2 rounded-sm border border-bone-200 bg-bone-50 p-2.5 @2xl:grid-cols-2 @4xl:grid-cols-[minmax(0,1fr)_150px_130px_100px_28px]"
                  >
                    <Field label={`Subtask ${i + 1}`} required>
                      <Input
                        value={s.title}
                        onChange={(e) => patchSub(s.key, { title: e.target.value })}
                        placeholder="What this person will do"
                      />
                    </Field>
                    <Field label="Assignee" required>
                      <Select
                        value={s.assignee}
                        onChange={(e) => patchSub(s.key, { assignee: e.target.value })}
                      >
                        <option value="">Select…</option>
                        {state.people.map((p) => (
                          <option key={p.id} value={p.id}>
                            {displayName(p)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Due" required>
                      <Input
                        type="date"
                        value={s.due}
                        onChange={(e) => patchSub(s.key, { due: e.target.value })}
                      />
                    </Field>
                    <Field label="Priority">
                      <Select
                        value={s.priority}
                        onChange={(e) =>
                          patchSub(s.key, { priority: e.target.value as Priority })
                        }
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <button
                      type="button"
                      onClick={() => removeSub(s.key)}
                      aria-label={`Remove subtask ${i + 1}`}
                      className="mb-1 rounded-sm p-1.5 text-slate-400 hover:bg-bone-200 hover:text-[#a3302a] disabled:opacity-30"
                      disabled={subs.length === 1}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
                <AppBtn variant="secondary" size="sm" onClick={addSub}>
                  <Plus size={13} /> Add subtask
                </AppBtn>
              </div>
            </SectionBlock>
          )}
        </div>
      </div>

      {/* ------------------------------------------- before you commit checklist */}
      <aside className="@3xl:min-h-0 @3xl:overflow-y-auto">
        <div className="space-y-3 @3xl:sticky @3xl:top-0">
          <div className="rounded-md border border-bone-300 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="label text-slate-500">Before you commit</span>
              <Pill tone={step === 1 ? (step1Ready ? 'ok' : 'warn') : step2Ready ? 'ok' : 'warn'}>
                {step === 1
                  ? `${step1Checks.filter((c) => c.met).length}/${step1Checks.length}`
                  : `${step2Checks.filter((c) => c.met).length}/${step2Checks.length}`}
              </Pill>
            </div>
            <RequirementList items={step === 1 ? step1Checks : step2Checks} />

            <div className="mt-4 border-t border-bone-200 pt-3">
              {step === 1 ? (
                <AppBtn
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!step1Ready}
                  onClick={() => setStep(2)}
                >
                  {step1Ready ? 'Continue to assignment' : (
                    <>
                      <Lock size={13} /> Complete the checklist
                    </>
                  )}
                </AppBtn>
              ) : (
                <AppBtn
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!step2Ready}
                  onClick={commit}
                >
                  {step2Ready ? (
                    <>
                      <Send size={13} /> Commit & notify
                    </>
                  ) : (
                    <>
                      <Lock size={13} /> Assign at least one subtask
                    </>
                  )}
                </AppBtn>
              )}
              <p className="mt-2 text-[10.5px] leading-snug text-slate-400">
                You literally cannot raise a half-finished FUA.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-dashed border-bone-300 bg-bone-50 p-4">
            <span className="label text-slate-500">Automatic reference</span>
            <p className="mt-2 font-mono text-[15px] font-medium text-[var(--accent-deep)]">
              {nextRef}
            </p>
            <p className="mt-1.5 text-[10.5px] leading-snug text-slate-500">
              Assigned on commit. There is no field for it because there is no
              manual numbering to get wrong.
            </p>
          </div>

          {step === 2 && validSubs.length > 0 && (
            <div className="rounded-md border border-bone-300 bg-white p-4">
              <span className="label text-slate-500">Will be created</span>
              <ul className="mt-2.5 space-y-2">
                {validSubs.map((s, i) => (
                  <li key={s.key} className="text-[11.5px]">
                    <span className="font-mono text-[10.5px] text-[var(--accent-deep)]">
                      {nextRef}.{i + 1}
                    </span>
                    <p className="mt-0.5 leading-snug text-slate-600">{s.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-[10.5px] text-slate-400">
                      {displayName(state.people.find((p) => p.id === s.assignee)!)}
                      <span aria-hidden="true">·</span>
                      {shortDate(fromDateInput(s.due) ?? now)}
                      <PriorityMark priority={s.priority} />
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
