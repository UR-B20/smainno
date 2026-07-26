import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { ClassificationBar, Micro } from '@/components/console'
import { DECK, PROJECTS } from '@/data/deck'

function Mark() {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <span
        className="relative flex h-8 w-8 items-center justify-center border border-brass-500/60"
        aria-hidden="true"
      >
        <span className="h-2.5 w-2.5 bg-brass-500 transition-transform duration-300 group-hover:rotate-45" />
        <span className="absolute -top-px -left-px h-1.5 w-1.5 border-t border-l border-brass-400" />
        <span className="absolute -right-px -bottom-px h-1.5 w-1.5 border-r border-b border-brass-400" />
      </span>
      <span className="leading-tight">
        <span className="block label text-[#dbe4f0]">Innovation</span>
        <span className="mt-1 block text-[9px] tracking-[0.16em] text-ink-400 uppercase">
          Projects
        </span>
      </span>
    </Link>
  )
}

export function Layout() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-ink-900">
      <header className="sticky top-0 z-40">
        <ClassificationBar className="bg-ink-950/95 backdrop-blur" />
        <div
          className={cn(
            'border-b transition-colors duration-300',
            scrolled
              ? 'border-ink-700 bg-ink-900/92 backdrop-blur-lg'
              : 'border-transparent bg-transparent',
          )}
        >
          <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-5 sm:px-8">
            <Mark />
            <nav className="ml-auto hidden items-center gap-1 md:flex">
              {PROJECTS.map((p) => (
                <NavLink
                  key={p.id}
                  to={`/project/${p.id}`}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xs px-3 py-2 label transition-colors',
                      isActive
                        ? 'text-brass-300'
                        : 'text-ink-400 hover:text-[#dbe4f0]',
                    )
                  }
                >
                  {p.name}
                </NavLink>
              ))}
              <span className="mx-2 h-3 w-px bg-ink-700" aria-hidden="true" />
              <NavLink
                to="/poc"
                className={({ isActive }) =>
                  cn(
                    'rounded-xs border px-3 py-2 label transition-colors',
                    isActive
                      ? 'border-brass-500/60 bg-brass-900/40 text-brass-300'
                      : 'border-ink-600 text-ink-400 hover:border-brass-500/50 hover:text-brass-200',
                  )
                }
              >
                POC
              </NavLink>
            </nav>
            <span className="ml-auto md:ml-0">
              <Micro className="hidden lg:block">{DECK.date}</Micro>
            </span>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="mt-24 border-t border-ink-700">
        <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Mark />
              <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-[#8b9ab1]">
                Interactive replicas of the three projects. Every screen here
                runs on seeded data held in your own browser.
              </p>
            </div>
            <nav className="flex flex-col gap-2.5">
              <Micro className="mb-1">Projects</Micro>
              {PROJECTS.map((p) => (
                <Link
                  key={p.id}
                  to={`/project/${p.id}`}
                  className="text-[13px] text-[#93a3b9] transition-colors hover:text-brass-200"
                >
                  {p.name}
                </Link>
              ))}
            </nav>
            <nav className="flex flex-col gap-2.5">
              <Micro className="mb-1">Contact</Micro>
              <Link
                to="/poc"
                className="text-[13px] text-[#93a3b9] transition-colors hover:text-brass-200"
              >
                Point of contact
              </Link>
              <Micro className="mt-4 mb-1">Full-screen replicas</Micro>
              {PROJECTS.map((p) => (
                <Link
                  key={p.id}
                  to={`/demo/${p.id}`}
                  className="text-[13px] text-[#93a3b9] transition-colors hover:text-brass-200"
                >
                  {p.name} →
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink-800 pt-6">
            <Micro>{DECK.date}</Micro>
          </div>
        </div>
        <ClassificationBar />
      </footer>
    </div>
  )
}
