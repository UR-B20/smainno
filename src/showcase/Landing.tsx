import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useReveal } from '@/hooks/useReveal'
import { scrollToId } from '@/lib/scrollToId'
import {
  ACCENT,
  BtnLink,
  Chip,
  Eyebrow,
  Micro,
  Panel,
  SectionHeader,
} from '@/components/console'
import { ArrowRight, Clock, Layers, Refresh, Users } from '@/components/icons'
import { DECK, PROJECTS } from '@/data/deck'
import type { Project } from '@/data/deck'

const STATUS_TONE = {
  live: 'jade',
  build: 'brass',
  pilot: 'azure',
} as const

export function Landing() {
  useReveal('landing')

  return (
    <main>
      <Hero />
      <ProjectIndex />
      <HowToUse />
    </main>
  )
}

/* ------------------------------------------------------------------ hero */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-field pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full opacity-25 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #c9a227, transparent 68%)' }}
      />
      <div
        className="pointer-events-none absolute top-10 right-0 h-[440px] w-[440px] rounded-full opacity-20 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #2f7fc4, transparent 68%)' }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-900" />

      <div className="relative mx-auto max-w-[1240px] px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24">
        <div className="rise">
          <Eyebrow>{DECK.date}</Eyebrow>
        </div>

        <h1 className="rise mt-8 text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.94] font-medium tracking-[-0.035em] text-[#f2f6fb]">
          {DECK.title}
          <span className="mt-2 block text-brass-400">{DECK.subtitle}</span>
        </h1>

        <div className="rise mt-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-xl text-[16px] leading-relaxed text-[#9db0c8]">
            Three projects, each with a working replica seeded with demo data —
            so you can raise the record, post the update, run the check, and
            watch the deadline pass, rather than read about it.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <BtnLink to="/project/digital-ips" variant="primary" arrow>
              Start with Digital IPS
            </BtnLink>
            <button
              type="button"
              onClick={() => scrollToId('projects')}
              className="inline-flex items-center gap-2 px-2 py-2.5 label-lg text-ink-400 transition-colors hover:text-brass-200"
            >
              All three projects
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* the three projects, as a navigable index */}
        <Panel ticks className="rise mt-16 bg-ink-850/70">
          <div className="flex items-center justify-between gap-4 border-b border-ink-700 px-5 py-3.5 sm:px-7">
            <Micro>Agenda</Micro>
            <Micro>{DECK.classification}</Micro>
          </div>
          <ul className="divide-y divide-ink-800">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/project/${p.id}`}
                  className="group flex flex-col gap-3 px-5 py-6 transition-colors hover:bg-ink-800/50 sm:flex-row sm:items-center sm:gap-7 sm:px-7"
                >
                  <span className="label w-6 shrink-0 text-ink-500 transition-colors group-hover:text-brass-400">
                    {p.index}
                  </span>
                  <span className="w-full shrink-0 sm:w-44">
                    <span
                      className={cn(
                        'block text-[19px] font-medium text-[#eaf1f9] transition-colors',
                        ACCENT[p.accent].hoverText,
                      )}
                    >
                      {p.name}
                    </span>
                    <span className="mt-2 flex items-center gap-1.5">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 shrink-0 rounded-full',
                          ACCENT[p.accent].dot,
                        )}
                      />
                      <span className="label whitespace-nowrap text-ink-500">
                        {p.statusShort}
                      </span>
                    </span>
                  </span>
                  <span className="flex-1 text-[14px] leading-relaxed text-[#8b9ab1]">
                    {p.tagline}
                  </span>
                  <ArrowRight
                    size={17}
                    className="hidden shrink-0 text-ink-500 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brass-400 sm:block"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- projects */

function ProjectIndex() {
  return (
    <section id="projects" className="mx-auto max-w-[1240px] scroll-mt-28 px-5 py-20 sm:px-8">
      <SectionHeader
        eyebrow="The projects"
        title="Three problems, three products."
        lede="Each one replaces something that currently runs on chat threads, memory and goodwill. Open any of them and the replica is right there on the page."
        reveal
      />

      <div className="mt-14 space-y-5">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.id} project={p} delay={i * 90} />
        ))}
      </div>
    </section>
  )
}

function ProjectCard({ project: p, delay }: { project: Project; delay: number }) {
  const a = ACCENT[p.accent]
  return (
    <article
      data-reveal=""
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
      className="group relative border border-ink-700 bg-ink-850/50 transition-colors duration-300 hover:border-ink-600"
    >
      <span
        className={cn(
          'absolute top-0 bottom-0 left-0 w-px transition-all duration-300 group-hover:w-[3px]',
          a.dot,
        )}
        aria-hidden="true"
      />

      <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="label text-ink-500">{p.index}</span>
            <h3 className={cn('text-[28px] leading-none font-medium', a.text)}>
              {p.name}
            </h3>
            <Chip tone={STATUS_TONE[p.statusTone]}>{p.status}</Chip>
          </div>

          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#c0cbdb]">
            {p.tagline}
          </p>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#8b9ab1]">
            {p.premise}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {p.capabilities.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BtnLink to={`/project/${p.id}`} variant="primary" arrow>
              Open the brief & replica
            </BtnLink>
            <BtnLink to={`/demo/${p.id}`} variant="outline">
              Full screen
            </BtnLink>
          </div>
        </div>

        <div className="border-t border-ink-700 pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <Micro>What you can do in the replica</Micro>
          <ul className="mt-4 space-y-3">
            {p.tryThis.slice(0, 3).map((t) => (
              <li key={t} className="flex gap-2.5 text-[13px] leading-relaxed text-[#93a3b9]">
                <span className={cn('mt-2 h-1 w-1 shrink-0 rounded-full', a.dot)} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------ how to use */

const AFFORDANCES = [
  {
    icon: <Clock size={17} />,
    title: 'A clock you can move',
    body: 'Every replica carries a simulated clock. Jump forward an hour or a day and watch a check window expire, a mandate breach, or an amber deadline turn red.',
  },
  {
    icon: <Users size={17} />,
    title: 'Roles you can switch',
    body: 'Sign in as a different person from the toolbar. Menus, permissions and work queues change with the role — the way they do in the real thing.',
  },
  {
    icon: <Refresh size={17} />,
    title: 'A reset that means it',
    body: 'State persists in your browser so you can leave and come back. Reset re-seeds the demo data from scratch whenever you want a clean run.',
  },
  {
    icon: <Layers size={17} />,
    title: 'Records that accumulate',
    body: 'Updates are appended, never overwritten. Post an update, then look at the audit trail — your entry is a new line, and the old one is still there.',
  },
]

function HowToUse() {
  return (
    <section className="border-y border-ink-800 bg-ink-950/40">
      <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8">
        <SectionHeader
          eyebrow="How to use this"
          title="These are not screenshots."
          lede="Each replica is a working application with seeded demo data. Nothing you do here leaves your browser."
          reveal
        />

        <div className="mt-14 grid gap-px border border-ink-700 bg-ink-700 sm:grid-cols-2">
          {AFFORDANCES.map((a, i) => (
            <div
              key={a.title}
              data-reveal=""
              style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}
              className="bg-ink-900 p-7 sm:p-8"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center border border-brass-500/40 text-brass-400">
                {a.icon}
              </span>
              <h3 className="mt-5 text-[17px] font-medium text-[#eaf1f9]">{a.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#8b9ab1]">
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
