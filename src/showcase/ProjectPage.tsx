import { useCallback, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useReveal } from '@/hooks/useReveal'
import { useIsHandheld } from '@/hooks/useMedia'
import {
  ACCENT,
  BtnLink,
  Chip,
  Eyebrow,
  Micro,
  Panel,
  Rule,
  SectionHeader,
} from '@/components/console'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  External,
  Play,
} from '@/components/icons'
import { PROJECTS, PROJECT_BY_ID } from '@/data/deck'
import type { Project, ProjectId, ScreenSpec } from '@/data/deck'
import { FuaTrackerDemo } from '@/demos/fua'
import type { FuaScreen } from '@/demos/fua/FuaApp'
import { SmartCheckDemo } from '@/demos/smartcheck'
import type { ScScreen } from '@/demos/smartcheck'
import { DigitalIpsDemo } from '@/demos/ips'
import type { IpsScreen } from '@/demos/ips/IpsApp'

export function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const project = id ? PROJECT_BY_ID[id as ProjectId] : undefined
  const [screen, setScreen] = useState<string | undefined>(undefined)

  useReveal(id)

  const jumpTo = useCallback((next?: string) => {
    setScreen(next)
    window.requestAnimationFrame(() => {
      document
        .getElementById('replica')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  if (!project) return <Navigate to="/" replace />

  const a = ACCENT[project.accent]

  return (
    <main>
      <ProjectHero project={project} />

      <ReplicaSection project={project} screen={screen} onJump={jumpTo} />

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8">
        <SectionHeader
          index={project.index}
          eyebrow={project.problem.eyebrow}
          title={
            project.id === 'smartcheck'
              ? 'Checks that must happen at a certain time.'
              : 'What it replaces.'
          }
          accent={project.accent}
          reveal
        />

        <div
          className={cn(
            'mt-12 grid gap-px border border-ink-700 bg-ink-700',
            // Column count follows the item count, so the last row is never
            // left with a hollow cell.
            project.problem.items.length % 2 === 1
              ? 'md:grid-cols-3'
              : 'sm:grid-cols-2',
          )}
        >
          {project.problem.items.map((item, i) => (
            <div
              key={item.index}
              data-reveal=""
              style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}
              className="bg-ink-900 p-7 sm:p-9"
            >
              <span className={cn('label', a.text)}>{item.index}</span>
              <h3 className="mt-4 text-[19px] leading-snug font-medium text-[#eaf1f9]">
                {item.title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[#8b9ab1]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {project.product && (
        <section className="border-y border-ink-800 bg-ink-950/40">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
            <div data-reveal="">
              <Eyebrow accent={project.accent}>{project.product.eyebrow}</Eyebrow>
              <h2 className="mt-6 text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.08] font-medium text-[#f2f6fb]">
                {project.product.headline}
              </h2>
              <Rule className="mt-8" />
            </div>
            <ul
              data-reveal=""
              style={{ ['--reveal-delay' as string]: '90ms' }}
              className="space-y-px border border-ink-700 bg-ink-700"
            >
              {project.product.proofs.map((proof) => (
                <li
                  key={proof}
                  className="flex items-start gap-4 bg-ink-900 px-6 py-5"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                      a.border,
                      a.text,
                    )}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="text-[14.5px] leading-relaxed text-[#c0cbdb]">
                    {proof}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {project.flow && (
        <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8">
          <SectionHeader
            eyebrow={project.flow.eyebrow}
            title={project.flow.headline}
            lede={project.flow.subhead}
            accent={project.accent}
            reveal
          />

          <ol className="mt-14 grid gap-px border border-ink-700 bg-ink-700 sm:grid-cols-2 lg:grid-cols-3">
            {project.flow.steps.map((step, i) => (
              <li
                key={step.index}
                data-reveal=""
                style={{ ['--reveal-delay' as string]: `${i * 60}ms` }}
                className="group relative bg-ink-900 p-7"
              >
                <div className="flex items-center gap-3">
                  <span className={cn('label', a.text)}>{step.index}</span>
                  <span className="h-px flex-1 bg-ink-700" />
                  <ChevronRight
                    size={14}
                    className="text-ink-600 transition-colors group-hover:text-brass-400"
                  />
                </div>
                <h3 className="mt-5 text-[18px] font-medium text-[#eaf1f9]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#8b9ab1]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <Panel
            data-reveal=""
            className={cn('mt-5 flex items-start gap-4 p-6', a.bg, a.border)}
          >
            <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', a.dot)} />
            <p className="text-[14.5px] leading-relaxed text-[#dbe4f0]">
              {project.flow.kicker}
            </p>
          </Panel>
        </section>
      )}

      {/* --------------------------------------------------------- screens */}
      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8">
        <SectionHeader
          eyebrow="The screens"
          title="Every screen, and why it looks like that."
          lede="The callouts and the speaker's notes are reproduced from the deck. Each one opens the corresponding screen in the live replica above."
          accent={project.accent}
          reveal
        />

        <div className="mt-14 space-y-4">
          {project.screens.map((screenSpec, i) => (
            <ScreenBlock
              key={screenSpec.title}
              spec={screenSpec}
              project={project}
              index={i}
              onOpen={() => jumpTo(screenSpec.demoScreen)}
            />
          ))}
        </div>
      </section>

      {project.closing && (
        <section className="mx-auto max-w-[1240px] px-5 pb-20 sm:px-8">
          <Panel ticks data-reveal="" className="p-8 sm:p-12">
            <Eyebrow accent={project.accent}>{project.closing.title}</Eyebrow>
            <p className="mt-6 max-w-3xl text-[16px] leading-relaxed text-[#c0cbdb]">
              {project.closing.body}
            </p>
          </Panel>
        </section>
      )}

      <ProjectPager current={project} />
    </main>
  )
}

/* ------------------------------------------------------------------ hero */

function ProjectHero({ project }: { project: Project }) {
  const a = ACCENT[project.accent]
  return (
    <section className="relative overflow-hidden border-b border-ink-800">
      <div className="grid-field pointer-events-none absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: `radial-gradient(circle, ${
            project.accent === 'azure'
              ? '#4f9fe0'
              : project.accent === 'jade'
                ? '#46b083'
                : '#dcbb52'
          }, transparent 68%)`,
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-5 pt-16 pb-14 sm:px-8 sm:pt-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 label text-ink-400 transition-colors hover:text-brass-200"
        >
          <ArrowLeft size={13} /> All projects
        </Link>

        <div className="rise mt-8 flex flex-wrap items-center gap-4">
          <span className="label text-ink-500">{project.index}</span>
          <h1
            className={cn(
              'text-[clamp(2.5rem,6.5vw,4.75rem)] leading-none font-medium tracking-[-0.03em]',
              a.text,
            )}
          >
            {project.name}
          </h1>
        </div>

        <p className="rise mt-7 max-w-2xl text-[17px] leading-relaxed text-[#c0cbdb]">
          {project.tagline}
        </p>
        <p className="rise mt-4 max-w-2xl text-[14.5px] leading-relaxed text-[#8b9ab1]">
          {project.premise}
        </p>

        <div className="rise mt-8 flex flex-wrap items-center gap-2">
          <Chip tone={project.accent === 'brass' ? 'brass' : project.accent}>
            {project.status}
          </Chip>
          {project.capabilities.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>

        <div className="rise mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#replica"
            className="group inline-flex items-center justify-center gap-2 rounded-xs bg-brass-500 px-4 py-2.5 label-lg text-ink-950 transition-all duration-200 hover:bg-brass-400 hover:shadow-[0_0_28px_-8px_var(--color-brass-400)]"
          >
            <Play size={12} />
            Run the replica
          </a>
          <BtnLink to={`/demo/${project.id}`} variant="outline">
            <External size={13} />
            Open full screen
          </BtnLink>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- replica */

function Replica({
  project,
  screen,
}: {
  project: Project
  screen?: string
}) {
  switch (project.id) {
    case 'fua-tracker':
      return <FuaTrackerDemo screen={screen as FuaScreen | undefined} />
    case 'smartcheck':
      return <SmartCheckDemo screen={screen as ScScreen | undefined} />
    case 'digital-ips':
      return <DigitalIpsDemo screen={screen as IpsScreen | undefined} />
  }
}

function ReplicaSection({
  project,
  screen,
  onJump,
}: {
  project: Project
  screen?: string
  onJump: (screen?: string) => void
}) {
  const a = ACCENT[project.accent]
  const handheld = useIsHandheld()

  const chips = project.screens.filter((s) => s.demoScreen)
  const chipLabel = (s: ScreenSpec) =>
    s.eyebrow.split('·').pop()?.trim() ?? s.title

  return (
    <section
      id="replica"
      className="mx-auto max-w-[1420px] scroll-mt-24 px-5 py-14 sm:px-8"
    >
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow accent={project.accent}>Live replica</Eyebrow>
          <h2 className="mt-5 text-[28px] leading-tight font-medium text-[#f2f6fb]">
            Use it, don't just look at it.
          </h2>
        </div>

        {!handheld && (
          <div className="flex flex-wrap gap-2">
            {chips.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => onJump(s.demoScreen)}
                className={cn(
                  'rounded-xs border px-2.5 py-1.5 label transition-colors',
                  screen === s.demoScreen
                    ? cn(a.border, a.text, a.bg)
                    : 'border-ink-600 text-ink-400 hover:border-ink-500 hover:text-[#c9d5e5]',
                )}
              >
                {chipLabel(s)}
              </button>
            ))}
          </div>
        )}
      </div>

      {handheld ? (
        // A 1280px app scaled into a phone column would be unreadable, so the
        // replica opens as its own full-screen app instead.
        <Panel ticks className="bg-ink-850/60">
          <Link
            to={`/demo/${project.id}`}
            className="group flex items-center gap-4 border-b border-ink-700 p-6"
          >
            <span
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xs border',
                a.border,
                a.text,
              )}
            >
              <Play size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-medium text-[#eaf1f9]">
                Open the {project.name} replica
              </span>
              <span className="mt-1 block text-[12.5px] leading-relaxed text-[#8b9ab1]">
                Runs full screen on your phone, with demo data you can change.
              </span>
            </span>
            <ArrowRight
              size={18}
              className="shrink-0 text-ink-500 transition-transform group-hover:translate-x-1"
            />
          </Link>

          <ul className="divide-y divide-ink-800">
            {chips.map((s) => (
              <li key={s.title}>
                <Link
                  to={`/demo/${project.id}?screen=${s.demoScreen}`}
                  className="flex items-center gap-3 px-6 py-3.5"
                >
                  <span className={cn('label shrink-0', a.text)}>
                    {chipLabel(s)}
                  </span>
                  <ChevronRight size={14} className="ml-auto shrink-0 text-ink-500" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <Replica project={project} screen={screen} />
      )}

      <div className="mt-8 border-t border-ink-800 pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <Micro>Try this</Micro>
          <p className="text-[11.5px] text-ink-400">
            State is saved in your browser — <span className="text-brass-300">Reset</span>{' '}
            gives you a clean run, <span className="text-brass-300">+1h / +1d</span>{' '}
            moves the clock.
          </p>
        </div>
        <ol className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          {project.tryThis.map((t, i) => (
            <li key={t} className="flex gap-3 border-t border-ink-800 pt-4">
              <span className={cn('label mt-0.5 shrink-0', a.text)}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[13px] leading-relaxed text-[#93a3b9]">{t}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- screens */

function ScreenBlock({
  spec,
  project,
  index,
  onOpen,
}: {
  spec: ScreenSpec
  project: Project
  index: number
  onOpen: () => void
}) {
  const a = ACCENT[project.accent]
  return (
    <article
      data-reveal=""
      style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}
      className="border border-ink-700 bg-ink-850/40"
    >
      <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div>
          <span className={cn('label', a.text)}>{spec.eyebrow}</span>
          <h3 className="mt-4 text-[22px] leading-snug font-medium text-[#eef3fa]">
            {spec.title}
          </h3>
          {spec.demoScreen && (
            <button
              type="button"
              onClick={onOpen}
              className="group mt-6 inline-flex items-center gap-2 border border-ink-600 px-3 py-2 label text-ink-400 transition-colors hover:border-brass-500/60 hover:text-brass-200"
            >
              Open this screen
              <ArrowRight
                size={13}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          )}
        </div>

        <div>
          <ul className="space-y-5">
            {spec.callouts.map((c) => (
              <li key={c.key} className="flex gap-4">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center border text-[11px] font-semibold',
                    a.border,
                    a.text,
                  )}
                >
                  {c.key}
                </span>
                <div>
                  <p className="text-[14.5px] font-medium text-[#dbe4f0]">{c.title}</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#8b9ab1]">
                    {c.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {spec.narration && (
            <blockquote className="mt-7 border-l-2 border-ink-600 pl-5">
              <Micro className="block">From the speaker's notes</Micro>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[#93a3b9] italic">
                “{spec.narration}”
              </p>
            </blockquote>
          )}
        </div>
      </div>
    </article>
  )
}

/* ----------------------------------------------------------------- pager */

function ProjectPager({ current }: { current: Project }) {
  const i = PROJECTS.findIndex((p) => p.id === current.id)
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length]
  const next = PROJECTS[(i + 1) % PROJECTS.length]

  return (
    <nav className="mx-auto grid max-w-[1240px] gap-px border-y border-ink-700 bg-ink-700 px-0 sm:grid-cols-2">
      {[
        { p: prev, dir: 'Previous' as const },
        { p: next, dir: 'Next' as const },
      ].map(({ p, dir }) => (
        <Link
          key={dir}
          to={`/project/${p.id}`}
          className={cn(
            'group bg-ink-900 px-7 py-8 transition-colors hover:bg-ink-850 sm:px-10',
            dir === 'Next' && 'sm:text-right',
          )}
        >
          <Micro>{dir}</Micro>
          <p
            className={cn(
              'mt-3 flex items-center gap-3 text-[22px] font-medium text-[#eaf1f9] transition-colors',
              ACCENT[p.accent].hoverText,
              dir === 'Next' && 'sm:justify-end',
            )}
          >
            {dir === 'Previous' && (
              <ArrowLeft
                size={17}
                className="text-ink-500 transition-transform group-hover:-translate-x-1"
              />
            )}
            {p.name}
            {dir === 'Next' && (
              <ArrowRight
                size={17}
                className="text-ink-500 transition-transform group-hover:translate-x-1"
              />
            )}
          </p>
          <p className="mt-2 text-[13px] text-[#8b9ab1]">{p.tagline}</p>
        </Link>
      ))}
    </nav>
  )
}
