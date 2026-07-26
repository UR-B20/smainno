import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { AppShell, Avatar, Pill, THEMES, ToastHost } from '../shared/kit'
import { Chart, Doc, Link, List, Send, Shield } from '@/components/icons'
import { officerById, stats, useIps } from './store'
import { Coordination, Dashboard, Intake, Register } from './screens'
import { Deliberation } from './Deliberation'

export type IpsScreen =
  | 'intake'
  | 'register'
  | 'deliberate'
  | 'coordination'
  | 'dashboard'

const NAV: { id: IpsScreen; label: string; icon: ReactNode; hint: string }[] = [
  { id: 'intake', label: 'File a report', icon: <Doc size={15} />, hint: 'FormSG' },
  { id: 'register', label: 'Case register', icon: <List size={15} />, hint: 'SharePoint list' },
  { id: 'coordination', label: 'Coordination', icon: <Send size={15} />, hint: 'Downstream' },
  { id: 'dashboard', label: 'Dashboard', icon: <Chart size={15} />, hint: 'Oversight' },
]

export function IpsApp({ initialScreen }: { initialScreen?: IpsScreen }) {
  const { state, now } = useIps()
  const [screen, setScreen] = useState<IpsScreen>(initialScreen ?? 'register')
  const [caseId, setCaseId] = useState<string | null>(
    state.cases.find((c) => c.stage === 'deliberation')?.id ?? null,
  )

  useEffect(() => {
    if (initialScreen) setScreen(initialScreen)
  }, [initialScreen])

  const me = officerById(state, state.currentUser)
  const s = stats(state, now)

  const openCase = (id: string) => {
    setCaseId(id)
    setScreen('deliberate')
  }

  return (
    <AppShell theme={THEMES.ips}>
      <ToastHost>
        <div className="flex h-full w-full flex-col">
          {/* classification marking */}
          <div className="flex h-6 shrink-0 items-center justify-center gap-2 bg-[#0d2946] text-white">
            <span className="h-1 w-1 bg-[#c9a227]" />
            <span className="text-[9px] font-semibold tracking-[0.22em] uppercase">
              Official (Closed)
            </span>
            <span className="h-1 w-1 bg-[#c9a227]" />
          </div>

          {/* agency header */}
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-bone-300 bg-white px-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[var(--accent)] text-white">
              <Shield size={17} />
            </span>
            <div>
              <p className="text-[14px] leading-tight font-semibold text-slate-ink">
                Digital IPS
              </p>
              <p className="text-[10px] tracking-[0.1em] text-slate-400 uppercase">
                Informal Punishment System · 15C4I
              </p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {s.breached > 0 && (
                <Pill tone="danger" dot>
                  {s.breached} mandate breach{s.breached === 1 ? '' : 'es'}
                </Pill>
              )}
              {s.pendingAcks > 0 && (
                <Pill tone="warn">{s.pendingAcks} pending acks</Pill>
              )}
              <div className="flex items-center gap-2 border-l border-bone-300 pl-3">
                <div className="text-right">
                  <p className="text-[11.5px] font-medium text-slate-ink">
                    {me.rank} {me.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{me.appt}</p>
                </div>
                <Avatar name={me.name} size={28} />
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
            {/* nav */}
            <nav className="flex w-56 shrink-0 flex-col border-r border-bone-300 bg-bone-50 py-3">
              <div className="px-4 pb-3">
                <span className="label text-slate-400">Pipeline</span>
              </div>
              <ul className="space-y-0.5 px-2">
                {NAV.map((item, i) => {
                  const active =
                    screen === item.id ||
                    (screen === 'deliberate' && item.id === 'register')
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setScreen(item.id)}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left transition-colors',
                          active
                            ? 'bg-[var(--accent-soft)] text-[var(--accent-deep)]'
                            : 'text-slate-600 hover:bg-bone-200',
                        )}
                      >
                        <span className={active ? 'text-[var(--accent)]' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span className="flex-1">
                          <span
                            className={cn(
                              'block text-[12.5px]',
                              active && 'font-semibold',
                            )}
                          >
                            {item.label}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {item.hint}
                          </span>
                        </span>
                        <span className="label text-slate-300">0{i + 1}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-auto px-4 pt-4">
                <div className="rounded-md border border-bone-300 bg-white p-3">
                  <span className="label text-slate-400">Mandate compliance</span>
                  <p
                    className={cn(
                      'numerals mt-1.5 text-2xl font-semibold',
                      s.compliancePct >= 90
                        ? 'text-[#1d6b47]'
                        : s.compliancePct >= 70
                          ? 'text-[#8a5a12]'
                          : 'text-[#a3302a]',
                    )}
                  >
                    {s.compliancePct}%
                  </p>
                  <p className="mt-1 text-[10.5px] leading-snug text-slate-400">
                    {s.withinMandate} of {s.recorded} awards recorded inside 24
                    hours.
                  </p>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Link size={10} /> FormSG → SharePoint → dashboard
                </p>
              </div>
            </nav>

            <main className="min-w-0 flex-1 overflow-hidden bg-bone-100 p-5">
              {screen === 'intake' && <Intake onFiled={openCase} />}
              {screen === 'register' && <Register onOpen={openCase} />}
              {screen === 'coordination' && <Coordination />}
              {screen === 'dashboard' && <Dashboard onOpen={openCase} />}
              {screen === 'deliberate' &&
                (caseId ? (
                  <Deliberation caseId={caseId} onBack={() => setScreen('register')} />
                ) : null)}
            </main>
          </div>
        </div>
      </ToastHost>
    </AppShell>
  )
}
