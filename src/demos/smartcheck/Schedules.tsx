import { useState } from 'react'
import { cn } from '@/lib/cn'
import {
  AppBtn,
  Card,
  CardHead,
  Field,
  Input,
  Pill,
  Select,
  useToast,
} from '../shared/kit'
import { makeId } from '@/lib/store'
import { MINUTE, hhmm, stamp } from '@/lib/time'
import { Bell, Pause, Play, Plus, Send, Trash, Users } from '@/components/icons'
import {
  PATTERNS,
  PATTERN_LABEL,
  occState,
  occurrencesOn,
  teamById,
  templateById,
  useSc,
} from './store'
import type { Pattern, Schedule } from './store'

const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const minToTime = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

const timeToMin = (v: string) => {
  const [h, m] = v.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function windowsFor(pattern: Pattern, existing: Schedule['windows']) {
  if (pattern === 'twice-daily' && existing.length < 2) {
    return [...existing, { startMin: 19 * 60, endMin: 20 * 60 }]
  }
  if (pattern !== 'twice-daily' && existing.length > 1) return [existing[0]]
  return existing
}

export function Schedules() {
  const { state, set, now } = useSc()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState(state.schedules[0]?.id ?? '')

  const schedule = state.schedules.find((s) => s.id === selectedId) ?? state.schedules[0]

  const patch = (next: Partial<Schedule>) =>
    set((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.id === schedule.id ? { ...s, ...next } : s,
      ),
    }))

  const sendTest = () => {
    const payload = {
      event: 'smartcheck.test',
      schedule: schedule.id,
      template: templateById(state, schedule.templateId)?.code,
      team: teamById(state, schedule.teamId)?.name,
    }
    set((prev) => ({
      ...prev,
      notifications: [
        {
          id: makeId('n'),
          at: now,
          channel: 'webhook',
          scheduleId: schedule.id,
          detail: `Test payload POSTed to ${schedule.webhookUrl} — ${JSON.stringify(payload)}`,
        },
        ...prev.notifications,
      ],
    }))
    toast('Sample webhook payload sent', {
      tone: 'ok',
      detail: schedule.webhookUrl,
    })
  }

  // The nudges that would fire today for this schedule's windows.
  const todayOccs = occurrencesOn(state, now).filter((o) => o.scheduleId === schedule.id)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto @3xl:grid @3xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @3xl:overflow-hidden">
      <div className="flex flex-col gap-4 @3xl:min-h-0">
        <div>
          <h1 className="text-[19px] font-semibold text-slate-ink">
            Schedules & notifications
          </h1>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Six patterns. Windows live in agency time and may span midnight.
            Pausing, resuming or transferring never touches the history already
            recorded.
          </p>
        </div>

        <Card className="flex flex-col @3xl:min-h-0 @3xl:flex-1">
          <CardHead title="All schedules" sub={`${state.schedules.length} configured`} />
          <div className="max-h-[320px] overflow-x-auto overflow-y-auto @3xl:max-h-none @3xl:min-h-0 @3xl:flex-1">
            <table className="w-full min-w-[560px] text-[12px]">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-bone-200 text-left text-slate-400">
                  <th className="px-4 py-2 label font-medium">Check</th>
                  <th className="px-2 py-2 label font-medium">Team</th>
                  <th className="px-2 py-2 label font-medium">Pattern</th>
                  <th className="px-2 py-2 label font-medium">Window</th>
                  <th className="px-4 py-2 label font-medium">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-200">
                {state.schedules.map((s) => {
                  const t = templateById(state, s.templateId)
                  const team = teamById(state, s.teamId)
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        s.id === schedule.id ? 'bg-[var(--accent-soft)]' : 'hover:bg-bone-50',
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-slate-ink">{t?.name}</p>
                        <p className="font-mono text-[10px] text-slate-400">{t?.code}</p>
                      </td>
                      <td className="px-2 py-2.5 text-slate-600">{team?.name}</td>
                      <td className="px-2 py-2.5">
                        <Pill tone="accent">{PATTERN_LABEL[s.pattern]}</Pill>
                      </td>
                      <td className="px-2 py-2.5 font-mono text-[11px] text-slate-500">
                        {s.windows
                          .map((w) => `${minToTime(w.startMin)}–${minToTime(w.endMin)}`)
                          .join('  ·  ')}
                        {s.windows.some((w) => w.endMin <= w.startMin) && (
                          <span className="ml-1 text-[9px] text-[#8a5a12]">+1d</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <Pill tone={s.paused ? 'warn' : 'ok'} dot>
                          {s.paused ? 'Paused' : 'Active'}
                        </Pill>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="shrink-0">
          <CardHead
            title="Notification log"
            sub="Deadline nudges and test payloads"
            right={
              <Pill tone="muted">{state.notifications.length} entries</Pill>
            }
          />
          <ul className="max-h-40 divide-y divide-bone-200 overflow-y-auto">
            {state.notifications.length === 0 && (
              <li className="px-4 py-4 text-[11.5px] text-slate-400">
                Nothing sent yet. Use “Send data” to fire a sample payload.
              </li>
            )}
            {state.notifications.map((n) => (
              <li key={n.id} className="flex gap-2.5 px-4 py-2.5">
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    n.channel === 'email'
                      ? 'bg-[#e8f0fa] text-[#215289]'
                      : 'bg-[var(--accent-soft)] text-[var(--accent-deep)]',
                  )}
                >
                  {n.channel === 'email' ? <Bell size={11} /> : <Send size={11} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] leading-snug break-all text-slate-600">
                    {n.detail}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{stamp(n.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ------------------------------------------------------------ editor */}
      <Card className="flex flex-col @3xl:min-h-0">
        <CardHead
          title={templateById(state, schedule.templateId)?.name ?? 'Schedule'}
          sub={`Issued to ${teamById(state, schedule.teamId)?.name}`}
          right={
            <AppBtn
              size="sm"
              variant={schedule.paused ? 'primary' : 'secondary'}
              onClick={() => {
                patch({ paused: !schedule.paused })
                toast(schedule.paused ? 'Schedule resumed' : 'Schedule paused', {
                  detail: 'History already recorded is untouched.',
                })
              }}
            >
              {schedule.paused ? <Play size={12} /> : <Pause size={12} />}
              {schedule.paused ? 'Resume' : 'Pause'}
            </AppBtn>
          }
        />

        <div className="space-y-4 p-4 @3xl:min-h-0 @3xl:flex-1 @3xl:overflow-y-auto">
          <section>
            <span className="label mb-2 block text-slate-500">Pattern</span>
            <div className="grid grid-cols-3 gap-1.5">
              {PATTERNS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    patch({ pattern: p, windows: windowsFor(p, schedule.windows) })
                  }
                  className={cn(
                    'rounded-sm border px-2 py-2 text-[11.5px] font-medium transition-colors',
                    schedule.pattern === p
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-deep)]'
                      : 'border-bone-300 bg-white text-slate-600 hover:border-[var(--accent)]/50',
                  )}
                >
                  {PATTERN_LABEL[p]}
                </button>
              ))}
            </div>
          </section>

          {schedule.pattern === 'weekly' && (
            <Field label="Day of week">
              <Select
                value={schedule.dayOfWeek ?? 1}
                onChange={(e) => patch({ dayOfWeek: Number(e.target.value) })}
              >
                {DOW.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {schedule.pattern === 'monthly' && (
            <Field label="Day of month">
              <Input
                type="number"
                min={1}
                max={28}
                value={schedule.dayOfMonth ?? 1}
                onChange={(e) => patch({ dayOfMonth: Number(e.target.value) })}
                className="w-24"
              />
            </Field>
          )}

          {schedule.pattern === 'one-time' && (
            <Field label="Date">
              <Input
                type="date"
                value={schedule.onDate ?? ''}
                onChange={(e) => patch({ onDate: e.target.value })}
                className="w-44"
              />
            </Field>
          )}

          <section>
            <div className="mb-2 flex items-center justify-between">
              <span className="label text-slate-500">
                Windows · agency time
              </span>
              {schedule.pattern === 'twice-daily' && schedule.windows.length < 2 && (
                <AppBtn
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    patch({
                      windows: [...schedule.windows, { startMin: 19 * 60, endMin: 20 * 60 }],
                    })
                  }
                >
                  <Plus size={11} /> Add window
                </AppBtn>
              )}
            </div>
            <div className="space-y-2">
              {schedule.windows.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-sm border border-bone-200 bg-bone-50 px-2.5 py-2"
                >
                  <span className="label w-16 text-slate-400">
                    Window {i + 1}
                  </span>
                  <Input
                    type="time"
                    value={minToTime(w.startMin)}
                    onChange={(e) =>
                      patch({
                        windows: schedule.windows.map((x, j) =>
                          j === i ? { ...x, startMin: timeToMin(e.target.value) } : x,
                        ),
                      })
                    }
                    className="w-28"
                  />
                  <span className="text-slate-400">–</span>
                  <Input
                    type="time"
                    value={minToTime(w.endMin)}
                    onChange={(e) =>
                      patch({
                        windows: schedule.windows.map((x, j) =>
                          j === i ? { ...x, endMin: timeToMin(e.target.value) } : x,
                        ),
                      })
                    }
                    className="w-28"
                  />
                  {w.endMin <= w.startMin && (
                    <Pill tone="warn">spans midnight</Pill>
                  )}
                  {schedule.windows.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        patch({ windows: schedule.windows.filter((_, j) => j !== i) })
                      }
                      className="ml-auto rounded-sm p-1 text-slate-400 hover:text-[#a3302a]"
                      aria-label={`Remove window ${i + 1}`}
                    >
                      <Trash size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <Field
            label={
              <span className="flex items-center gap-1.5">
                <Users size={12} /> Transfer between teams
              </span>
            }
            hint="Reassigning the schedule leaves every past submission where it is."
          >
            <Select
              value={schedule.teamId}
              onChange={(e) => {
                patch({ teamId: e.target.value })
                toast('Schedule transferred', {
                  detail: `Now issued to ${teamById(state, e.target.value)?.name}.`,
                })
              }}
            >
              {state.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>

          <section className="rounded-md border border-bone-300 bg-bone-50 p-3">
            <span className="label text-slate-500">Deadline nudges</span>
            <div className="mt-2.5 grid gap-3 @xl:grid-cols-2">
              <Field label={`Email at T−${schedule.emailLeadMin}`}>
                <Input
                  value={schedule.mailingList}
                  onChange={(e) => patch({ mailingList: e.target.value })}
                />
              </Field>
              <Field label={`Webhook at T−${schedule.webhookLeadMin}`}>
                <Input
                  value={schedule.webhookUrl}
                  onChange={(e) => patch({ webhookUrl: e.target.value })}
                />
              </Field>
            </div>
            <p className="mt-2 text-[10.5px] leading-snug text-slate-500">
              Sent only for checks still unsubmitted at that point. New issues
              alert instantly.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <AppBtn size="sm" variant="primary" onClick={sendTest}>
                <Send size={12} /> Send data
              </AppBtn>
              <span className="text-[10.5px] text-slate-400">
                Fires a sample payload — test before you deploy.
              </span>
            </div>
          </section>

          <section>
            <span className="label mb-2 block text-slate-500">
              Today’s nudges for this schedule
            </span>
            {todayOccs.length === 0 ? (
              <p className="text-[11.5px] text-slate-400">
                This schedule does not run today.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {todayOccs.map((o) => {
                  const st = occState(state, o, now)
                  const done = st === 'completed' || st === 'skipped'
                  return (
                    <li
                      key={o.id}
                      className="flex items-center gap-3 rounded-sm border border-bone-200 bg-white px-2.5 py-2 text-[11.5px]"
                    >
                      <span className="font-mono text-[10.5px] text-slate-400">
                        {hhmm(o.startAt)}–{hhmm(o.endAt)}
                      </span>
                      <span className="text-slate-600">
                        webhook {hhmm(o.endAt - schedule.webhookLeadMin * MINUTE)}
                        <span className="mx-1 text-slate-300">·</span>
                        email {hhmm(o.endAt - schedule.emailLeadMin * MINUTE)}
                      </span>
                      <Pill tone={done ? 'ok' : 'warn'} className="ml-auto">
                        {done ? 'suppressed' : 'will fire'}
                      </Pill>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </Card>
    </div>
  )
}
