import { useMemo, useState } from 'react'
import { Card, CardHead, Empty, KPI, Pill, Select } from '../shared/kit'
import { DAY, dowDate, hhmm, shortDate, stamp } from '@/lib/time'
import {
  Alert,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flag,
  Grid,
} from '@/components/icons'
import {
  checkerName,
  dayStats,
  flatItems,
  occState,
  occurrencesOn,
  optionLabel,
  submissionsFor,
  templateById,
  useSc,
} from './store'
import type { ScState, Team } from './store'
import { StateChip } from './bits'

/** The latest answer any team gave to one item, wherever it was last asked. */
function latestAnswer(
  state: ScState,
  templateId: string,
  itemId: string,
  teamId: string,
  now: number,
) {
  const subs = state.submissions
    .filter((s) => s.templateId === templateId && s.teamId === teamId && s.at <= now)
    .sort((a, b) => b.at - a.at)
  for (const sub of subs) {
    const answer = sub.answers.find((a) => a.itemId === itemId)
    if (answer) return { answer, sub }
  }
  return null
}

export function AdminDashboard() {
  const { state, now } = useSc()
  const [dayOffset, setDayOffset] = useState(0)
  const [expanded, setExpanded] = useState<string[]>([state.teams[0]?.id ?? ''])

  const day = now + dayOffset * DAY
  const stats = dayStats(state, day, now)
  const occs = occurrencesOn(state, day)

  const [templateId, setTemplateId] = useState('t-nmt')
  const template = templateById(state, templateId)
  const items = template ? flatItems(template).map((f) => f.item) : []
  const [itemId, setItemId] = useState('i-tyre')
  const item = items.find((i) => i.id === itemId) ?? items[0]

  const teamsWithTemplate = useMemo(
    () =>
      state.teams.filter((t) =>
        state.schedules.some((s) => s.teamId === t.id && s.templateId === templateId),
      ),
    [state.teams, state.schedules, templateId],
  )

  const toggle = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-semibold text-slate-ink">Dashboard</h1>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Live day view. Step back through history — the outcome of every window
            is already recorded.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDayOffset((d) => d - 1)}
            aria-label="Previous day"
            className="rounded-sm border border-bone-300 bg-white p-1.5 text-slate-500 hover:border-[var(--accent)]/50 hover:text-[var(--accent-deep)]"
          >
            <ChevronLeft size={15} />
          </button>
          <div className="w-40 rounded-sm border border-bone-300 bg-white px-3 py-1.5 text-center">
            <p className="text-[12px] font-semibold text-slate-ink">{dowDate(day)}</p>
            <p className="text-[10px] text-slate-400">
              {dayOffset === 0 ? 'Today' : shortDate(day)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDayOffset((d) => Math.min(0, d + 1))}
            disabled={dayOffset >= 0}
            aria-label="Next day"
            className="rounded-sm border border-bone-300 bg-white p-1.5 text-slate-500 hover:border-[var(--accent)]/50 hover:text-[var(--accent-deep)] disabled:opacity-35"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <KPI
          value={`${stats.completionPct}%`}
          label="Completion"
          tone={stats.completionPct >= 80 ? 'ok' : stats.completionPct >= 50 ? 'warn' : 'danger'}
          hint="Skips excluded from the denominator"
        />
        <KPI value={stats.submissions} label="Submitted" tone="accent" hint={`${stats.completed} of ${stats.total} windows`} />
        <KPI value={stats.openIssues} label="Open issues" tone={stats.openIssues ? 'danger' : 'ok'} hint="Raised on this day's checks" />
        <KPI value={stats.missed} label="Missed" tone={stats.missed ? 'danger' : 'ok'} hint="Finalised automatically at the deadline" />
        <KPI value={stats.skipped} label="Skipped" tone="neutral" hint="Reason recorded, excluded from rate" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-4">
        {/* teams for the selected day */}
        <Card className="flex min-h-0 flex-col">
          <CardHead
            title="By team"
            sub={`${occs.length} window${occs.length === 1 ? '' : 's'} on ${shortDate(day)}`}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {state.teams.map((team) => (
              <TeamBlock
                key={team.id}
                team={team}
                day={day}
                open={expanded.includes(team.id)}
                onToggle={() => toggle(team.id)}
              />
            ))}
          </div>
        </Card>

        {/* latest answer per check */}
        <Card className="flex min-h-0 flex-col">
          <CardHead
            title="Latest answer per check"
            sub="Pick a template and an item — see what every team answered last"
          />
          <div className="flex shrink-0 gap-2 border-b border-bone-200 px-4 py-2.5">
            <Select
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value)
                const t = templateById(state, e.target.value)
                const first = t ? flatItems(t)[0]?.item.id : ''
                setItemId(first ?? '')
              }}
              className="flex-1"
            >
              {state.templates
                .filter((t) => t.status === 'published')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} — {t.name}
                  </option>
                ))}
            </Select>
            <Select
              value={item?.id ?? ''}
              onChange={(e) => setItemId(e.target.value)}
              className="flex-1"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {!item || teamsWithTemplate.length === 0 ? (
              <Empty
                icon={<Grid size={24} />}
                title="No team runs this template"
                body="Assign the template to a team on the Schedules screen."
              />
            ) : (
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-bone-200 text-left text-slate-400">
                    <th className="px-4 py-2 label font-medium">Team</th>
                    <th className="px-2 py-2 label font-medium">Latest answer</th>
                    <th className="px-2 py-2 label font-medium">Attribution</th>
                    <th className="px-4 py-2 label font-medium">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone-200">
                  {teamsWithTemplate.map((team) => {
                    const found = latestAnswer(state, templateId, item.id, team.id, now)
                    const openIssues = state.issues.filter(
                      (i) =>
                        i.teamId === team.id &&
                        i.itemId === item.id &&
                        i.status === 'open',
                    ).length

                    return (
                      <tr key={team.id} className="hover:bg-bone-50">
                        <td className="px-4 py-2.5 font-medium text-slate-ink">
                          {team.name}
                        </td>
                        <td className="px-2 py-2.5">
                          {found ? (
                            <span className="font-medium text-slate-700">
                              {item.options?.length
                                ? optionLabel(item, found.answer.value)
                                : found.answer.value}
                              {item.unit ? ` ${item.unit}` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400">No answer yet</span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-slate-500">
                          {found ? (
                            <>
                              {checkerName(state, found.answer.by)}
                              <span className="mx-1 text-slate-300">·</span>
                              <span className="text-[11px]">
                                {stamp(found.answer.at)}
                              </span>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {openIssues > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#a3302a]">
                              <Flag size={11} />
                              {found && item.options?.length
                                ? `${optionLabel(item, found.answer.value)} · `
                                : ''}
                              {openIssues} open
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function TeamBlock({
  team,
  day,
  open,
  onToggle,
}: {
  team: Team
  day: number
  open: boolean
  onToggle: () => void
}) {
  const { state, now } = useSc()
  const occs = occurrencesOn(state, day).filter((o) => o.teamId === team.id)
  const done = occs.filter((o) => occState(state, o, now) === 'completed').length
  const missed = occs.filter((o) => occState(state, o, now) === 'missed').length

  return (
    <div className="border-b border-bone-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-bone-50"
      >
        <span className="text-slate-400">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--accent-soft)] text-[9px] font-bold text-[var(--accent-deep)]">
          {team.short}
        </span>
        <span className="flex-1 text-[12.5px] font-medium text-slate-ink">
          {team.name}
        </span>
        <span className="numerals text-[11px] text-slate-500">
          {done}/{occs.length}
        </span>
        {missed > 0 && (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#a3302a]">
            <Alert size={11} /> {missed}
          </span>
        )}
      </button>

      {open && (
        <ul className="bg-bone-50 pb-1">
          {occs.length === 0 && (
            <li className="px-11 py-2 text-[11.5px] text-slate-400">
              No checks scheduled on this day.
            </li>
          )}
          {occs.map((o) => {
            const t = templateById(state, o.templateId)!
            const st = occState(state, o, now)
            const subs = submissionsFor(state, o.id)
            return (
              <li
                key={o.id}
                className="flex items-center gap-3 px-11 py-1.5 text-[11.5px]"
              >
                <span className="w-24 shrink-0 font-mono text-[10px] text-slate-400">
                  {hhmm(o.startAt)}–{hhmm(o.endAt)}
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-600">
                  {t.name}
                </span>
                {subs.length > 1 && (
                  <Pill tone="muted">{subs.length} records</Pill>
                )}
                <StateChip state={st} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
