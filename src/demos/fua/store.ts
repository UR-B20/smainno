import { createDemoStore, makeId } from '@/lib/store'
import { DAY, HOUR, MINUTE } from '@/lib/time'

/* ============================================================================
   FUA TRACKER — model

   The rule that makes the whole thing work, straight from the deck: you only
   ever type your own update. Parent status is never set by hand — it is
   recalculated from its subtasks (`rollUp`), and every change is appended to an
   immutable update log rather than overwriting anything.
   ========================================================================= */

export const STATUSES = [
  'Not Started',
  'In Progress',
  'Blocked',
  'Completed',
] as const
export type Status = (typeof STATUSES)[number]

export const PRIORITIES = ['High', 'Medium', 'Low'] as const
export type Priority = (typeof PRIORITIES)[number]

export interface Person {
  id: string
  name: string
  rank: string
  appt: string
  leader: boolean
}

export interface Fua {
  id: string
  ref: string
  title: string
  detail: string
  meeting: string
  meetingAt: number
  raisedBy: string
  priority: Priority
  dueAt: number
  createdAt: number
}

export interface Subtask {
  id: string
  ref: string
  fuaId: string
  title: string
  assignee: string
  dueAt: number
  priority: Priority
  status: Status
}

export type EntryKind = 'raise' | 'assign' | 'notify' | 'status'

/** Append-only. Nothing in the app ever mutates or deletes an entry. */
export interface Entry {
  id: string
  at: number
  kind: EntryKind
  actor: string
  subtaskId?: string
  fuaId: string
  from?: Status
  to?: Status
  note: string
}

export interface FuaState {
  people: Person[]
  fuas: Fua[]
  subtasks: Subtask[]
  log: Entry[]
  /** Who you are signed in as — drives the role-aware menu. */
  currentUser: string
  /** Next number in the automatic reference series. */
  nextRef: number
}

/* ------------------------------------------------------------------- seed */

export const PEOPLE: Person[] = [
  {
    id: 'p1',
    name: 'Tan Wei Ming',
    rank: 'MAJ',
    appt: 'Branch Head',
    leader: true,
  },
  {
    id: 'p2',
    name: 'Nurul Iman',
    rank: 'ME4',
    appt: 'Systems Engineer',
    leader: false,
  },
  {
    id: 'p3',
    name: 'Kavin Raj',
    rank: '3SG',
    appt: 'Ops Clerk',
    leader: false,
  },
  {
    id: 'p4',
    name: 'Sofia Rahim',
    rank: 'CPT',
    appt: 'S3 Plans',
    leader: false,
  },
  {
    id: 'p5',
    name: 'Daniel Lim',
    rank: 'ME3',
    appt: 'Infra Lead',
    leader: false,
  },
]

export function personById(state: FuaState, id: string): Person {
  return (
    state.people.find((p) => p.id === id) ?? {
      id,
      name: 'Unknown',
      rank: '',
      appt: '',
      leader: false,
    }
  )
}

export function displayName(p: Person): string {
  return `${p.rank} ${p.name}`
}

/** Entries raised by the automation have no person behind them. */
export function actorName(state: FuaState, id: string): string {
  return id === 'system' ? 'Automation' : displayName(personById(state, id))
}

function seed(t0: number): FuaState {
  const fuas: Fua[] = [
    {
      id: 'f1',
      ref: 'FUA-2026-011',
      title: 'Publish revised vehicle NMT checklist for Bde-wide adoption',
      detail:
        'Consolidate feedback from the trial units, revise the NMT checklist and route through Safety for endorsement before Bde-wide publication.',
      meeting: '15C4I Weekly Coord Conf',
      meetingAt: t0 - 11 * DAY,
      raisedBy: 'p1',
      priority: 'High',
      dueAt: t0 + 4 * DAY + 7 * HOUR,
      createdAt: t0 - 11 * DAY + 2 * HOUR,
    },
    {
      id: 'f2',
      ref: 'FUA-2026-012',
      title: 'Close out Q2 infrastructure audit findings',
      detail:
        'Fourteen findings raised at the Q2 audit. Each owner to rectify and submit evidence; Infra Lead to consolidate the closure report.',
      meeting: 'Quarterly Safety Conference',
      meetingAt: t0 - 9 * DAY,
      raisedBy: 'p1',
      priority: 'High',
      dueAt: t0 - 1 * DAY - 3 * HOUR,
      createdAt: t0 - 9 * DAY + 90 * MINUTE,
    },
    {
      id: 'f3',
      ref: 'FUA-2026-013',
      title: 'Prepare the capability showcase for the Innovation Review',
      detail:
        'Assemble the three-project showcase, rehearse the walkthrough and confirm the classification marking on every slide.',
      meeting: 'Innovation Review',
      meetingAt: t0 - 5 * DAY,
      raisedBy: 'p1',
      priority: 'Medium',
      dueAt: t0 + 2 * DAY + 6 * HOUR,
      createdAt: t0 - 5 * DAY + 45 * MINUTE,
    },
    {
      id: 'f4',
      ref: 'FUA-2026-014',
      title: 'Refresh duty roster handover brief for incoming batch',
      detail:
        'Update the HOTO brief to reflect the new guard commander sequence and reissue to all duty personnel.',
      meeting: 'Bde Ops Sync',
      meetingAt: t0 - 20 * DAY,
      raisedBy: 'p1',
      priority: 'Low',
      dueAt: t0 - 3 * DAY,
      createdAt: t0 - 20 * DAY + 30 * MINUTE,
    },
  ]

  const subtasks: Subtask[] = [
    {
      id: 's1',
      ref: 'FUA-2026-011.1',
      fuaId: 'f1',
      title: 'Consolidate trial-unit feedback into a single change log',
      assignee: 'p2',
      dueAt: t0 + 1 * DAY + 7 * HOUR,
      priority: 'High',
      status: 'In Progress',
    },
    {
      id: 's2',
      ref: 'FUA-2026-011.2',
      fuaId: 'f1',
      title: 'Route revised checklist through Safety for endorsement',
      assignee: 'p4',
      dueAt: t0 + 3 * DAY + 7 * HOUR,
      priority: 'High',
      status: 'Not Started',
    },
    {
      id: 's3',
      ref: 'FUA-2026-011.3',
      fuaId: 'f1',
      title: 'Stage the published version on the unit SharePoint',
      assignee: 'p3',
      dueAt: t0 + 4 * DAY + 7 * HOUR,
      priority: 'Medium',
      status: 'Not Started',
    },
    {
      id: 's4',
      ref: 'FUA-2026-012.1',
      fuaId: 'f2',
      title: 'Rectify the nine electrical findings in Blk 42',
      assignee: 'p5',
      dueAt: t0 - 2 * DAY,
      priority: 'High',
      status: 'Blocked',
    },
    {
      id: 's5',
      ref: 'FUA-2026-012.2',
      fuaId: 'f2',
      title: 'Submit rectification evidence to the audit team',
      assignee: 'p2',
      dueAt: t0 - 1 * DAY - 3 * HOUR,
      priority: 'High',
      status: 'In Progress',
    },
    {
      id: 's6',
      ref: 'FUA-2026-013.1',
      fuaId: 'f3',
      title: 'Build the three-project deck and confirm markings',
      assignee: 'p2',
      dueAt: t0 + 6 * HOUR,
      priority: 'Medium',
      status: 'In Progress',
    },
    {
      id: 's7',
      ref: 'FUA-2026-013.2',
      fuaId: 'f3',
      title: 'Book the conference room and test the display feed',
      assignee: 'p3',
      dueAt: t0 + 2 * DAY + 6 * HOUR,
      priority: 'Low',
      status: 'Completed',
    },
    {
      id: 's8',
      ref: 'FUA-2026-014.1',
      fuaId: 'f4',
      title: 'Draft the revised guard commander HOTO sequence',
      assignee: 'p4',
      dueAt: t0 - 5 * DAY,
      priority: 'Low',
      status: 'Completed',
    },
    {
      id: 's9',
      ref: 'FUA-2026-014.2',
      fuaId: 'f4',
      title: 'Reissue the brief to all duty personnel',
      assignee: 'p3',
      dueAt: t0 - 3 * DAY,
      priority: 'Low',
      status: 'Completed',
    },
  ]

  const log: Entry[] = []
  const push = (e: Omit<Entry, 'id'>) =>
    log.push({ ...e, id: makeId('e') })

  for (const f of fuas) {
    push({
      at: f.createdAt,
      kind: 'raise',
      actor: f.raisedBy,
      fuaId: f.id,
      note: `Raised ${f.ref} from ${f.meeting}`,
    })
  }
  for (const s of subtasks) {
    const f = fuas.find((x) => x.id === s.fuaId)!
    push({
      at: f.createdAt + 20 * MINUTE,
      kind: 'assign',
      actor: f.raisedBy,
      fuaId: s.fuaId,
      subtaskId: s.id,
      note: `Assigned ${s.ref}`,
    })
    push({
      at: f.createdAt + 21 * MINUTE,
      kind: 'notify',
      actor: 'system',
      fuaId: s.fuaId,
      subtaskId: s.id,
      note: 'Teams notification sent to assignee',
    })
  }

  // A plausible history so the ledger and audit trails are not empty.
  push({
    at: t0 - 8 * DAY,
    kind: 'status',
    actor: 'p4',
    fuaId: 'f4',
    subtaskId: 's8',
    from: 'Not Started',
    to: 'In Progress',
    note: 'Drafting against the new sequence issued by Bde.',
  })
  push({
    at: t0 - 6 * DAY,
    kind: 'status',
    actor: 'p4',
    fuaId: 'f4',
    subtaskId: 's8',
    from: 'In Progress',
    to: 'Completed',
    note: 'Draft endorsed by Branch Head. Handing to Ops Clerk for issue.',
  })
  push({
    at: t0 - 4 * DAY,
    kind: 'status',
    actor: 'p3',
    fuaId: 'f4',
    subtaskId: 's9',
    from: 'Not Started',
    to: 'Completed',
    note: 'Reissued to all duty personnel via the duty distribution list.',
  })
  push({
    at: t0 - 6 * DAY,
    kind: 'status',
    actor: 'p5',
    fuaId: 'f2',
    subtaskId: 's4',
    from: 'Not Started',
    to: 'In Progress',
    note: 'Walked the block with the technician. Six of nine are quick fixes.',
  })
  push({
    at: t0 - 2 * DAY - 4 * HOUR,
    kind: 'status',
    actor: 'p5',
    fuaId: 'f2',
    subtaskId: 's4',
    from: 'In Progress',
    to: 'Blocked',
    note: 'Remaining three need a licensed contractor. Awaiting quotation approval.',
  })
  push({
    at: t0 - 3 * DAY,
    kind: 'status',
    actor: 'p2',
    fuaId: 'f2',
    subtaskId: 's5',
    from: 'Not Started',
    to: 'In Progress',
    note: 'Evidence pack started; waiting on Blk 42 before it can be submitted.',
  })
  push({
    at: t0 - 7 * DAY,
    kind: 'status',
    actor: 'p2',
    fuaId: 'f1',
    subtaskId: 's1',
    from: 'Not Started',
    to: 'In Progress',
    note: 'Feedback from four trial units received; two outstanding.',
  })
  push({
    at: t0 - 2 * DAY,
    kind: 'status',
    actor: 'p3',
    fuaId: 'f3',
    subtaskId: 's7',
    from: 'Not Started',
    to: 'Completed',
    note: 'Room booked, display feed tested against the laptop.',
  })
  push({
    at: t0 - 26 * HOUR,
    kind: 'status',
    actor: 'p2',
    fuaId: 'f3',
    subtaskId: 's6',
    from: 'Not Started',
    to: 'In Progress',
    note: 'Deck skeleton done. Classification marking pending confirmation.',
  })

  log.sort((a, b) => a.at - b.at)

  return {
    people: PEOPLE,
    fuas,
    subtasks,
    log,
    currentUser: 'p1',
    nextRef: 15,
  }
}

export const { Provider: FuaProvider, useStore: useFua } = createDemoStore<FuaState>({
  key: 'smainno.fua.v1',
  version: 1,
  seed,
})

/* -------------------------------------------------------------- selectors */

/**
 * Parent status is derived, never stored. This is the "roll-up" step of the
 * six-step loop, and the reason nobody can quietly mark their own FUA green.
 */
export function rollUp(subtasks: Subtask[]): Status {
  if (subtasks.length === 0) return 'Not Started'
  if (subtasks.every((s) => s.status === 'Completed')) return 'Completed'
  if (subtasks.some((s) => s.status === 'Blocked')) return 'Blocked'
  if (subtasks.some((s) => s.status !== 'Not Started')) return 'In Progress'
  return 'Not Started'
}

export function subtasksOf(state: FuaState, fuaId: string): Subtask[] {
  return state.subtasks.filter((s) => s.fuaId === fuaId)
}

export function fuaStatus(state: FuaState, fuaId: string): Status {
  return rollUp(subtasksOf(state, fuaId))
}

export function progressOf(state: FuaState, fuaId: string): number {
  const subs = subtasksOf(state, fuaId)
  if (!subs.length) return 0
  return Math.round(
    (subs.filter((s) => s.status === 'Completed').length / subs.length) * 100,
  )
}

export function isOverdue(s: Subtask, now: number): boolean {
  return s.status !== 'Completed' && s.dueAt < now
}

export function isDueSoon(s: Subtask, now: number): boolean {
  return (
    s.status !== 'Completed' &&
    s.dueAt >= now &&
    s.dueAt - now <= 7 * DAY
  )
}

export interface Kpis {
  open: number
  dueSoon: number
  overdue: number
  completed: number
}

export function kpis(state: FuaState, now: number): Kpis {
  const open = state.fuas.filter(
    (f) => fuaStatus(state, f.id) !== 'Completed',
  ).length
  const completed = state.fuas.filter(
    (f) => fuaStatus(state, f.id) === 'Completed',
  ).length
  return {
    open,
    completed,
    dueSoon: state.subtasks.filter((s) => isDueSoon(s, now)).length,
    overdue: state.subtasks.filter((s) => isOverdue(s, now)).length,
  }
}

/** Overdue plus blocked, the two things a leader has to act on. */
export function needsAttention(state: FuaState, now: number): Subtask[] {
  return state.subtasks
    .filter((s) => isOverdue(s, now) || s.status === 'Blocked')
    .sort((a, b) => a.dueAt - b.dueAt)
}

export function logFor(state: FuaState, subtaskId: string): Entry[] {
  return state.log
    .filter((e) => e.subtaskId === subtaskId)
    .sort((a, b) => a.at - b.at)
}

export function recentLog(state: FuaState, limit = 40): Entry[] {
  return [...state.log].sort((a, b) => b.at - a.at).slice(0, limit)
}

export function nextSubtaskRef(state: FuaState, fuaId: string): string {
  const fua = state.fuas.find((f) => f.id === fuaId)
  const n = subtasksOf(state, fuaId).length + 1
  return `${fua?.ref ?? 'FUA'}.${n}`
}

/* ---------------------------------------------------------------- actions */

export function appendEntry(state: FuaState, entry: Omit<Entry, 'id'>): FuaState {
  return { ...state, log: [...state.log, { ...entry, id: makeId('e') }] }
}

export function postUpdate(
  state: FuaState,
  args: { subtaskId: string; to: Status; note: string; at: number },
): FuaState {
  const subtask = state.subtasks.find((s) => s.id === args.subtaskId)
  if (!subtask) return state
  const from = subtask.status

  const subtasks = state.subtasks.map((s) =>
    s.id === args.subtaskId ? { ...s, status: args.to } : s,
  )

  return appendEntry(
    { ...state, subtasks },
    {
      at: args.at,
      kind: 'status',
      actor: state.currentUser,
      fuaId: subtask.fuaId,
      subtaskId: subtask.id,
      from,
      to: args.to,
      note: args.note,
    },
  )
}
