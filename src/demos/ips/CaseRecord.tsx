import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  AppBtn,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from '../shared/kit'
import { Alert, Check, Lock } from '@/components/icons'
import { stamp } from '@/lib/time'
import { AWARDS, markExecuted, officerName, recordAward, useIps } from './store'
import type { Award } from './store'
import { MandateClock, StageChip, Subject } from './bits'

/**
 * A case, opened from the register.
 *
 * The particulars are locked — they came from the intake form. The award is
 * recorded here against the 24-hour mandate, and the case is only closed once
 * that award has actually been executed.
 */
export function CaseRecord({
  caseId,
  onClose,
}: {
  caseId: string | null
  onClose: () => void
}) {
  const { state, set, now } = useIps()
  const toast = useToast()

  const c = state.cases.find((x) => x.id === caseId) ?? null
  const [award, setAward] = useState<Award>('Extra duty')
  const [quantum, setQuantum] = useState(2)
  const [rationale, setRationale] = useState('')

  useEffect(() => {
    setAward('Extra duty')
    setQuantum(2)
    setRationale('')
  }, [caseId])

  if (!c) return null

  const me = state.officers.find((o) => o.id === state.currentUser)!
  const decided = Boolean(c.deliberation)
  const canRecord = me.deliberator && !decided && rationale.trim().length > 10
  const needsQuantum = award !== 'Verbal warning' && award !== 'Counselling only'

  const commit = () => {
    set((prev) =>
      recordAward(prev, {
        caseId: c.id,
        award,
        quantum: needsQuantum ? quantum : 0,
        rationale: rationale.trim(),
        at: now,
      }),
    )
    toast('Award recorded', {
      tone: 'ok',
      detail: `${c.ref} · execution now outstanding.`,
    })
  }

  const execute = () => {
    set((prev) => markExecuted(prev, c.id, now))
    toast('Marked executed', { tone: 'ok', detail: `${c.ref} closed.` })
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={820}
      title={c.ref}
      sub={`${c.subjectRank} ${c.subjectName} · ${c.offence}`}
      footer={
        <>
          <span className="mr-auto">
            <StageChip stage={c.stage} />
          </span>
          {c.stage === 'awarded' && (
            <AppBtn variant="primary" onClick={execute}>
              <Check size={13} /> Mark executed
            </AppBtn>
          )}
          <AppBtn variant="ghost" onClick={onClose}>
            Close
          </AppBtn>
        </>
      }
    >
      <div className="grid gap-5 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ------------------------------------------- locked particulars */}
        <section className="rounded-md border border-bone-300 bg-bone-50">
          <header className="flex items-center justify-between border-b border-bone-200 px-3 py-2">
            <span className="label text-slate-500">Case particulars</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
              <Lock size={11} /> From intake
            </span>
          </header>

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
              <dt className="label text-slate-400">Reported by</dt>
              <dd className="mt-1 text-slate-600">
                {officerName(state, c.reportedBy)}
              </dd>
            </div>
          </dl>
        </section>

        {/* ------------------------------------------------------- award */}
        <section className="flex flex-col gap-4">
          {decided ? (
            <>
              <div className="rounded-md border border-[#2f9169]/25 bg-[#e6f4ec] p-3">
                <span className="label text-[#1d6b47]">Award recorded</span>
                <p className="mt-1.5 text-[15px] font-semibold text-[#1d6b47]">
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
              {c.stage === 'awarded' && (
                <p className="rounded-sm border border-[#8a5a12]/25 bg-[#fdf1de] px-3 py-2 text-[11.5px] leading-snug text-[#8a5a12]">
                  Execution outstanding. The case stays open in the register
                  until the award has actually been carried out.
                </p>
              )}
            </>
          ) : !me.deliberator ? (
            <div className="flex items-start gap-2 rounded-md border border-[#8a5a12]/25 bg-[#fdf1de] px-3 py-2.5 text-[11.5px] leading-snug text-[#8a5a12]">
              <Alert size={14} className="mt-px shrink-0" />
              <span>
                {officerName(state, me.id)} is not an approving appointment.
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

              {needsQuantum && (
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
                hint="Recorded alongside the award, so the reason survives with the record."
              >
                <Textarea
                  rows={4}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Why this award, at this quantum, for this subject?"
                />
              </Field>

              <AppBtn
                variant="primary"
                size="lg"
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
        </section>
      </div>
    </Modal>
  )
}
