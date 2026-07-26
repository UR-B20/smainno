import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useReveal } from '@/hooks/useReveal'
import { ACCENT, Eyebrow, Micro, Panel, Rule } from '@/components/console'
import { ArrowRight, User, Users } from '@/components/icons'
import { POC, PROJECTS } from '@/data/deck'

/** Point of contact — for finding out more, or for onboarding a unit. */
export function Poc() {
  useReveal('poc')

  return (
    <main className="relative overflow-hidden">
      <div className="grid-field pointer-events-none absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full opacity-20 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #c9a227, transparent 68%)' }}
      />

      <div className="relative mx-auto max-w-[1240px] px-5 pt-20 pb-24 sm:px-8 sm:pt-28">
        <div className="rise">
          <Eyebrow>Point of contact</Eyebrow>
        </div>

        <h1 className="rise mt-8 max-w-3xl text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.02] font-medium tracking-[-0.03em] text-[#f2f6fb]">
          Want to know more, or bring this to your unit?
        </h1>

        <p className="rise mt-7 max-w-xl text-[16px] leading-relaxed text-[#9db0c8]">
          {POC.blurb}
        </p>

        <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* the contact itself */}
          <Panel ticks data-reveal="" className="bg-ink-850/70 p-8 sm:p-10">
            <Micro>Contact</Micro>
            <Rule className="mt-5" />

            <div className="mt-8 flex items-start gap-5">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center border border-brass-500/50 text-brass-400"
                aria-hidden="true"
              >
                <User size={24} />
              </span>
              <div>
                <p className="text-[26px] leading-tight font-medium text-[#f2f6fb]">
                  {POC.appointment}
                </p>
                <p className="mt-2 text-[18px] font-medium text-brass-400">
                  {POC.formation}
                </p>
              </div>
            </div>

            <p className="mt-8 border-t border-ink-800 pt-6 text-[13.5px] leading-relaxed text-[#8b9ab1]">
              Reach out through your own chain of command, or directly if you
              already have the line. Worth saying which of the three projects you
              are asking about — the onboarding path differs for each.
            </p>
          </Panel>

          {/* which project are you asking about */}
          <div
            data-reveal=""
            style={{ ['--reveal-delay' as string]: '90ms' }}
            className="flex flex-col gap-px border border-ink-700 bg-ink-700"
          >
            <div className="bg-ink-900 px-7 py-5">
              <Micro>Ask about a project</Micro>
            </div>
            {PROJECTS.map((p) => {
              const a = ACCENT[p.accent]
              return (
                <Link
                  key={p.id}
                  to={`/project/${p.id}`}
                  className="group flex flex-1 items-center gap-5 bg-ink-900 px-7 py-6 transition-colors hover:bg-ink-850"
                >
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', a.dot)} />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block text-[17px] font-medium text-[#eaf1f9] transition-colors',
                        a.hoverText,
                      )}
                    >
                      {p.name}
                    </span>
                    <span className="mt-1.5 block text-[12.5px] leading-relaxed text-[#8b9ab1]">
                      {p.status}
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-ink-500 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              )
            })}
          </div>
        </div>

        <Panel
          data-reveal=""
          className="mt-5 flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:gap-6 sm:p-8"
        >
          <Users size={20} className="shrink-0 text-brass-400" />
          <p className="flex-1 text-[14.5px] leading-relaxed text-[#c0cbdb]">
            If you are weighing one of these up, the fastest way to form a view is
            to run the replica first — everything on this site is live and seeded
            with demo data, so you can put it in front of your own people before
            you ask for anything.
          </p>
          <Link
            to="/"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xs border border-ink-600 px-4 py-2.5 label-lg text-[#d6e0ee] transition-colors hover:border-brass-500/70 hover:bg-brass-900/30 hover:text-brass-200"
          >
            Back to the projects
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </Panel>
      </div>
    </main>
  )
}
