import { createDemoStore, makeId } from '@/lib/store'
import { DAY, MINUTE, dateInputValue, startOfDay } from '@/lib/time'

/* ============================================================================
   SMARTCHECK — model

   Two ideas carry the whole system:

   1. A check is a *window*, not a task. Occurrences are derived from schedules
      for any date you ask for, so history is queryable without storing a row
      per day, and a window that nobody touched still resolves to "Missed".
   2. Nothing is overwritten. Submissions accumulate; issues keep their history;
      a skip is a record with a mandatory reason, not an absence.
   ========================================================================= */

export const PATTERNS = [
  'daily',
  'twice-daily',
  'weekly',
  'monthly',
  'one-time',
  'open',
] as const
export type Pattern = (typeof PATTERNS)[number]

export const PATTERN_LABEL: Record<Pattern, string> = {
  daily: 'Daily',
  'twice-daily': 'Twice a day',
  weekly: 'Weekly',
  monthly: 'Monthly',
  'one-time': 'One-time',
  open: 'Open',
}

export type ItemType = 'choice' | 'yesno' | 'number' | 'text'

export interface Option {
  id: string
  label: string
  score: number
}

export interface Item {
  id: string
  type: ItemType
  label: string
  description?: string
  options?: Option[]
  unit?: string
  /** Conditional logic: "when No, ask litres topped up". */
  followUp?: { whenOptionId: string; item: Item }
}

export interface Section {
  id: string
  title: string
  items: Item[]
}

export interface Page {
  id: string
  title: string
  sections: Section[]
}

export interface Template {
  id: string
  code: string
  name: string
  status: 'draft' | 'published'
  version: number
  pages: Page[]
}

export interface Team {
  id: string
  name: string
  short: string
}

export interface Checker {
  id: string
  name: string
  rank: string
  teamId: string
}

export interface Window {
  startMin: number
  endMin: number
}

export interface Schedule {
  id: string
  templateId: string
  teamId: string
  pattern: Pattern
  windows: Window[]
  /** weekly: 0-6 · monthly: day of month · one-time: yyyy-mm-dd */
  dayOfWeek?: number
  dayOfMonth?: number
  onDate?: string
  paused: boolean
  emailLeadMin: number
  webhookLeadMin: number
  mailingList: string
  webhookUrl: string
}

export interface Answer {
  itemId: string
  value: string
  by: string
  at: number
}

export interface Submission {
  id: string
  occurrenceId: string
  scheduleId: string
  templateId: string
  teamId: string
  at: number
  by: string
  answers: Answer[]
  /** Each submission is a new timestamped record — this is the nth. */
  seq: number
}

export interface Skip {
  id: string
  occurrenceId: string
  reason: string
  by: string
  at: number
  undoneAt?: number
}

export interface Photo {
  id: string
  name: string
  seed: number
}

export interface IssueEvent {
  at: number
  by: string
  note: string
  kind: 'raised' | 'update' | 'resolved'
}

export interface Issue {
  id: string
  occurrenceId: string
  scheduleId: string
  templateId: string
  teamId: string
  itemId: string
  itemLabel: string
  category: string
  answer: string
  remarks: string
  photos: Photo[]
  raisedBy: string
  raisedAt: number
  status: 'open' | 'resolved'
  resolutionLabel?: string
  history: IssueEvent[]
}

export interface Draft {
  answers: Answer[]
  pageIndex: number
  startedAt: number
}

export interface NotifyLog {
  id: string
  at: number
  channel: 'email' | 'webhook'
  scheduleId: string
  detail: string
}

export interface ScState {
  teams: Team[]
  checkers: Checker[]
  templates: Template[]
  schedules: Schedule[]
  submissions: Submission[]
  skips: Skip[]
  issues: Issue[]
  drafts: Record<string, Draft>
  notifications: NotifyLog[]
  currentUser: string
}

/* ------------------------------------------------------------- templates */

const opt = (id: string, label: string, score: number): Option => ({
  id,
  label,
  score,
})

const YESNO = [opt('yes', 'Yes', 2), opt('no', 'No', 0)]

const TEMPLATES: Template[] = [
  {
    id: 't-nmt',
    code: 'NMT-BOC',
    name: 'Vehicle NMT — Before Operation Check',
    status: 'published',
    version: 4,
    pages: [
      {
        id: 'p1',
        title: 'Exterior & fluids',
        sections: [
          {
            id: 'sec1',
            title: 'Fluids',
            items: [
              {
                id: 'i-oil',
                type: 'choice',
                label: 'Engine oil level',
                description: 'Check on level ground with the engine cold.',
                options: [
                  opt('full', 'Full', 2),
                  opt('low', 'Low', 1),
                  opt('empty', 'Below minimum', 0),
                ],
                followUp: {
                  whenOptionId: 'low',
                  item: {
                    id: 'i-oil-litres',
                    type: 'number',
                    label: 'Litres topped up',
                    unit: 'L',
                  },
                },
              },
              {
                id: 'i-coolant',
                type: 'yesno',
                label: 'Coolant between MIN and MAX',
                options: YESNO,
              },
            ],
          },
          {
            id: 'sec2',
            title: 'Tyres & lights',
            items: [
              {
                id: 'i-tyre',
                type: 'choice',
                label: 'Tyre condition',
                description: 'All six, including the spare.',
                options: [
                  opt('good', 'Good', 2),
                  opt('worn', 'Worn', 1),
                  opt('damaged', 'Damaged', 0),
                ],
              },
              {
                id: 'i-lights',
                type: 'yesno',
                label: 'All lights and indicators functional',
                options: YESNO,
              },
            ],
          },
        ],
      },
      {
        id: 'p2',
        title: 'Cab & documentation',
        sections: [
          {
            id: 'sec3',
            title: 'Cab',
            items: [
              {
                id: 'i-warn',
                type: 'choice',
                label: 'Warning lights on start-up',
                options: [
                  opt('none', 'All clear', 2),
                  opt('amber', 'Amber showing', 1),
                  opt('red', 'Red showing', 0),
                ],
              },
              {
                id: 'i-belt',
                type: 'yesno',
                label: 'Seatbelts serviceable',
                options: YESNO,
              },
            ],
          },
          {
            id: 'sec4',
            title: 'Documentation',
            items: [
              {
                id: 'i-log',
                type: 'yesno',
                label: 'Vehicle log book present and current',
                options: YESNO,
              },
              {
                id: 'i-odo',
                type: 'number',
                label: 'Odometer reading',
                unit: 'km',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 't-gc',
    code: 'GC-HOTO',
    name: 'Guard Commander HOTO',
    status: 'published',
    version: 2,
    pages: [
      {
        id: 'p1',
        title: 'Handover',
        sections: [
          {
            id: 'sec1',
            title: 'Accountability',
            items: [
              {
                id: 'i-wpn',
                type: 'yesno',
                label: 'Weapons accounted for against the register',
                options: YESNO,
              },
              {
                id: 'i-ammo',
                type: 'yesno',
                label: 'Ammunition seal intact',
                options: YESNO,
              },
              {
                id: 'i-keys',
                type: 'number',
                label: 'Keys handed over',
                unit: 'keys',
              },
            ],
          },
          {
            id: 'sec2',
            title: 'Situation',
            items: [
              {
                id: 'i-inc',
                type: 'choice',
                label: 'Outstanding incidents',
                options: [
                  opt('none', 'None', 2),
                  opt('minor', 'Minor — logged', 1),
                  opt('major', 'Major — escalated', 0),
                ],
                followUp: {
                  whenOptionId: 'major',
                  item: {
                    id: 'i-inc-detail',
                    type: 'text',
                    label: 'Escalated to whom, and when?',
                  },
                },
              },
              {
                id: 'i-remarks',
                type: 'text',
                label: 'Remarks for the incoming commander',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 't-bdo',
    code: 'BDO-HOTO',
    name: 'BDO / CDO HOTO',
    status: 'published',
    version: 3,
    pages: [
      {
        id: 'p1',
        title: 'Duty handover',
        sections: [
          {
            id: 'sec1',
            title: 'Briefing',
            items: [
              {
                id: 'i-brief',
                type: 'yesno',
                label: 'Duty brief conducted with outgoing officer',
                options: YESNO,
              },
              {
                id: 'i-contacts',
                type: 'yesno',
                label: 'Emergency contact list current',
                options: YESNO,
              },
            ],
          },
          {
            id: 'sec2',
            title: 'Facilities',
            items: [
              {
                id: 'i-equip',
                type: 'choice',
                label: 'Duty office equipment serviceable',
                options: [
                  opt('all', 'All serviceable', 2),
                  opt('partial', 'Partially serviceable', 1),
                  opt('none', 'Unserviceable', 0),
                ],
              },
              {
                id: 'i-fire',
                type: 'yesno',
                label: 'Fire points checked and unobstructed',
                options: YESNO,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 't-ammo',
    code: 'AMMO-SPOT',
    name: 'Ammo Point Spot Check',
    status: 'draft',
    version: 1,
    pages: [
      {
        id: 'p1',
        title: 'Perimeter',
        sections: [
          {
            id: 'sec1',
            title: 'Access control',
            items: [
              {
                id: 'i-gate',
                type: 'yesno',
                label: 'Gate secured and seal intact',
                options: YESNO,
              },
            ],
          },
        ],
      },
    ],
  },
]

const TEAMS: Team[] = [
  { id: 'tm-a', name: 'Duty Team A', short: 'DTA' },
  { id: 'tm-mt', name: 'MT Line', short: 'MT' },
  { id: 'tm-gr', name: 'Guard Room', short: 'GR' },
]

const CHECKERS: Checker[] = [
  { id: 'c1', name: 'Haziq Osman', rank: '3SG', teamId: 'tm-a' },
  { id: 'c2', name: 'Wei Jie Ong', rank: 'CPL', teamId: 'tm-mt' },
  { id: 'c3', name: 'Farid Yusof', rank: '2SG', teamId: 'tm-gr' },
  { id: 'c4', name: 'Aaron Cheng', rank: 'CFC', teamId: 'tm-a' },
]

const hm = (h: number, m = 0) => h * 60 + m

const SCHEDULES: Schedule[] = [
  {
    id: 'sch-nmt',
    templateId: 't-nmt',
    teamId: 'tm-mt',
    pattern: 'daily',
    windows: [{ startMin: hm(6), endMin: hm(9) }],
    paused: false,
    emailLeadMin: 60,
    webhookLeadMin: 120,
    mailingList: 'mt-line@unit.mil',
    webhookUrl: 'https://hooks.unit.mil/smartcheck/mt-line',
  },
  {
    id: 'sch-gc',
    templateId: 't-gc',
    teamId: 'tm-gr',
    pattern: 'twice-daily',
    windows: [
      { startMin: hm(7), endMin: hm(8, 30) },
      { startMin: hm(19), endMin: hm(20, 30) },
    ],
    paused: false,
    emailLeadMin: 60,
    webhookLeadMin: 120,
    mailingList: 'guard-room@unit.mil',
    webhookUrl: 'https://hooks.unit.mil/smartcheck/guard',
  },
  {
    id: 'sch-bdo',
    templateId: 't-bdo',
    teamId: 'tm-a',
    pattern: 'daily',
    windows: [{ startMin: hm(7, 30), endMin: hm(9, 30) }],
    paused: false,
    emailLeadMin: 60,
    webhookLeadMin: 120,
    mailingList: 'duty-a@unit.mil',
    webhookUrl: 'https://hooks.unit.mil/smartcheck/duty-a',
  },
  {
    id: 'sch-bunk',
    templateId: 't-bdo',
    teamId: 'tm-a',
    pattern: 'weekly',
    dayOfWeek: 1,
    windows: [{ startMin: hm(14), endMin: hm(16) }],
    paused: false,
    emailLeadMin: 60,
    webhookLeadMin: 120,
    mailingList: 'duty-a@unit.mil',
    webhookUrl: 'https://hooks.unit.mil/smartcheck/duty-a',
  },
  {
    id: 'sch-fire',
    templateId: 't-nmt',
    teamId: 'tm-mt',
    pattern: 'monthly',
    dayOfMonth: 1,
    windows: [{ startMin: hm(9), endMin: hm(12) }],
    paused: true,
    emailLeadMin: 60,
    webhookLeadMin: 120,
    mailingList: 'mt-line@unit.mil',
    webhookUrl: 'https://hooks.unit.mil/smartcheck/mt-line',
  },
  {
    id: 'sch-ammo',
    templateId: 't-gc',
    teamId: 'tm-gr',
    pattern: 'open',
    windows: [{ startMin: 0, endMin: hm(23, 59) }],
    paused: false,
    emailLeadMin: 60,
    webhookLeadMin: 120,
    mailingList: 'guard-room@unit.mil',
    webhookUrl: 'https://hooks.unit.mil/smartcheck/guard',
  },
]

/* -------------------------------------------------------------- occurrences */

export interface Occurrence {
  id: string
  scheduleId: string
  templateId: string
  teamId: string
  windowIndex: number
  startAt: number
  endAt: number
  dateKey: string
}

export type OccState =
  | 'scheduled'
  | 'active'
  | 'in-progress'
  | 'completed'
  | 'missed'
  | 'skipped'
  | 'paused'

export const OCC_LABEL: Record<OccState, string> = {
  scheduled: 'Scheduled',
  active: 'Open now',
  'in-progress': 'In progress',
  completed: 'Completed',
  missed: 'Missed',
  skipped: 'Skipped',
  paused: 'Paused',
}

function occursOn(schedule: Schedule, day: number): boolean {
  const d = new Date(day)
  switch (schedule.pattern) {
    case 'daily':
    case 'twice-daily':
    case 'open':
      return true
    case 'weekly':
      return d.getDay() === (schedule.dayOfWeek ?? 1)
    case 'monthly':
      return d.getDate() === (schedule.dayOfMonth ?? 1)
    case 'one-time':
      return dateInputValue(day) === schedule.onDate
  }
}

/** Every window that exists on a given day, derived — never stored. */
export function occurrencesOn(state: ScState, day: number): Occurrence[] {
  const base = startOfDay(day)
  const dateKey = dateInputValue(base)
  const out: Occurrence[] = []

  for (const s of state.schedules) {
    if (!occursOn(s, base)) continue
    s.windows.forEach((w, i) => {
      // A window whose end is before its start runs past midnight.
      const spans = w.endMin <= w.startMin
      out.push({
        id: `${s.id}|${dateKey}|${i}`,
        scheduleId: s.id,
        templateId: s.templateId,
        teamId: s.teamId,
        windowIndex: i,
        startAt: base + w.startMin * MINUTE,
        endAt: base + (spans ? w.endMin + 1440 : w.endMin) * MINUTE,
        dateKey,
      })
    })
  }
  return out.sort((a, b) => a.startAt - b.startAt)
}

export function submissionsFor(state: ScState, occurrenceId: string): Submission[] {
  return state.submissions
    .filter((s) => s.occurrenceId === occurrenceId)
    .sort((a, b) => a.at - b.at)
}

export function activeSkip(state: ScState, occurrenceId: string): Skip | undefined {
  return state.skips.find((s) => s.occurrenceId === occurrenceId && !s.undoneAt)
}

export function occState(
  state: ScState,
  occ: Occurrence,
  now: number,
): OccState {
  const schedule = state.schedules.find((s) => s.id === occ.scheduleId)
  if (schedule?.paused) return 'paused'

  const submitted = submissionsFor(state, occ.id).length > 0
  const skipped = Boolean(activeSkip(state, occ.id))
  const expired = now > occ.endAt

  if (submitted) return 'completed'
  if (skipped) return 'skipped'
  if (expired) return schedule?.pattern === 'open' ? 'active' : 'missed'
  if (now < occ.startAt) return 'scheduled'
  if (state.drafts[occ.id]?.answers.length) return 'in-progress'
  return 'active'
}

export interface DayStats {
  total: number
  completed: number
  missed: number
  skipped: number
  submissions: number
  openIssues: number
  /** Skips are excluded from the denominator, exactly as the deck specifies. */
  completionPct: number
}

export function dayStats(state: ScState, day: number, now: number): DayStats {
  const occs = occurrencesOn(state, day)
  let completed = 0
  let missed = 0
  let skipped = 0
  let submissions = 0

  for (const occ of occs) {
    const st = occState(state, occ, now)
    if (st === 'completed') completed++
    else if (st === 'missed') missed++
    else if (st === 'skipped') skipped++
    submissions += submissionsFor(state, occ.id).length
  }

  const denom = occs.length - skipped
  const openIssues = state.issues.filter(
    (i) => i.status === 'open' && occs.some((o) => o.id === i.occurrenceId),
  ).length

  return {
    total: occs.length,
    completed,
    missed,
    skipped,
    submissions,
    openIssues,
    completionPct: denom > 0 ? Math.round((completed / denom) * 100) : 0,
  }
}

/* -------------------------------------------------------------- lookups */

export function templateById(state: ScState, id: string): Template | undefined {
  return state.templates.find((t) => t.id === id)
}
export function teamById(state: ScState, id: string): Team | undefined {
  return state.teams.find((t) => t.id === id)
}
export function checkerById(state: ScState, id: string): Checker | undefined {
  return state.checkers.find((c) => c.id === id)
}
export function checkerName(state: ScState, id: string): string {
  const c = checkerById(state, id)
  return c ? `${c.rank} ${c.name}` : 'Unknown'
}

export function flatItems(template: Template): { item: Item; section: Section; page: Page }[] {
  const out: { item: Item; section: Section; page: Page }[] = []
  for (const page of template.pages)
    for (const section of page.sections)
      for (const item of section.items) {
        out.push({ item, section, page })
        if (item.followUp) out.push({ item: item.followUp.item, section, page })
      }
  return out
}

/** Items a submission must answer, given the answers so far (logic applies). */
export function requiredItems(template: Template, answers: Answer[]): Item[] {
  const answerFor = (id: string) => answers.find((a) => a.itemId === id)?.value
  const out: Item[] = []
  for (const page of template.pages)
    for (const section of page.sections)
      for (const item of section.items) {
        out.push(item)
        if (item.followUp && answerFor(item.id) === item.followUp.whenOptionId) {
          out.push(item.followUp.item)
        }
      }
  return out
}

export function pageItems(page: Page, answers: Answer[]): Item[] {
  const answerFor = (id: string) => answers.find((a) => a.itemId === id)?.value
  const out: Item[] = []
  for (const section of page.sections)
    for (const item of section.items) {
      out.push(item)
      if (item.followUp && answerFor(item.id) === item.followUp.whenOptionId)
        out.push(item.followUp.item)
    }
  return out
}

export function optionLabel(item: Item, value: string): string {
  return item.options?.find((o) => o.id === value)?.label ?? value
}

export function scoreOf(template: Template, answers: Answer[]): {
  score: number
  max: number
} {
  let score = 0
  let max = 0
  for (const { item } of flatItems(template)) {
    if (!item.options?.length) continue
    const best = Math.max(...item.options.map((o) => o.score))
    max += best
    const a = answers.find((x) => x.itemId === item.id)
    if (a) score += item.options.find((o) => o.id === a.value)?.score ?? 0
  }
  return { score, max }
}

/* ------------------------------------------------------------------- seed */

/** Deterministic PRNG so seeded history is identical on every reset. */
function hashed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

function seed(t0: number): ScState {
  const base: ScState = {
    teams: TEAMS,
    checkers: CHECKERS,
    templates: TEMPLATES,
    schedules: SCHEDULES,
    submissions: [],
    skips: [],
    issues: [],
    drafts: {},
    notifications: [],
    currentUser: 'c3',
  }

  // Seven days of history so the day stepper and "latest answer" views have
  // something real to show.
  for (let back = 7; back >= 0; back--) {
    const day = startOfDay(t0 - back * DAY)
    for (const occ of occurrencesOn(base, day)) {
      const schedule = base.schedules.find((s) => s.id === occ.scheduleId)!
      if (schedule.paused) continue
      if (occ.endAt > t0) continue // still open today — leave it for the user

      const roll = hashed(occ.id)
      if (roll < 0.1) continue // left to expire → Missed
      if (roll < 0.17) {
        base.skips.push({
          id: makeId('sk'),
          occurrenceId: occ.id,
          reason:
            roll < 0.13
              ? 'Vehicle deployed on outfield exercise — not in camp during the window.'
              : 'Team stood down for medical parade; check reassigned to the next window.',
          by: teamCheckers(base, occ.teamId)[0]?.id ?? 'c1',
          at: occ.startAt + 20 * MINUTE,
        })
        continue
      }

      const template = templateById(base, occ.templateId)!
      const who = teamCheckers(base, occ.teamId)
      const by = who[Math.floor(hashed(occ.id + 'w') * who.length)] ?? who[0]
      const at = occ.startAt + Math.floor(hashed(occ.id + 't') * 45 + 8) * MINUTE

      const answers: Answer[] = []
      let flagged: { item: Item; section: Section; value: string } | null = null

      for (const page of template.pages) {
        for (const section of page.sections) {
          for (const item of section.items) {
            const r = hashed(occ.id + item.id)
            let value: string
            if (item.type === 'number') {
              value = String(Math.round(120 + r * 900))
            } else if (item.type === 'text') {
              value = 'Nil significant. Handover completed on time.'
            } else {
              const options = item.options ?? YESNO
              // Mostly good answers, with the occasional finding.
              const idx = r > 0.86 ? options.length - 1 : r > 0.74 ? Math.min(1, options.length - 1) : 0
              value = options[idx].id
              if (idx > 0 && !flagged && r > 0.86) {
                flagged = { item, section, value }
              }
            }
            answers.push({ itemId: item.id, value, by: by.id, at })
            if (item.followUp && value === item.followUp.whenOptionId) {
              answers.push({
                itemId: item.followUp.item.id,
                value: item.followUp.item.type === 'number' ? '2' : 'Topped up on the spot.',
                by: by.id,
                at,
              })
            }
          }
        }
      }

      const seq = base.submissions.filter((s) => s.occurrenceId === occ.id).length + 1
      base.submissions.push({
        id: makeId('sub'),
        occurrenceId: occ.id,
        scheduleId: occ.scheduleId,
        templateId: occ.templateId,
        teamId: occ.teamId,
        at,
        by: by.id,
        answers,
        seq,
      })

      if (flagged) {
        const resolved = back > 3
        base.issues.push({
          id: makeId('iss'),
          occurrenceId: occ.id,
          scheduleId: occ.scheduleId,
          templateId: occ.templateId,
          teamId: occ.teamId,
          itemId: flagged.item.id,
          itemLabel: flagged.item.label,
          category: flagged.section.title,
          answer: optionLabel(flagged.item, flagged.value),
          remarks: ISSUE_REMARKS[Math.floor(hashed(occ.id + 'r') * ISSUE_REMARKS.length)],
          photos: [
            { id: makeId('ph'), name: 'IMG_0418.JPG', seed: Math.floor(hashed(occ.id + 'p1') * 360) },
            ...(hashed(occ.id + 'p2') > 0.5
              ? [{ id: makeId('ph'), name: 'IMG_0419.JPG', seed: Math.floor(hashed(occ.id + 'p2') * 360) }]
              : []),
          ],
          raisedBy: by.id,
          raisedAt: at,
          status: resolved ? 'resolved' : 'open',
          resolutionLabel: resolved ? 'Rectified on site' : undefined,
          history: [
            { at, by: by.id, note: 'Issue raised during the check.', kind: 'raised' },
            ...(resolved
              ? [
                  {
                    at: at + 2 * DAY,
                    by: by.id,
                    note: 'Part replaced by MT technician. Verified serviceable.',
                    kind: 'resolved' as const,
                  },
                ]
              : []),
          ],
        })
      }
    }
  }

  return base
}

const ISSUE_REMARKS = [
  'Tread depth below the wear indicator on the near-side rear. Vehicle held pending replacement.',
  'Amber warning persists after restart. Logged with MT for diagnostic.',
  'Seal number does not match the register entry. Escalated to the Guard Commander.',
  'Fire point partially obstructed by stored equipment. Cleared and photographed.',
  'Log book missing the last two entries. Raised with the outgoing driver.',
]

export function teamCheckers(state: ScState, teamId: string): Checker[] {
  return state.checkers.filter((c) => c.teamId === teamId)
}

export const { Provider: ScProvider, useStore: useSc } = createDemoStore<ScState>({
  key: 'smainno.smartcheck.v1',
  version: 1,
  seed,
})
