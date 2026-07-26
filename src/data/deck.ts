/**
 * Source of truth for the showcase narrative.
 *
 * Every string in this file is lifted from "SMA INNOVATION HUDDLE_15C4I.pptx"
 * (27 July 26).
 */

export type ProjectId = 'digital-ips' | 'fua-tracker' | 'smartcheck'

export interface ScreenSpec {
  /** e.g. "SCREEN 01 · FOR TEAM LEADERS" */
  eyebrow: string
  title: string
  /** The A / B / C callouts printed beside the screenshot in the deck. */
  callouts: { key: string; title: string; body: string }[]
  /** Route hash that deep-links the live replica to this screen. */
  demoScreen?: string
  /** Looks up `public/slides/<project-id>-<slide>.png`, if that file exists. */
  slide?: string
}

export interface Project {
  id: ProjectId
  index: string
  name: string
  /** One-liner from the agenda slide. */
  tagline: string
  /** Longer positioning line written for the showcase. */
  premise: string
  status: string
  /** Short form, for tight rows like the agenda card. */
  statusShort: string
  statusTone: 'live' | 'build' | 'pilot'
  accent: 'azure' | 'brass' | 'jade'
  /** Two-to-four word capability chips. */
  capabilities: string[]
  problem: {
    eyebrow: string
    items: { index: string; title: string; body: string }[]
  }
  product?: {
    eyebrow: string
    headline: string
    proofs: string[]
  }
  /** The end-to-end loop. */
  flow?: {
    eyebrow: string
    headline: string
    subhead: string
    steps: { index: string; title: string; body: string }[]
    kicker: string
  }
  screens: ScreenSpec[]
  /** Closing / onboarding note from the deck. */
  closing?: { title: string; body: string }
  /** What the interactive replica lets you actually do. */
  tryThis: string[]
}

export const POC = {
  appointment: 'Division Sergeant Major',
  formation: '2 PDF',
  blurb:
    'To find out more about any of these projects, or if your unit is interested in onboarding one, get in touch.',
} as const

export const DECK = {
  title: 'Innovation Projects',
  subtitle: 'Capability Showcase',
  date: '27 July 26',
  classification: 'OFFICIAL / (OPEN)',
} as const

export const PROJECTS: Project[] = [
  {
    id: 'digital-ips',
    index: '01',
    name: 'Digital IPS',
    tagline:
      'Digital workflow for informal punishment reporting, deliberation, and record-keeping.',
    premise:
      'Informal punishment runs on chat threads and goodwill. Digital IPS puts the whole cycle — report, deliberate, record, coordinate — on one rail with the 24-hour mandate built into the clock rather than into someone’s memory.',
    status: 'FormSG + SharePoint pipeline',
    statusShort: 'FormSG + SharePoint',
    statusTone: 'live',
    accent: 'azure',
    capabilities: [
      'Structured intake',
      '24-hour mandate clock',
      'Deliberation with precedent',
      'Automatic downstream tasking',
    ],
    problem: {
      eyebrow: 'Current pain points',
      items: [
        {
          index: '01',
          title: 'Reporting relies on WhatsApp/Telegram',
          body: 'Reports arrive as free text in chat, so nothing is structured, searchable or attributable after the fact.',
        },
        {
          index: '02',
          title: 'Manual follow-up risks missing the 24-hour recording mandate',
          body: 'The clock starts at the incident, but nothing counts it down — the deadline is only noticed once it has passed.',
        },
        {
          index: '03',
          title: 'Deliberation lacks quick access to prior records',
          body: 'Deciding a fair and consistent outcome means remembering what was awarded last time, for a similar offence, by a different commander.',
        },
        {
          index: '04',
          title: 'Downstream coordination requires manual messaging',
          body: 'Extra duty planners and ration indenters are told by hand, one message at a time, and only if someone remembers to send it.',
        },
      ],
    },
    product: {
      eyebrow: 'The product',
      headline: 'One intake. One clock. One record.',
      proofs: [
        'A structured report instead of a chat message',
        'A mandate clock that counts down in the open',
        'Precedent on the deliberation screen, not in someone’s head',
        'Downstream tasking raised the moment an award is made',
      ],
    },
    flow: {
      eyebrow: 'How it works',
      headline: 'From incident to closed record.',
      subhead:
        'The deck’s pipeline — FormSG in, SharePoint list as the register, dashboard on top — with the deliberation and coordination steps that sit between them.',
      steps: [
        { index: '01', title: 'Report', body: 'FormSG intake, structured' },
        { index: '02', title: 'Register', body: 'Lands in the SharePoint list' },
        { index: '03', title: 'Deliberate', body: 'Decide against precedent' },
        { index: '04', title: 'Record', body: 'Award recorded within 24h' },
        { index: '05', title: 'Coordinate', body: 'Downstream tasks raised' },
        { index: '06', title: 'Dashboard', body: 'Unit-level oversight' },
      ],
      kicker:
        'The mandate clock runs from the moment of the incident, not from the moment somebody opens the file.',
    },
    screens: [
      {
        eyebrow: 'Screen 01 · Intake',
        title: 'FormSG — a report, not a chat message',
        callouts: [
          {
            key: 'A',
            title: 'Structured particulars',
            body: 'Subject, unit, offence category and incident time captured as fields, so every report is comparable.',
          },
          {
            key: 'B',
            title: 'The clock starts here',
            body: 'The 24-hour recording mandate is computed from the incident time the moment the form is submitted.',
          },
          {
            key: 'C',
            title: 'Nothing lands half-filled',
            body: 'Mandatory fields are enforced at intake rather than chased afterwards.',
          },
        ],
        demoScreen: 'intake',
        slide: 'intake',
      },
      {
        eyebrow: 'Screen 02 · Register',
        title: 'SharePoint list — every case, one register',
        callouts: [
          {
            key: 'A',
            title: 'Mandate countdown per row',
            body: 'Time remaining against the 24-hour mandate, live, with breaches flagged in red.',
          },
          {
            key: 'B',
            title: 'Filter and search',
            body: 'By stage, by company, by offence — the thing chat threads can never do.',
          },
          {
            key: 'C',
            title: 'Stage at a glance',
            body: 'Reported, under deliberation, awarded, closed — one column, always current.',
          },
        ],
        demoScreen: 'register',
        slide: 'register',
      },
      {
        eyebrow: 'Screen 03 · Deliberation',
        title: 'Decide with precedent on the same screen',
        callouts: [
          {
            key: 'A',
            title: 'Case context locked left',
            body: 'The report, the particulars and the countdown stay in view while you decide.',
          },
          {
            key: 'B',
            title: 'Prior records, matched',
            body: 'Previous awards for the same offence category surface automatically, with what was awarded and by whom.',
          },
          {
            key: 'C',
            title: 'Award and rationale',
            body: 'Both are recorded together — the decision and the reason behind it.',
          },
        ],
        demoScreen: 'deliberate',
        slide: 'deliberate',
      },
      {
        eyebrow: 'Screen 04 · Coordination',
        title: 'Downstream tasking raises itself',
        callouts: [
          {
            key: 'A',
            title: 'Extra duty planner',
            body: 'Extra duties are pushed to the planner with dates already computed from the award.',
          },
          {
            key: 'B',
            title: 'Ration indent',
            body: 'Confinement awards raise a ration indent automatically instead of a manual message.',
          },
          {
            key: 'C',
            title: 'Acknowledged, not assumed',
            body: 'Each downstream party acknowledges in the record, so coordination is provable.',
          },
        ],
        demoScreen: 'coordination',
        slide: 'coordination',
      },
      {
        eyebrow: 'Screen 05 · Oversight',
        title: 'Dashboard — the unit-level view',
        callouts: [
          {
            key: 'A',
            title: 'Counts that answer the obvious questions',
            body: 'How many cases, by offence, by subject, by award — read straight off the register rather than tallied by hand.',
          },
          {
            key: 'B',
            title: 'Execution status',
            body: 'Completed against outstanding, so a commander can see what is still owed rather than only what was decided.',
          },
          {
            key: 'C',
            title: 'One source underneath',
            body: 'The dashboard sits on the same register the intake feeds, so there is no second set of numbers to reconcile.',
          },
        ],
        demoScreen: 'dashboard',
        slide: 'dashboard',
      },
    ],
    tryThis: [
      'File a fresh report on the intake form and watch it appear in the register with a live mandate countdown.',
      'Open a case under deliberation — prior awards for that offence category are pulled in beside it.',
      'Award a punishment and see the extra duty and ration indent tasks raise themselves.',
      'Use the clock control to jump forward and watch a case breach the 24-hour mandate.',
    ],
  },

  {
    id: 'fua-tracker',
    index: '02',
    name: 'FUA Tracker',
    tagline:
      'Centralised tracking of follow-up actions from meetings and conferences.',
    premise:
      'One register. One live status. One audit trail. You only ever type your own update — the app keeps the score.',
    status: 'Data foundations built · app and automation in wiring',
    statusShort: 'In build',
    statusTone: 'build',
    accent: 'brass',
    capabilities: [
      'Parent / subtask roll-up',
      'Append-only audit trail',
      'Teams notification flow',
      'Role-aware navigation',
    ],
    problem: {
      eyebrow: 'The problem',
      items: [
        {
          index: '01',
          title: 'Scattered everywhere',
          body: 'Actions end up in chat threads, inboxes, notebooks and someone’s memory.',
        },
        {
          index: '02',
          title: 'No live single status',
          body: 'Nobody can say at a glance what’s done, what’s late, or what’s stuck.',
        },
        {
          index: '03',
          title: 'Surfaces too late',
          body: 'Overdue items appear only when someone chases — or at the next meeting.',
        },
      ],
    },
    product: {
      eyebrow: 'The product',
      headline: 'One register. One live status. One audit trail.',
      proofs: [
        'One place for every action',
        'A status that’s always current',
        'A complete, tamper-proof record',
      ],
    },
    flow: {
      eyebrow: 'How it works',
      headline: 'One loop, end to end.',
      subhead:
        'From a meeting decision to a closed action — six steps, and most of them run themselves.',
      steps: [
        { index: '01', title: 'Raise', body: 'Leader logs the FUA' },
        { index: '02', title: 'Assign', body: 'Split into subtasks' },
        { index: '03', title: 'Notify', body: 'Teams alerts the assignee' },
        { index: '04', title: 'Update', body: 'Member posts progress' },
        { index: '05', title: 'Roll-up', body: 'Parent status recalculates' },
        { index: '06', title: 'Report', body: 'Dashboards & summary' },
      ],
      kicker:
        'You only ever type your own update. FUA Tracker keeps the score — the current status, the parent roll-up, and the full audit trail.',
    },
    screens: [
      {
        eyebrow: 'Screen 01 · For team leaders',
        title: 'Overview',
        callouts: [
          {
            key: 'A',
            title: 'At-a-glance KPIs',
            body: 'Open, due-soon, overdue and completed — the numbers that matter, up top.',
          },
          {
            key: 'B',
            title: 'Needs Attention',
            body: 'Overdue and blocked subtasks triaged into one list, so nothing slips.',
          },
          {
            key: 'C',
            title: 'Live activity ledger',
            body: 'Every status change, straight from the immutable update log.',
          },
        ],
        demoScreen: 'overview',
        slide: 'overview',
      },
      {
        eyebrow: 'Screen 02 · For everyone',
        title: 'My Subtasks — your personal work queue',
        callouts: [
          {
            key: 'A',
            title: 'Filtered to you',
            body: 'Only the actions assigned to you, grouped by status with live counts.',
          },
          {
            key: 'B',
            title: 'Urgency at a glance',
            body: 'A red edge means overdue; amber means due within seven days.',
          },
          {
            key: 'C',
            title: 'One tap to update',
            body: 'Open any row to post progress — no hunting through lists.',
          },
        ],
        demoScreen: 'my-subtasks',
        slide: 'my-subtasks',
      },
      {
        eyebrow: 'Screen 03 · The one thing you do',
        title: 'Post an update — the record keeps itself',
        callouts: [
          {
            key: 'A',
            title: 'Context locked in',
            body: 'The task, its due date and the last entry sit right beside your input.',
          },
          {
            key: 'B',
            title: 'Status in, status out',
            body: 'Pick the new state; the transition is shown before you commit.',
          },
          {
            key: 'C',
            title: 'Append, never overwrite',
            body: 'Each update is a timestamped, immutable line in the audit trail.',
          },
        ],
        demoScreen: 'my-subtasks',
        slide: 'post-update',
      },
      {
        eyebrow: 'Screen 04 · For team leaders',
        title: 'Raise an FUA — a clear two-step work order',
        callouts: [
          {
            key: 'A',
            title: 'Structured like a work order',
            body: 'Numbered sections: particulars, meeting context, priority & timeline.',
          },
          {
            key: 'B',
            title: 'Can’t commit half-done',
            body: 'A live checklist tracks required fields; commit stays locked until it’s complete.',
          },
          {
            key: 'C',
            title: 'Automatic reference',
            body: 'The FUA number is assigned on commit — no manual numbering to get wrong.',
          },
        ],
        demoScreen: 'raise',
        slide: 'raise',
      },
    ],
    closing: {
      title: 'Use cases & onboarding',
      body: 'The best part: there’s almost nothing to learn. It lives in Teams — open it like any other tab. Where we are: the data foundations are built and tested; the app and the automation you saw are being wired up now.',
    },
    tryThis: [
      'Raise an FUA — the commit button stays locked until the live checklist is satisfied, and the reference number is assigned for you.',
      'Assign subtasks, then switch role to a member and post an update against one of them.',
      'Set a subtask to Blocked and watch the parent status roll up on its own. You never set it by hand.',
      'Open the audit trail — every update is appended, timestamped and impossible to overwrite.',
    ],
  },

  {
    id: 'smartcheck',
    index: '03',
    name: 'SmartCheck',
    tagline:
      'Digital checklist system for recurring compliance and readiness checks.',
    premise:
      'Checks that must happen at a certain time, done on a phone, with photographic evidence attached to the item that raised it — and every window closing as Completed, Missed or Skipped whether anyone acts or not.',
    status: 'Prototype built — to be onboarded to MCC',
    statusShort: 'Prototype built',
    statusTone: 'pilot',
    accent: 'jade',
    capabilities: [
      'Time-boxed check windows',
      'Photo evidence per issue',
      'Append-only submissions',
      'No-code template builder',
    ],
    problem: {
      eyebrow: 'Operational context',
      items: [
        {
          index: '01',
          title: 'Checks are time-bound, not task-bound',
          body: 'Effective for checks that need to be done at certain timings — e.g. BDO / CDO HOTO, Vehicle NMT BOC, Guard Commander HOTO.',
        },
        {
          index: '02',
          title: 'Evidence detaches from the finding',
          body: 'Photographs live in a chat gallery while the finding lives on paper, so nobody can tie one to the other later.',
        },
        {
          index: '03',
          title: 'Misses are invisible',
          body: 'A check that never happened leaves no trace at all — the absence is the thing you most need to see.',
        },
      ],
    },
    product: {
      eyebrow: 'Management & analytics',
      headline: 'Every window closes with an outcome.',
      proofs: [
        'Completed, Missed or Skipped — finalised automatically at the deadline',
        'A reason is mandatory for missed or skipped checks',
        'Skips are excluded from completion rates',
        'Each submission is a new timestamped record — append-only trail',
      ],
    },
    flow: {
      eyebrow: 'Scheduled life cycle',
      headline: 'Issued, active, expired.',
      subhead:
        'Navy is the scheduled and active phase. Gold is the critical path where action is required. Red is a system flag — a missed deadline.',
      steps: [
        {
          index: '01',
          title: 'Issued to phones',
          body: 'Administrator defines the schedule — daily, weekly, monthly, specific time zones. The check is issued to assigned personnel’s phones and is only visible during the scheduled window.',
        },
        {
          index: '02',
          title: 'Active window',
          body: 'The team completes the check on mobile, page by page. Photographs attach directly to any issue raised. All questions are mandatory. Collaborative completion with per-question attribution.',
        },
        {
          index: '03',
          title: 'Window expires',
          body: 'Live states (in progress / skipped) transition to finalised states. The system automatically marks and flags “Missed” checks when the scheduled window closes.',
        },
      ],
      kicker:
        'Checks can be redone any time before the deadline; each submission is a new timestamped record.',
    },
    screens: [
      {
        eyebrow: 'Checker · Report an issue',
        title: 'Raise it where you find it',
        callouts: [
          {
            key: 'A',
            title: 'Flip a switch, raise an issue',
            body: 'Flip “Affects operational readiness” on any item to raise an issue for escalation.',
          },
          {
            key: 'B',
            title: 'Up to five photos per issue',
            body: 'JPEG/PNG, attached to the item — not to a chat thread.',
          },
          {
            key: 'C',
            title: 'Linked and tracked',
            body: 'The issue stays linked to the item and submission, shows as a badge in the checklist, and is tracked until resolved.',
          },
        ],
        demoScreen: 'checker',
        slide: 'checker',
      },
      {
        eyebrow: 'Team · Issue tracker',
        title: 'Open and resolved, across every check',
        callouts: [
          {
            key: 'A',
            title: 'No digging through old checklists',
            body: 'Open and Resolved tabs across every check the team runs.',
          },
          {
            key: 'B',
            title: 'The full provenance',
            body: 'Category, item, photo count, remarks, who raised it and when.',
          },
          {
            key: 'C',
            title: 'Resolve without erasing',
            body: 'Update with new findings or resolve with a resolution label; resolved issues keep their history. The bottom-nav badge counts open issues until the last one is cleared.',
          },
        ],
        demoScreen: 'issues',
        slide: 'issues',
      },
      {
        eyebrow: 'Admin · Dashboard',
        title: 'Live day view, and the history behind it',
        callouts: [
          {
            key: 'A',
            title: 'Any date, stepped through',
            body: 'Completion %, submitted count, open issues and misses for any date — step back through history with the day stepper. Expand a team to see each check’s state for that day.',
          },
          {
            key: 'B',
            title: 'Latest answer per check',
            body: 'Pick a template and an item — see what every team answered last, side by side. Attribution built in: who answered and when, for every row.',
          },
          {
            key: 'C',
            title: 'Problems stand out',
            body: '“Worn · 1 open” — issue flags sit right next to the answers that raised them.',
          },
        ],
        demoScreen: 'dashboard',
        slide: 'dashboard',
      },
      {
        eyebrow: 'Admin · Template builder',
        title: 'Scoring and logic, no code',
        callouts: [
          {
            key: 'A',
            title: 'Visual structure',
            body: 'Pages, sections and typed items, with descriptions and inline images.',
          },
          {
            key: 'B',
            title: 'Scoring & logic, no code',
            body: 'Per-option scores and conditional follow-ups (“when No, ask litres topped up”) configured in place.',
          },
          {
            key: 'C',
            title: 'Draft until published',
            body: 'Duplicate items, pages or whole templates; search across every template.',
          },
        ],
        demoScreen: 'builder',
        slide: 'builder',
      },
      {
        eyebrow: 'Admin · Schedules & notifications',
        title: 'Six patterns, and a nudge before the deadline',
        callouts: [
          {
            key: 'A',
            title: 'Six schedule patterns',
            body: 'Daily, twice-a-day, weekly, monthly, one-time and open — windows live in agency time and may span midnight.',
          },
          {
            key: 'B',
            title: 'Change without losing history',
            body: 'Pause, resume, transfer between teams, or edit a schedule mid-stream.',
          },
          {
            key: 'C',
            title: 'Deadline nudges',
            body: 'Mailing-list email at T–60 and webhooks at T–120 for unsubmitted checks; instant alerts on new issues. “Send data” fires a sample webhook payload with one click.',
          },
        ],
        demoScreen: 'schedules',
        slide: 'schedules',
      },
    ],
    tryThis: [
      'Run a check as the duty team — page by page, all questions mandatory, with the window clock running.',
      'Flip “Affects operational readiness” on an item, attach photos and watch the badge appear in the checklist and the bottom nav.',
      'Skip a check without a reason — it won’t let you. Then let a window expire and watch it finalise as Missed.',
      'Build a template: add a page, add options with scores, and attach a conditional follow-up. Publish it out of draft.',
    ],
  },
]

export const PROJECT_BY_ID = Object.fromEntries(
  PROJECTS.map((p) => [p.id, p]),
) as Record<ProjectId, Project>
