import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  AppBtn,
  Bar,
  Card,
  CardHead,
  Empty,
  Field,
  Input,
  KPI,
  Pill,
  RequirementList,
  Select,
  Textarea,
  useToast,
} from '../shared/kit'
import { makeId } from '@/lib/store'
import {
  Check,
  Doc,
  Filter,
  Grid,
  List,
  Plus,
  Search,
  Send,
  Shield,
} from '@/components/icons'
import {
  clockTime,
  dateInputValue,
  fromDateInput,
  shortDate,
  stamp,
} from '@/lib/time'
import {
  OFFENCES,
  STAGES,
  STAGE_LABEL,
  isRecorded,
  mandateBreached,
  officerName,
  stats,
  useIps,
} from './store'
import type { IpsState, Offence, Stage } from './store'
import { MandateClock, StageChip, Subject } from './bits'

/* ================================================================ INTAKE */

export function Intake({ onFiled }: { onFiled: (caseId: string) => void }) {
  const { state, set, now } = useIps()
  const toast = useToast()

  const [subjectRank, setSubjectRank] = useState('PTE')
  const [subjectName, setSubjectName] = useState('')
  const [coy, setCoy] = useState('Alpha Coy')
  const [offence, setOffence] = useState<Offence>('Late for duty')
  const [date, setDate] = useState(dateInputValue(now))
  const [time, setTime] = useState(clockTime(now - 60 * 60_000))
  const [place, setPlace] = useState('')
  const [narrative, setNarrative] = useState('')
  const [witnesses, setWitnesses] = useState('')

  const checks = [
    { label: 'Subject identified', met: subjectName.trim().length > 2 },
    { label: 'Offence category selected', met: Boolean(offence) },
    { label: 'Incident date and time recorded', met: Boolean(date && time) },
    { label: 'Place of incident stated', met: place.trim().length > 2 },
    { label: 'Narrative of at least a sentence', met: narrative.trim().length > 20 },
  ]
  const ready = checks.every((c) => c.met)

  const incidentAt = useMemo(() => {
    const base = fromDateInput(date, 0)
    if (!base) return now
    const [h, m] = time.split(':').map(Number)
    return base + (h || 0) * 3_600_000 + (m || 0) * 60_000
  }, [date, time, now])

  const submit = () => {
    const id = makeId('c')
    const ref = `IPS-2026-${String(state.nextRef).padStart(3, '0')}`
    set((prev) => ({
      ...prev,
      nextRef: prev.nextRef + 1,
      cases: [
        {
          id,
          ref,
          subjectRank,
          subjectName: subjectName.trim(),
          coy,
          offence,
          incidentAt,
          reportedAt: now,
          reportedBy: prev.currentUser,
          place: place.trim(),
          narrative: narrative.trim(),
          witnesses: witnesses.trim() || 'Nil',
          stage: 'reported',
          log: [
            { at: now, by: prev.currentUser, note: 'Report submitted via FormSG intake.' },
          ],
        },
        ...prev.cases,
      ],
    }))
    toast(`${ref} filed`, {
      tone: 'ok',
      detail: 'The 24-hour recording mandate is running from the incident time.',
    })
    onFiled(id)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[860px] pb-6">
        {/* FormSG-style banner */}
        <div className="rounded-t-md border border-b-0 border-bone-300 bg-white">
          <div className="flex items-center gap-2 border-b border-bone-200 bg-[#f0f4f9] px-5 py-2">
            <Shield size={13} className="text-[var(--accent-deep)]" />
            <span className="text-[11px] font-medium text-slate-600">
              A Singapore Government Agency form · secured intake
            </span>
          </div>
          <div className="border-b-4 border-[var(--accent)] px-5 py-4">
            <h1 className="text-[18px] font-semibold text-slate-ink">
              Informal Punishment — Incident Report
            </h1>
            <p className="mt-1 text-[12px] text-slate-500">
              Replaces the chat message. Every field here is what makes the
              record searchable, comparable and attributable afterwards.
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-b-md border border-t-0 border-bone-300 bg-white p-4 @3xl:grid-cols-[minmax(0,1fr)_260px] @3xl:p-5">
          <div className="space-y-5">
            <FormSection index="1" title="Subject particulars">
              <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-[110px_minmax(0,1fr)_160px]">
                <Field label="Rank" required>
                  <Select value={subjectRank} onChange={(e) => setSubjectRank(e.target.value)}>
                    {['REC', 'PTE', 'LCP', 'CPL', 'CFC'].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Name" required>
                  <Input
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Full name as per records"
                  />
                </Field>
                <Field label="Company" required>
                  <Select value={coy} onChange={(e) => setCoy(e.target.value)}>
                    {['Alpha Coy', 'Bravo Coy', 'Support Coy'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </FormSection>

            <FormSection index="2" title="Incident">
              <div className="space-y-3">
                <Field label="Offence category" required hint="Groups like with like in the register and on the dashboard.">
                  <Select
                    value={offence}
                    onChange={(e) => setOffence(e.target.value as Offence)}
                  >
                    {OFFENCES.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-3">
                  <Field label="Date of incident" required>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Field>
                  <Field label="Time of incident" required>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </Field>
                  <Field label="Place" required>
                    <Input
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="e.g. Guard Room"
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection index="3" title="Account">
              <div className="space-y-3">
                <Field label="Narrative" required>
                  <Textarea
                    rows={4}
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    placeholder="What happened, in the order it happened."
                  />
                </Field>
                <Field label="Witnesses" hint="Leave blank if none.">
                  <Input
                    value={witnesses}
                    onChange={(e) => setWitnesses(e.target.value)}
                    placeholder="Rank and name"
                  />
                </Field>
              </div>
            </FormSection>
          </div>

          <aside className="space-y-3">
            <div className="rounded-md border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-3.5">
              <span className="label text-[var(--accent-deep)]">
                Mandate starts here
              </span>
              <p className="mt-2 text-[11.5px] leading-snug text-[var(--accent-deep)]">
                The 24-hour recording clock runs from the incident time you enter
                — not from when this form is opened.
              </p>
              <div className="mt-2.5 rounded-sm bg-white/70 px-2.5 py-2">
                <p className="text-[10.5px] text-slate-500">Deadline to record</p>
                <p className="mt-0.5 font-mono text-[12px] font-semibold text-[var(--accent-deep)]">
                  {stamp(incidentAt + 24 * 3_600_000)}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-bone-300 bg-bone-50 p-3.5">
              <span className="label text-slate-500">Before you submit</span>
              <RequirementList items={checks} className="mt-2.5" />
              <AppBtn
                variant="primary"
                size="lg"
                className="mt-3 w-full"
                disabled={!ready}
                onClick={submit}
              >
                <Send size={13} /> Submit report
              </AppBtn>
              <p className="mt-2 text-[10.5px] leading-snug text-slate-400">
                Reference number is assigned on submission.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function FormSection({
  index,
  title,
  children,
}: {
  index: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2.5 border-b border-bone-200 pb-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--accent)] text-[10px] font-bold text-white">
          {index}
        </span>
        <h2 className="text-[13px] font-semibold text-slate-ink">{title}</h2>
      </div>
      {children}
    </section>
  )
}

/* ============================================================== REGISTER */

export function Register({ onOpen }: { onOpen: (caseId: string) => void }) {
  const { state, now } = useIps()
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState<Stage | 'All'>('All')
  const [coy, setCoy] = useState('All')

  const rows = state.cases
    .filter((c) => {
      if (stage !== 'All' && c.stage !== stage) return false
      if (coy !== 'All' && c.coy !== coy) return false
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        c.ref.toLowerCase().includes(q) ||
        c.subjectName.toLowerCase().includes(q) ||
        c.offence.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => b.reportedAt - a.reportedAt)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* SharePoint-ish list chrome */}
      <div className="shrink-0 rounded-t-md border border-b-0 border-bone-300 bg-white px-3 pt-3 @2xl:px-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[16px] font-semibold text-slate-ink">
            IPS Case Register
          </h1>
          <span className="text-[11px] text-slate-400">
            SharePoint list · {state.cases.length} items
          </span>
        </div>
        <div className="mt-2.5 hidden items-center gap-2 border-b border-bone-200 pb-2 @2xl:flex">
          <span className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11.5px] text-slate-500">
            <Plus size={13} /> New
          </span>
          <span className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11.5px] text-slate-500">
            <Grid size={13} /> Export
          </span>
          <span className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11.5px] text-slate-500">
            <Filter size={13} /> Filter
          </span>
          <span className="ml-auto flex items-center gap-1.5 rounded-sm bg-bone-100 px-2 py-1 text-[11.5px] text-slate-600">
            <List size={13} /> All cases
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 py-2.5">
          <div className="relative w-full @2xl:w-64">
            <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reference, subject or offence"
              className="pl-8"
            />
          </div>
          <Select
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage | 'All')}
            className="w-44 shrink-0"
          >
            <option value="All">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </Select>
          <Select value={coy} onChange={(e) => setCoy(e.target.value)} className="w-36 shrink-0">
            <option value="All">All companies</option>
            {['Alpha Coy', 'Bravo Coy', 'Support Coy'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <span className="ml-auto hidden text-[11px] text-slate-400 @xl:inline">
            {rows.length} shown
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-b-md border border-t-0 border-bone-300 bg-white">
        {rows.length === 0 ? (
          <Empty icon={<Search size={26} />} title="No cases match" body="Adjust the filters above." />
        ) : (
          <>
          <table className="hidden w-full text-[12px] @3xl:table">
            <thead className="sticky top-0 z-10 bg-bone-50">
              <tr className="border-b border-bone-300 text-left text-slate-500">
                <th className="px-4 py-2 label font-medium">Reference</th>
                <th className="px-2 py-2 label font-medium">Subject</th>
                <th className="px-2 py-2 label font-medium">Offence</th>
                <th className="px-2 py-2 label font-medium">Reported</th>
                <th className="px-2 py-2 label font-medium">Mandate</th>
                <th className="px-2 py-2 label font-medium">Stage</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-200">
              {rows.map((c) => {
                const breached = mandateBreached(c, now)
                return (
                  <tr
                    key={c.id}
                    onClick={() => onOpen(c.id)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-[var(--accent-soft)]/60',
                      breached && !isRecorded(c) && 'bg-[#fbeae8]/50',
                    )}
                  >
                    <td className="px-4 py-2.5 font-mono text-[11px] font-medium text-[var(--accent-deep)]">
                      {c.ref}
                    </td>
                    <td className="px-2 py-2.5">
                      <Subject c={c} />
                    </td>
                    <td className="px-2 py-2.5 text-slate-700">{c.offence}</td>
                    <td className="px-2 py-2.5 text-slate-500">
                      {shortDate(c.reportedAt)}
                      <span className="mx-1 text-slate-300">·</span>
                      <span className="font-mono text-[10.5px]">
                        {clockTime(c.reportedAt)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <MandateClock c={c} now={now} />
                    </td>
                    <td className="px-2 py-2.5">
                      <StageChip stage={c.stage} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-[11px] font-medium text-[var(--accent-deep)]">
                        Open
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Narrow: the same register as cards. A seven-column table on a
              phone is a horizontal-scroll trap. */}
          <ul className="divide-y divide-bone-200 @3xl:hidden">
            {rows.map((c) => {
              const breached = mandateBreached(c, now)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(c.id)}
                    className={cn(
                      'w-full px-3 py-3 text-left',
                      breached && !isRecorded(c) && 'bg-[#fbeae8]/50',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-medium text-[var(--accent-deep)]">
                        {c.ref}
                      </span>
                      <StageChip stage={c.stage} />
                    </div>
                    <div className="mt-1.5 flex items-baseline justify-between gap-3">
                      <Subject c={c} />
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {shortDate(c.reportedAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-slate-700">{c.offence}</p>
                    <div className="mt-1.5">
                      <MandateClock c={c} now={now} />
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          </>
        )}
      </div>
    </div>
  )
}

/* ============================================================= DASHBOARD */

function offenceTally(state: IpsState) {
  const map = new Map<string, number>()
  for (const c of state.cases) map.set(c.offence, (map.get(c.offence) ?? 0) + 1)
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

export function Dashboard({ onOpen }: { onOpen: (caseId: string) => void }) {
  const { state, now } = useIps()
  const s = stats(state, now)
  const tally = offenceTally(state)
  const maxTally = Math.max(1, ...tally.map(([, n]) => n))

  const atRisk = state.cases
    .filter((c) => !isRecorded(c))
    .sort((a, b) => a.incidentAt - b.incidentAt)

  const recent = [...state.cases]
    .flatMap((c) => c.log.map((l) => ({ ...l, c })))
    .sort((a, b) => b.at - a.at)
    .slice(0, 14)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto @3xl:overflow-hidden">
      <div>
        <h1 className="text-[19px] font-semibold text-slate-ink">Dashboard view</h1>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Unit-level oversight — the third stage of the pipeline, on top of the
          same register.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 @2xl:grid-cols-3 @4xl:grid-cols-5 @4xl:gap-3">
        <KPI value={s.open} label="Open cases" tone="accent" hint="Not yet closed" />
        <KPI
          value={s.awaitingRecord}
          label="Awaiting award"
          tone="warn"
          hint="Reported, nothing recorded yet"
        />
        <KPI
          value={s.breached}
          label="Mandate breached"
          tone={s.breached ? 'danger' : 'ok'}
          hint="Recorded late, or still unrecorded"
        />
        <KPI
          value={`${s.compliancePct}%`}
          label="Recorded in time"
          tone={s.compliancePct >= 90 ? 'ok' : s.compliancePct >= 70 ? 'warn' : 'danger'}
          hint={`${s.withinMandate} of ${s.recorded} awards`}
        />
        <KPI
          value={s.outstanding}
          label="Execution due"
          tone={s.outstanding ? 'warn' : 'ok'}
          hint="Awarded but not yet carried out"
        />
      </div>

      <div className="grid gap-4 @3xl:min-h-0 @3xl:flex-1 @3xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 @3xl:min-h-0">
          <Card className="flex flex-col @3xl:min-h-0 @3xl:flex-1">
            <CardHead
              title="Against the clock"
              sub="Cases with no award recorded yet, oldest incident first"
              right={
                <Pill tone={atRisk.length ? 'warn' : 'ok'} dot>
                  {atRisk.length}
                </Pill>
              }
            />
            <div className="max-h-[380px] overflow-y-auto @3xl:max-h-none @3xl:min-h-0 @3xl:flex-1">
              {atRisk.length === 0 ? (
                <Empty icon={<Check size={24} />} title="Everything is recorded" />
              ) : (
                <ul className="divide-y divide-bone-200">
                  {atRisk.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => onOpen(c.id)}
                        className="w-full px-4 py-3 text-left hover:bg-bone-50"
                      >
                        <div className="flex flex-col gap-2.5 @xl:flex-row @xl:items-start @xl:justify-between @xl:gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10.5px] font-medium text-[var(--accent-deep)]">
                                {c.ref}
                              </span>
                              <StageChip stage={c.stage} />
                            </div>
                            <p className="mt-1 text-[12.5px] font-medium text-slate-ink">
                              {c.subjectRank} {c.subjectName}
                              <span className="ml-2 font-normal text-slate-500">
                                {c.offence}
                              </span>
                            </p>
                          </div>
                          <span className="shrink-0 @xl:w-48">
                            <MandateClock c={c} now={now} variant="block" />
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className="shrink-0">
            <CardHead title="Offence categories" sub="Across the whole register" />
            <ul className="space-y-2 p-4">
              {tally.map(([name, n]) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-[11.5px] text-slate-600 @2xl:w-56">
                    {name}
                  </span>
                  <Bar value={(n / maxTally) * 100} className="flex-1" />
                  <span className="numerals w-6 text-right text-[11.5px] font-semibold text-slate-ink">
                    {n}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="flex flex-col @3xl:min-h-0">
          <CardHead title="Recent activity" sub="Every stage change, appended" />
          <div className="max-h-[420px] overflow-y-auto @3xl:max-h-none @3xl:min-h-0 @3xl:flex-1">
            <ul className="divide-y divide-bone-200">
              {recent.map((entry, i) => (
                <li key={i} className="flex gap-2.5 px-4 py-2.5">
                  <span
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                      entry.by === 'system'
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-deep)]'
                        : 'bg-bone-200 text-slate-500',
                    )}
                  >
                    {entry.by === 'system' ? <Send size={11} /> : <Doc size={11} />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10.5px] font-medium text-[var(--accent-deep)]">
                      {entry.c.ref}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-slate-600">
                      {entry.note}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {entry.by === 'system' ? 'Automation' : officerName(state, entry.by)} ·{' '}
                      {stamp(entry.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
