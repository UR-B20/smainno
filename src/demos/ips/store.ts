import { createDemoStore, makeId } from '@/lib/store'
import { DAY, HOUR, MINUTE } from '@/lib/time'

/* ============================================================================
   DIGITAL IPS — model

   The pipeline is FormSG → SharePoint list → dashboard view. What the replica
   adds is the part that actually costs people time: the 24-hour recording
   mandate as a live clock running across all three, and an execution status
   that carries a case through to closure.
   ========================================================================= */

export const STAGES = ['reported', 'awarded', 'closed'] as const
export type Stage = (typeof STAGES)[number]

export const STAGE_LABEL: Record<Stage, string> = {
  reported: 'Reported',
  awarded: 'Awarded',
  closed: 'Closed',
}

export const OFFENCES = [
  'Late for duty',
  'Improper turnout',
  'Failure to comply with instructions',
  'Absent from appointed place',
  'Loss of equipment',
  'Unsafe act',
] as const
export type Offence = (typeof OFFENCES)[number]

export const AWARDS = [
  'Verbal warning',
  'Extra duty',
  'Confinement to camp',
  'Stoppage of leave',
  'Counselling only',
] as const
export type Award = (typeof AWARDS)[number]

export interface Officer {
  id: string
  rank: string
  name: string
  appt: string
  coy: string
  /** Only approving appointments may record an award. */
  deliberator: boolean
}

export interface Deliberation {
  decidedAt: number
  decidedBy: string
  award: Award
  quantum: number
  rationale: string
}

export interface IpsCase {
  id: string
  ref: string
  subjectRank: string
  subjectName: string
  coy: string
  offence: Offence
  incidentAt: number
  reportedAt: number
  reportedBy: string
  place: string
  narrative: string
  witnesses: string
  stage: Stage
  deliberation?: Deliberation
  /** Every stage change, appended. */
  log: { at: number; by: string; note: string }[]
}

export interface IpsState {
  officers: Officer[]
  cases: IpsCase[]
  currentUser: string
  nextRef: number
}

/* ------------------------------------------------------------------- seed */

export const OFFICERS: Officer[] = [
  {
    id: 'o1',
    rank: 'CPT',
    name: 'Elias Ng',
    appt: 'OC Alpha Coy',
    coy: 'Alpha Coy',
    deliberator: true,
  },
  {
    id: 'o2',
    rank: 'LTA',
    name: 'Priya Menon',
    appt: 'PC 2 Platoon',
    coy: 'Alpha Coy',
    deliberator: false,
  },
  {
    id: 'o3',
    rank: '1SG',
    name: 'Rashid Kamal',
    appt: 'Coy Sergeant Major',
    coy: 'Bravo Coy',
    deliberator: true,
  },
  {
    id: 'o4',
    rank: '3SG',
    name: 'Marcus Teo',
    appt: 'Section Commander',
    coy: 'Bravo Coy',
    deliberator: false,
  },
  {
    id: 'o5',
    rank: '2SG',
    name: 'Joanne Lau',
    appt: 'Duty NCO',
    coy: 'Support Coy',
    deliberator: false,
  },
]

export const MANDATE_MS = 24 * HOUR

interface SeedCase {
  ref: string
  subjectRank: string
  subjectName: string
  coy: string
  offence: Offence
  incidentOffsetH: number
  reportDelayMin: number
  reportedBy: string
  place: string
  narrative: string
  witnesses: string
  stage: Stage
  award?: Award
  quantum?: number
  rationale?: string
  decidedBy?: string
  decideDelayH?: number
}

const SEED: SeedCase[] = [
  {
    ref: 'IPS-2026-031',
    subjectRank: 'PTE',
    subjectName: 'Lim Jun Hao',
    coy: 'Alpha Coy',
    offence: 'Late for duty',
    incidentOffsetH: -19 * 24,
    reportDelayMin: 40,
    reportedBy: 'o2',
    place: 'Guard Room',
    narrative:
      'Reported for guard duty 35 minutes after the stipulated fall-in time. No prior notification given to the Duty NCO.',
    witnesses: '2SG Joanne Lau (Duty NCO)',
    stage: 'closed',
    award: 'Extra duty',
    quantum: 2,
    rationale:
      'First offence, admitted readily. Two extra duties assessed as proportionate.',
    decidedBy: 'o1',
    decideDelayH: 6,
  },
  {
    ref: 'IPS-2026-032',
    subjectRank: 'CFC',
    subjectName: 'Danish Rahman',
    coy: 'Bravo Coy',
    offence: 'Improper turnout',
    incidentOffsetH: -16 * 24,
    reportDelayMin: 25,
    reportedBy: 'o4',
    place: 'Coy Line',
    narrative:
      'Turned out for morning parade without the prescribed field pack contents. Two items short on inspection.',
    witnesses: '1SG Rashid Kamal',
    stage: 'closed',
    award: 'Verbal warning',
    quantum: 0,
    rationale:
      'Shortfall rectified within the hour and no operational impact. Warning recorded.',
    decidedBy: 'o3',
    decideDelayH: 4,
  },
  {
    ref: 'IPS-2026-033',
    subjectRank: 'PTE',
    subjectName: 'Wong Kai Sheng',
    coy: 'Alpha Coy',
    offence: 'Late for duty',
    incidentOffsetH: -12 * 24,
    reportDelayMin: 55,
    reportedBy: 'o5',
    place: 'Guard Room',
    narrative:
      'Failed to report for the 1900 guard shift. Located in bunk 20 minutes after fall-in.',
    witnesses: '2SG Joanne Lau (Duty NCO)',
    stage: 'closed',
    award: 'Extra duty',
    quantum: 3,
    rationale:
      'Second late report within the quarter. Escalated from two duties to three.',
    decidedBy: 'o1',
    decideDelayH: 9,
  },
  {
    ref: 'IPS-2026-034',
    subjectRank: 'LCP',
    subjectName: 'Nurul Aisyah',
    coy: 'Support Coy',
    offence: 'Loss of equipment',
    incidentOffsetH: -9 * 24,
    reportDelayMin: 90,
    reportedBy: 'o5',
    place: 'MT Line',
    narrative:
      'One set of vehicle keys unaccounted for at end of shift. Recovered the following morning from a spare uniform pocket.',
    witnesses: 'CPL Wei Jie Ong',
    stage: 'closed',
    award: 'Confinement to camp',
    quantum: 3,
    rationale:
      'Keys recovered without operational loss, but accountability procedure was not followed at handover. Recording was itself late — the report sat unopened over the weekend.',
    decidedBy: 'o3',
    decideDelayH: 31,
  },
  {
    ref: 'IPS-2026-035',
    subjectRank: 'PTE',
    subjectName: 'Tan Yong Xin',
    coy: 'Bravo Coy',
    offence: 'Failure to comply with instructions',
    incidentOffsetH: -6 * 24,
    reportDelayMin: 30,
    reportedBy: 'o4',
    place: 'Training Shed',
    narrative:
      'Continued using a mobile device after a direct instruction to secure all devices before the brief.',
    witnesses: '3SG Marcus Teo',
    stage: 'closed',
    award: 'Stoppage of leave',
    quantum: 1,
    rationale:
      'Direct instruction disregarded in front of the section. One weekend stoppage awarded.',
    decidedBy: 'o3',
    decideDelayH: 7,
  },
  {
    ref: 'IPS-2026-036',
    subjectRank: 'PTE',
    subjectName: 'Chua Ming Feng',
    coy: 'Alpha Coy',
    offence: 'Improper turnout',
    incidentOffsetH: -3 * 24,
    reportDelayMin: 20,
    reportedBy: 'o2',
    place: 'Parade Square',
    narrative:
      'Turned out with non-regulation footwear for the commander’s inspection.',
    witnesses: 'LTA Priya Menon',
    stage: 'awarded',
    award: 'Extra duty',
    quantum: 1,
    rationale: 'Minor, immediately corrected. One extra duty.',
    decidedBy: 'o1',
    decideDelayH: 5,
  },
  {
    ref: 'IPS-2026-037',
    subjectRank: 'CFC',
    subjectName: 'Ravi Shankar',
    coy: 'Support Coy',
    offence: 'Unsafe act',
    incidentOffsetH: -22,
    reportDelayMin: 45,
    reportedBy: 'o5',
    place: 'MT Line',
    narrative:
      'Reversed a vehicle without a ground guide in a congested area of the MT line.',
    witnesses: 'CPL Wei Jie Ong',
    stage: 'awarded',
    award: 'Confinement to camp',
    quantum: 2,
    rationale:
      'Safety procedure bypassed in a high-risk area. Confinement awarded with a re-brief on ground guide procedure.',
    decidedBy: 'o3',
    decideDelayH: 20,
  },
  {
    ref: 'IPS-2026-038',
    subjectRank: 'PTE',
    subjectName: 'Goh Wei Liang',
    coy: 'Bravo Coy',
    offence: 'Late for duty',
    incidentOffsetH: -20,
    reportDelayMin: 35,
    reportedBy: 'o4',
    place: 'Coy Line',
    narrative:
      'Absent from the 0730 fall-in without notification. Reported 25 minutes late.',
    witnesses: '3SG Marcus Teo',
    stage: 'reported',
  },
  {
    ref: 'IPS-2026-039',
    subjectRank: 'LCP',
    subjectName: 'Syafiq Hassan',
    coy: 'Alpha Coy',
    offence: 'Absent from appointed place',
    incidentOffsetH: -2,
    reportDelayMin: 50,
    reportedBy: 'o2',
    place: 'Company Line',
    narrative:
      'Not present at the appointed muster point during the accountability check. Located in the cookhouse.',
    witnesses: 'LTA Priya Menon',
    stage: 'reported',
  },
]

function seed(t0: number): IpsState {
  const cases: IpsCase[] = []

  for (const s of SEED) {
    const incidentAt = t0 + s.incidentOffsetH * HOUR
    const reportedAt = incidentAt + s.reportDelayMin * MINUTE
    const id = makeId('c')

    const log: IpsCase['log'] = [
      { at: reportedAt, by: s.reportedBy, note: 'Report submitted via FormSG intake.' },
    ]

    let deliberation: Deliberation | undefined
    if (s.award && s.decidedBy) {
      const decidedAt = incidentAt + (s.decideDelayH ?? 6) * HOUR
      deliberation = {
        decidedAt,
        decidedBy: s.decidedBy,
        award: s.award,
        quantum: s.quantum ?? 0,
        rationale: s.rationale ?? '',
      }
      log.push({
        at: decidedAt,
        by: s.decidedBy,
        note: `Award recorded: ${s.award}${s.quantum ? ` ×${s.quantum}` : ''}.`,
      })

      if (s.stage === 'closed') {
        log.push({
          at: decidedAt + 4 * HOUR,
          by: s.decidedBy,
          note: 'Award executed. Case closed.',
        })
      }
    }

    cases.push({
      id,
      ref: s.ref,
      subjectRank: s.subjectRank,
      subjectName: s.subjectName,
      coy: s.coy,
      offence: s.offence,
      incidentAt,
      reportedAt,
      reportedBy: s.reportedBy,
      place: s.place,
      narrative: s.narrative,
      witnesses: s.witnesses,
      stage: s.stage,
      deliberation,
      log,
    })
  }

  return {
    officers: OFFICERS,
    cases: cases.sort((a, b) => b.reportedAt - a.reportedAt),
    currentUser: 'o1',
    nextRef: 40,
  }
}

export const { Provider: IpsProvider, useStore: useIps } = createDemoStore<IpsState>({
  key: 'smainno.ips.v1',
  version: 1,
  seed,
})

/* -------------------------------------------------------------- selectors */

export function officerById(state: IpsState, id: string): Officer {
  return (
    state.officers.find((o) => o.id === id) ?? {
      id,
      rank: '',
      name: 'Unknown',
      appt: '',
      coy: '',
      deliberator: false,
    }
  )
}

export function officerName(state: IpsState, id: string): string {
  const o = officerById(state, id)
  return `${o.rank} ${o.name}`
}

export function mandateAt(c: IpsCase): number {
  return c.incidentAt + MANDATE_MS
}

/** A case is "recorded" once an award has been made. */
export function isRecorded(c: IpsCase): boolean {
  return Boolean(c.deliberation)
}

export function mandateBreached(c: IpsCase, now: number): boolean {
  const deadline = mandateAt(c)
  return c.deliberation ? c.deliberation.decidedAt > deadline : now > deadline
}

export interface IpsStats {
  open: number
  awaitingRecord: number
  breached: number
  withinMandate: number
  recorded: number
  compliancePct: number
  outstanding: number
}

export function stats(state: IpsState, now: number): IpsStats {
  const recorded = state.cases.filter(isRecorded)
  const withinMandate = recorded.filter((c) => !mandateBreached(c, now)).length
  return {
    open: state.cases.filter((c) => c.stage !== 'closed').length,
    awaitingRecord: state.cases.filter((c) => c.stage === 'reported').length,
    breached: state.cases.filter((c) => mandateBreached(c, now)).length,
    withinMandate,
    recorded: recorded.length,
    compliancePct:
      recorded.length > 0 ? Math.round((withinMandate / recorded.length) * 100) : 100,
    outstanding: state.cases.filter((c) => c.stage === 'awarded').length,
  }
}

/* ---------------------------------------------------------------- actions */

export function recordAward(
  state: IpsState,
  args: {
    caseId: string
    award: Award
    quantum: number
    rationale: string
    at: number
  },
): IpsState {
  const target = state.cases.find((c) => c.id === args.caseId)
  if (!target) return state

  const deliberation: Deliberation = {
    decidedAt: args.at,
    decidedBy: state.currentUser,
    award: args.award,
    quantum: args.quantum,
    rationale: args.rationale,
  }

  return {
    ...state,
    cases: state.cases.map((c) =>
      c.id === target.id
        ? {
            ...c,
            stage: 'awarded' as Stage,
            deliberation,
            log: [
              ...c.log,
              {
                at: args.at,
                by: state.currentUser,
                note: `Award recorded: ${args.award}${args.quantum ? ` ×${args.quantum}` : ''}.`,
              },
            ],
          }
        : c,
    ),
  }
}

/** The register's execution status: an award is not finished until it is done. */
export function markExecuted(
  state: IpsState,
  caseId: string,
  at: number,
): IpsState {
  return {
    ...state,
    cases: state.cases.map((c) =>
      c.id === caseId && c.stage === 'awarded'
        ? {
            ...c,
            stage: 'closed' as Stage,
            log: [
              ...c.log,
              {
                at,
                by: state.currentUser,
                note: 'Award executed. Case closed.',
              },
            ],
          }
        : c,
    ),
  }
}

export const DAY_MS = DAY
