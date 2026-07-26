import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Pill } from '../shared/kit'
import { Chart, Clipboard, Settings, Shield } from '@/components/icons'
import { dayStats, useSc } from './store'
import { AdminDashboard } from './AdminDashboard'
import { TemplateBuilder } from './TemplateBuilder'
import { Schedules } from './Schedules'

export type AdminScreen = 'dashboard' | 'builder' | 'schedules'

const NAV: { id: AdminScreen; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Chart size={15} /> },
  { id: 'builder', label: 'Template builder', icon: <Clipboard size={15} /> },
  { id: 'schedules', label: 'Schedules', icon: <Settings size={15} /> },
]

export function AdminApp({ initialScreen }: { initialScreen?: AdminScreen }) {
  const { state, now } = useSc()
  const [screen, setScreen] = useState<AdminScreen>(initialScreen ?? 'dashboard')

  useEffect(() => {
    if (initialScreen) setScreen(initialScreen)
  }, [initialScreen])

  const stats = dayStats(state, now, now)

  return (
    <div className="flex h-full w-full flex-col bg-bone-100">
      {/* brand bar — navy is the scheduled/active phase, gold is the critical path */}
      <header className="flex h-12 shrink-0 items-center gap-3 bg-[var(--accent)] px-4 text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#c9a227] text-[#12355b]">
          <Shield size={16} />
        </span>
        <div>
          <p className="text-[13px] leading-tight font-semibold">SmartCheck</p>
          <p className="text-[9.5px] tracking-[0.14em] text-white/55 uppercase">
            Administration
          </p>
        </div>
        <span className="ml-4 h-5 w-px bg-white/20" />
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScreen(item.id)}
              className={cn(
                'flex items-center gap-2 rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors',
                screen === item.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:bg-white/10 hover:text-white',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a227]" />
            {stats.completionPct}% today
          </span>
          {stats.openIssues > 0 && (
            <Pill tone="danger" dot>
              {stats.openIssues} open
            </Pill>
          )}
          {stats.missed > 0 && (
            <span className="rounded-sm bg-[#c0392b] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              {stats.missed} missed
            </span>
          )}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-5">
        {screen === 'dashboard' && <AdminDashboard />}
        {screen === 'builder' && <TemplateBuilder />}
        {screen === 'schedules' && <Schedules />}
      </main>
    </div>
  )
}
