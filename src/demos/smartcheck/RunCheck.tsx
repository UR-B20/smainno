import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { AppBtn, Pill, Textarea, Toggle, useToast } from '../shared/kit'
import { makeId } from '@/lib/store'
import { hhmm } from '@/lib/time'
import {
  Alert,
  ArrowLeft,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from '@/components/icons'
import {
  checkerName,
  optionLabel,
  pageItems,
  requiredItems,
  scoreOf,
  templateById,
  useSc,
} from './store'
import type { Answer, Item, Occurrence, Photo } from './store'
import { PhotoTile } from './bits'

/**
 * The active window: the team completes the check on mobile, page by page.
 * All questions are mandatory. Any item can raise an issue, and photographs
 * attach to the item — not to a chat thread.
 */
export function RunCheck({
  occ,
  onExit,
}: {
  occ: Occurrence
  onExit: () => void
}) {
  const { state, set, now } = useSc()
  const toast = useToast()
  const template = templateById(state, occ.templateId)!

  const draft = state.drafts[occ.id] ?? {
    answers: [],
    pageIndex: 0,
    startedAt: now,
  }
  const answers = draft.answers
  const pageIndex = Math.min(draft.pageIndex, template.pages.length - 1)
  const page = template.pages[pageIndex]

  const [issueFor, setIssueFor] = useState<string | null>(null)

  const patchDraft = (next: Partial<typeof draft>) =>
    set((prev) => ({
      ...prev,
      drafts: { ...prev.drafts, [occ.id]: { ...draft, ...next } },
    }))

  const setAnswer = (item: Item, value: string) => {
    const next: Answer[] = [
      ...answers.filter((a) => a.itemId !== item.id),
      { itemId: item.id, value, by: state.currentUser, at: now },
    ]
    // Changing a parent answer retires a follow-up that no longer applies.
    if (item.followUp && value !== item.followUp.whenOptionId) {
      patchDraft({
        answers: next.filter((a) => a.itemId !== item.followUp!.item.id),
      })
      return
    }
    patchDraft({ answers: next })
  }

  const answerOf = (itemId: string) => answers.find((a) => a.itemId === itemId)

  const visibleItems = pageItems(page, answers)
  const pageComplete = visibleItems.every((i) => answerOf(i.id)?.value)
  const allRequired = requiredItems(template, answers)
  const answeredCount = allRequired.filter((i) => answerOf(i.id)?.value).length
  const progress = Math.round((answeredCount / allRequired.length) * 100)

  const occIssues = state.issues.filter((i) => i.occurrenceId === occ.id)
  const issuesByItem = useMemo(
    () => new Map(occIssues.map((i) => [i.itemId, i])),
    [occIssues],
  )

  const isLast = pageIndex === template.pages.length - 1

  const submit = () => {
    const seq = state.submissions.filter((s) => s.occurrenceId === occ.id).length + 1
    const { score, max } = scoreOf(template, answers)
    set((prev) => {
      const drafts = { ...prev.drafts }
      delete drafts[occ.id]
      return {
        ...prev,
        drafts,
        submissions: [
          ...prev.submissions,
          {
            id: makeId('sub'),
            occurrenceId: occ.id,
            scheduleId: occ.scheduleId,
            templateId: occ.templateId,
            teamId: occ.teamId,
            at: now,
            by: prev.currentUser,
            answers,
            seq,
          },
        ],
      }
    })
    toast(seq > 1 ? `Re-submitted (record #${seq})` : 'Check submitted', {
      tone: 'ok',
      detail: `Score ${score}/${max}. Each submission is a new timestamped record.`,
    })
    onExit()
  }

  return (
    <div className="flex h-full flex-col bg-bone-100">
      {/* header */}
      <header className="shrink-0 bg-[var(--accent)] px-4 pt-3 pb-3 text-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            aria-label="Back"
            className="-ml-1 rounded-sm p-1 hover:bg-white/15"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{template.name}</p>
            <p className="text-[10.5px] text-white/70">
              {template.code} v{template.version} · window closes {hhmm(occ.endAt)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-[0.14em] text-white/75 uppercase">
            Page {pageIndex + 1}/{template.pages.length}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="numerals text-[10.5px] font-semibold text-white/90">
            {answeredCount}/{allRequired.length}
          </span>
        </div>
      </header>

      {/* body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <h2 className="mb-2 px-1 text-[14px] font-semibold text-slate-ink">
          {page.title}
        </h2>

        <div className="space-y-3">
          {page.sections.map((section) => (
            <section key={section.id}>
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <span className="label text-slate-400">{section.title}</span>
                <span className="h-px flex-1 bg-bone-300" />
              </div>

              <div className="space-y-2">
                {section.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    answer={answerOf(item.id)}
                    onAnswer={(v) => setAnswer(item, v)}
                    hasIssue={issuesByItem.has(item.id)}
                    onToggleIssue={() =>
                      setIssueFor(issueFor === item.id ? null : item.id)
                    }
                    issueOpen={issueFor === item.id}
                    state={state}
                  >
                    {issueFor === item.id && (
                      <IssueComposer
                        occ={occ}
                        item={item}
                        sectionTitle={section.title}
                        onClose={() => setIssueFor(null)}
                      />
                    )}
                    {item.followUp &&
                      answerOf(item.id)?.value === item.followUp.whenOptionId && (
                        <div className="mt-2 border-l-2 border-[var(--accent)]/40 pl-3">
                          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-[var(--accent-deep)] uppercase">
                            <ChevronRight size={10} /> Follow-up
                          </p>
                          <ItemCard
                            item={item.followUp.item}
                            answer={answerOf(item.followUp.item.id)}
                            onAnswer={(v) => setAnswer(item.followUp!.item, v)}
                            state={state}
                            bare
                          />
                        </div>
                      )}
                  </ItemCard>
                ))}
              </div>
            </section>
          ))}
        </div>

        {!pageComplete && (
          <p className="mt-3 flex items-center gap-1.5 rounded-sm border border-[#8a5a12]/25 bg-[#fdf1de] px-2.5 py-2 text-[11px] text-[#8a5a12]">
            <Alert size={12} /> All questions on this page are mandatory.
          </p>
        )}
      </div>

      {/* footer */}
      <footer className="flex shrink-0 items-center gap-2 border-t border-bone-300 bg-white px-3 py-2.5">
        <AppBtn
          variant="secondary"
          size="lg"
          disabled={pageIndex === 0}
          onClick={() => patchDraft({ pageIndex: pageIndex - 1 })}
        >
          <ChevronLeft size={14} /> Back
        </AppBtn>
        {isLast ? (
          <AppBtn
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!pageComplete}
            onClick={submit}
          >
            <Check size={14} /> Submit check
          </AppBtn>
        ) : (
          <AppBtn
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!pageComplete}
            onClick={() => patchDraft({ pageIndex: pageIndex + 1 })}
          >
            Next page <ChevronRight size={14} />
          </AppBtn>
        )}
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ item */

function ItemCard({
  item,
  answer,
  onAnswer,
  hasIssue,
  onToggleIssue,
  issueOpen,
  state,
  bare = false,
  children,
}: {
  item: Item
  answer?: Answer
  onAnswer: (value: string) => void
  hasIssue?: boolean
  onToggleIssue?: () => void
  issueOpen?: boolean
  state: ReturnType<typeof useSc>['state']
  bare?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        !bare &&
          'rounded-md border bg-white p-3 transition-colors ' +
            (hasIssue ? 'border-[#c0392b]/40' : 'border-bone-300'),
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12.5px] leading-snug font-medium text-slate-ink">
            {item.label}
          </p>
          {item.description && (
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              {item.description}
            </p>
          )}
        </div>
        {hasIssue && (
          <Pill tone="danger" dot>
            Issue
          </Pill>
        )}
      </div>

      <div className="mt-2.5">
        {item.options?.length ? (
          <div className="grid grid-cols-3 gap-1.5">
            {item.options.map((o) => {
              const active = answer?.value === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onAnswer(o.id)}
                  className={cn(
                    'rounded-sm border px-2 py-2 text-[11.5px] leading-tight font-medium transition-colors',
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-bone-300 bg-white text-slate-600 active:bg-bone-100',
                  )}
                >
                  {o.label}
                  <span
                    className={cn(
                      'mt-0.5 block text-[9px] font-semibold',
                      active ? 'text-white/70' : 'text-slate-400',
                    )}
                  >
                    {o.score} pt
                  </span>
                </button>
              )
            })}
          </div>
        ) : item.type === 'number' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={answer?.value ?? ''}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="0"
              className="w-32 rounded-sm border border-bone-300 bg-white px-2.5 py-2 text-[13px] text-slate-ink focus:border-[var(--accent)] focus:outline-none"
            />
            {item.unit && (
              <span className="text-[11.5px] text-slate-500">{item.unit}</span>
            )}
          </div>
        ) : (
          <Textarea
            rows={2}
            value={answer?.value ?? ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Type your remarks"
          />
        )}
      </div>

      {answer && (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Check size={10} strokeWidth={3} className="text-[#2f9169]" />
          {checkerName(state, answer.by)} · {hhmm(answer.at)}
        </p>
      )}

      {onToggleIssue && (
        <div className="mt-2.5 border-t border-bone-200 pt-2.5">
          <Toggle
            checked={Boolean(issueOpen || hasIssue)}
            onChange={onToggleIssue}
            tone="danger"
            label="Affects operational readiness"
            description="Raises an issue for escalation, with photos attached to this item."
          />
        </div>
      )}

      {children}
    </div>
  )
}

/* -------------------------------------------------------- issue composer */

function IssueComposer({
  occ,
  item,
  sectionTitle,
  onClose,
}: {
  occ: Occurrence
  item: Item
  sectionTitle: string
  onClose: () => void
}) {
  const { state, set, now } = useSc()
  const toast = useToast()
  const existing = state.issues.find(
    (i) => i.occurrenceId === occ.id && i.itemId === item.id,
  )

  const [remarks, setRemarks] = useState(existing?.remarks ?? '')
  const [photos, setPhotos] = useState<Photo[]>(existing?.photos ?? [])

  const addPhoto = () => {
    if (photos.length >= 5) return
    setPhotos((prev) => [
      ...prev,
      {
        id: makeId('ph'),
        name: `IMG_${String(4200 + Math.floor(Math.random() * 799)).padStart(4, '0')}.JPG`,
        seed: Math.floor(Math.random() * 360),
      },
    ])
  }

  const answer = state.drafts[occ.id]?.answers.find((a) => a.itemId === item.id)
  const canSave = remarks.trim().length > 3

  const save = () => {
    if (existing) {
      set((prev) => ({
        ...prev,
        issues: prev.issues.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                remarks: remarks.trim(),
                photos,
                history: [
                  ...i.history,
                  {
                    at: now,
                    by: prev.currentUser,
                    note: 'Issue updated during the check.',
                    kind: 'update' as const,
                  },
                ],
              }
            : i,
        ),
      }))
      toast('Issue updated')
    } else {
      set((prev) => ({
        ...prev,
        issues: [
          ...prev.issues,
          {
            id: makeId('iss'),
            occurrenceId: occ.id,
            scheduleId: occ.scheduleId,
            templateId: occ.templateId,
            teamId: occ.teamId,
            itemId: item.id,
            itemLabel: item.label,
            category: sectionTitle,
            answer: answer ? optionLabel(item, answer.value) : '—',
            remarks: remarks.trim(),
            photos,
            raisedBy: prev.currentUser,
            raisedAt: now,
            status: 'open',
            history: [
              {
                at: now,
                by: prev.currentUser,
                note: 'Issue raised during the check.',
                kind: 'raised',
              },
            ],
          },
        ],
      }))
      toast('Issue raised for escalation', {
        tone: 'danger',
        detail: 'Linked to this item and tracked until resolved.',
      })
    }
    onClose()
  }

  const remove = () => {
    if (!existing) return onClose()
    set((prev) => ({
      ...prev,
      issues: prev.issues.filter((i) => i.id !== existing.id),
    }))
    toast('Issue withdrawn')
    onClose()
  }

  return (
    <div className="mt-2.5 rounded-sm border border-[#c0392b]/30 bg-[#fbeae8] p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="label text-[#a3302a]">
          {existing ? 'Edit issue' : 'Report an issue'}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-[#a3302a]/60 hover:text-[#a3302a]"
        >
          <X size={13} />
        </button>
      </div>

      <Textarea
        rows={2}
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="What is wrong, and what did you do about it?"
        className="bg-white"
      />

      <div className="mt-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10.5px] font-semibold text-[#a3302a]">
            Photos ({photos.length}/5)
          </span>
          <span className="text-[10px] text-[#a3302a]/60">JPEG / PNG</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {photos.map((p) => (
            <PhotoTile
              key={p.id}
              photo={p}
              size={50}
              onRemove={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}
            />
          ))}
          {photos.length < 5 && (
            <button
              type="button"
              onClick={addPhoto}
              className="flex h-[50px] w-[50px] flex-col items-center justify-center gap-0.5 rounded-sm border border-dashed border-[#c0392b]/40 bg-white text-[#a3302a] active:bg-[#fbeae8]"
            >
              <Camera size={15} />
              <span className="text-[8px] font-semibold">Capture</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <AppBtn variant="danger" size="sm" disabled={!canSave} onClick={save}>
          {existing ? 'Save issue' : 'Raise issue'}
        </AppBtn>
        {existing && (
          <AppBtn variant="ghost" size="sm" onClick={remove}>
            Withdraw
          </AppBtn>
        )}
        {!canSave && (
          <span className="text-[10px] text-[#a3302a]/70">
            Remarks are required.
          </span>
        )}
      </div>
    </div>
  )
}
