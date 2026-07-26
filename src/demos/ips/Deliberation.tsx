import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  AppBtn,
  Card,
  CardHead,
  Empty,
  Field,
  Input,
  Pill,
  Select,
  Textarea,
  useToast,
} from '../shared/kit'
import { ArrowLeft, Alert, Layers, Lock, Send } from '@/components/icons'
import { shortDate, stamp } from '@/lib/time'
import {
  AWARDS,
  AWARD_DOWNSTREAM,
  TASK_META,
  officerName,
  openForDeliberation,
  precedentSummary,
  precedents,
  recordAward,
  useIps,
} from './store'
import type { Award } from './store'
import { MandateClock, StageChip, Subject } from './bits'

/**
 * Screen 03 — deliberation.
 *
 * Case context is locked on the left, precedent is pulled in beside it, and the
 * award plus its rationale are recorded together. Nobody has to remember what
 * was awarded last time for the same offence.
 */
export function Deliberation({
  caseId,
  onBack,
}: {
  caseId: string
  onBack: () => void
}) {
  const { state, set, now } = useIps()
  const toast = useToast()

  const c = state.cases.find((x) => x.id === caseId)
  const [award, setAward] = useState<Award>('Extra duty')
  const [quantum, setQuantum] = useState(2)
  const [rationale, setRationale] = useState('')

  const priors = useMemo(() => (c ? precedents(state, c) : []), [state, c])
  const summary = precedentSummary(priors)

  if (!c) return null

  const me = state.officers.find((o) => o.id === state.currentUser)!
  const decided = Boolean(c.deliberation)
  const canRecord = me.deliberator && !decided && rationale.trim().length > 10
  const downstream = AWARD_DOWNSTREAM[award]

  const commit = () => {
    set((prev) =>
      recordAward(prev, {
        caseId: c.id,
        award,
        quantum,
        rationale: rationale.trim(),
        at: now,
      }),
    )
    toast('Award recorded', {
      tone: 'ok',
      detail: downstream.length
        ? `${downstream.length} downstream task${downstream.length === 1 ? '' : 's'} raised automatically.`
        : 'No downstream coordination required for this award.',
    })
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <AppBtn variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={13} /> Register
        </AppBtn>
        <span className="font-mono text-[12px] font-semibold text-[var(--accent-deep)]">
          {c.ref}
        </span>
        <StageChip stage={c.stage} />
        {c.stage === 'reported' && me.deliberator && (
          <AppBtn
            size="sm"
            variant="secondary"
            className="ml-auto"
            onClick={() => set((prev) => openForDeliberation(prev, c.id, now))}
          >
            Open for deliberation
          </AppBtn>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_320px] gap-4">
        {/* --------------------------------------------- A · locked context */}
        <Card className="flex min-h-0 flex-col">
          <CardHead
            title="Case particulars"
            right={
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
                <Lock size={11} /> Locked
              </span>
            }
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-bone-200 p-3.5">
              <MandateClock c={c} now={now} variant="block" />
            </div>
            <dl className="divide-y divide-bone-200 text-[12px]">
              <div className="px-3.5 py-2.5">
                <dt className="label text-slate-400">Subject</dt>
                <dd className="mt-1">
                  <Subject c={c} />
                </dd>
              </div>
              <div className="px-3.5 py-2.5">
                <dt className="label text-slate-400">Offence</dt>
                <dd className="mt-1 text-slate-ink">{c.offence}</dd>
              </div>
              <div className="grid grid-cols-2 divide-x divide-bone-200">
                <div className="px-3.5 py-2.5">
                  <dt className="label text-slate-400">Incident</dt>
                  <dd className="mt-1 text-[11.5px] text-slate-600">
                    {stamp(c.incidentAt)}
                  </dd>
                </div>
                <div className="px-3.5 py-2.5">
                  <dt className="label text-slate-400">Reported</dt>
                  <dd className="mt-1 text-[11.5px] text-slate-600">
                    {stamp(c.reportedAt)}
                  </dd>
                </div>
              </div>
              <div className="px-3.5 py-2.5">
                <dt className="label text-slate-400">Place</dt>
                <dd className="mt-1 text-slate-600">{c.place}</dd>
              </div>
              <div className="px-3.5 py-2.5">
                <dt className="label text-slate-400">Narrative</dt>
                <dd className="mt-1 leading-relaxed text-slate-700">{c.narrative}</dd>
              </div>
              <div className="px-3.5 py-2.5">
                <dt className="label text-slate-400">Witnesses</dt>
                <dd className="mt-1 text-slate-600">{c.witnesses}</dd>
              </div>
              <div className="px-3.5 py-2.5">
                <dt className="label text-slate-400">Reported by</dt>
                <dd className="mt-1 text-slate-600">
                  {officerName(state, c.reportedBy)}
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        {/* ------------------------------------------------- B · precedent */}
        <Card className="flex min-h-0 flex-col">
          <CardHead
            title="Prior records"
            sub={`Previous awards for “${c.offence}”`}
            right={
              summary && (
                <Pill tone="accent">
                  Most common: {summary.award}
                  {summary.median ? ` ×${summary.median}` : ''}
                </Pill>
              )
            }
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {priors.length === 0 ? (
              <Empty
                icon={<Layers size={24} />}
                title="No precedent yet"
                body="This is the first case of this offence in the register."
              />
            ) : (
              <ul className="divide-y divide-bone-200">
                {priors.map(({ case: p, deliberation: d }) => (
                  <li key={p.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10.5px] text-slate-400">
                            {p.ref}
                          </span>
                          <span className="text-[11px] text-slate-400">{p.coy}</span>
                        </div>
                        <p className="mt-1 text-[12.5px] font-medium text-slate-ink">
                          {d.award}
                          {d.quantum ? (
                            <span className="ml-1.5 text-[var(--accent-deep)]">
                              ×{d.quantum}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-[11.5px] leading-snug text-slate-600">
                          {d.rationale}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] text-slate-500">
                          {officerName(state, d.decidedBy)}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-slate-400">
                          {shortDate(d.decidedAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* ----------------------------------------------------- C · award */}
        <Card className="flex min-h-0 flex-col">
          <CardHead
            title={decided ? 'Award recorded' : 'Record the award'}
            sub={decided ? undefined : 'The decision and the reason, together'}
          />
          <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto p-4">
            {decided ? (
              <>
                <div className="rounded-md border border-[#2f9169]/25 bg-[#e6f4ec] p-3">
                  <p className="text-[14px] font-semibold text-[#1d6b47]">
                    {c.deliberation!.award}
                    {c.deliberation!.quantum ? ` ×${c.deliberation!.quantum}` : ''}
                  </p>
                  <p className="mt-1 text-[11px] text-[#1d6b47]/80">
                    {officerName(state, c.deliberation!.decidedBy)} ·{' '}
                    {stamp(c.deliberation!.decidedAt)}
                  </p>
                </div>
                <div>
                  <span className="label text-slate-400">Rationale</span>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-700">
                    {c.deliberation!.rationale}
                  </p>
                </div>
              </>
            ) : !me.deliberator ? (
              <div className="flex items-start gap-2 rounded-md border border-[#8a5a12]/25 bg-[#fdf1de] px-3 py-2.5 text-[11.5px] leading-snug text-[#8a5a12]">
                <Alert size={14} className="mt-px shrink-0" />
                <span>
                  {officerName(state, me.id)} is not a deliberating appointment.
                  Switch to a commander in the toolbar above to record an award.
                </span>
              </div>
            ) : (
              <>
                <Field label="Award" required>
                  <Select
                    value={award}
                    onChange={(e) => setAward(e.target.value as Award)}
                  >
                    {AWARDS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </Select>
                </Field>

                {award !== 'Verbal warning' && award !== 'Counselling only' && (
                  <Field
                    label={
                      award === 'Extra duty'
                        ? 'Number of duties'
                        : award === 'Confinement to camp'
                          ? 'Days of confinement'
                          : 'Weekends stopped'
                    }
                    required
                  >
                    <Input
                      type="number"
                      min={1}
                      max={14}
                      value={quantum}
                      onChange={(e) => setQuantum(Number(e.target.value))}
                      className="w-24"
                    />
                  </Field>
                )}

                <Field
                  label="Rationale"
                  required
                  hint="Recorded alongside the award and visible as precedent for future cases."
                >
                  <Textarea
                    rows={4}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="Why this award, at this quantum, for this subject?"
                  />
                </Field>

                <div className="rounded-md border border-dashed border-bone-300 bg-bone-50 p-3">
                  <span className="label text-slate-500">
                    Will be raised on commit
                  </span>
                  {downstream.length === 0 ? (
                    <p className="mt-2 text-[11.5px] text-slate-400">
                      No downstream coordination for this award.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {downstream.map((kind) => (
                        <li
                          key={kind}
                          className="flex items-start gap-2 text-[11.5px]"
                        >
                          <Send size={12} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                          <span>
                            <span className="font-medium text-slate-ink">
                              {TASK_META[kind].party}
                            </span>
                            <span className="block text-slate-500">
                              {TASK_META[kind].label}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <AppBtn
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!canRecord}
                  onClick={commit}
                >
                  {canRecord ? 'Record award' : 'Rationale is required'}
                </AppBtn>
              </>
            )}

            <div className="border-t border-bone-200 pt-3">
              <span className="label text-slate-400">Case log</span>
              <ul className="mt-2 space-y-2 border-l border-bone-300 pl-3">
                {c.log.map((entry, i) => (
                  <li key={i} className="relative">
                    <span
                      className={cn(
                        'absolute top-1 -left-[15px] h-2 w-2 rounded-full',
                        entry.by === 'system' ? 'bg-[var(--accent)]' : 'bg-slate-400',
                      )}
                    />
                    <p className="text-[11.5px] leading-snug text-slate-700">
                      {entry.note}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {entry.by === 'system' ? 'Automation' : officerName(state, entry.by)} ·{' '}
                      {stamp(entry.at)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
